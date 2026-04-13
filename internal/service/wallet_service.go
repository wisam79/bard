package service

import (
	"bard/internal/domain"
	"bard/internal/errors"
	"bard/internal/logger"
	"bard/internal/repository"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type WalletService struct {
	repo repository.WalletRepository
	log  *logger.Logger
}

func NewWalletService(repo repository.WalletRepository, log *logger.Logger) *WalletService {
	return &WalletService{repo: repo, log: log}
}

func (s *WalletService) GetByCustomerID(customerID string) (*domain.CustomerWallet, error) {
	wallet, err := s.repo.GetByCustomerID(customerID)
	if err != nil {
		return nil, err
	}
	return wallet, nil
}

func (s *WalletService) CreateWallet(customerID string, creditLimit float64) (*domain.CustomerWallet, error) {
	wallet := &domain.CustomerWallet{
		ID:          uuid.New().String(),
		CustomerID:  customerID,
		Balance:     0,
		CreditLimit: int64(creditLimit),
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	if err := s.repo.Create(wallet); err != nil {
		return nil, err
	}
	s.log.Info("Customer wallet created", "customerID", customerID, "creditLimit", creditLimit)
	return wallet, nil
}

func (s *WalletService) TopUp(customerID string, amount float64, staffID string) error {
	wallet, err := s.repo.GetByCustomerID(customerID)
	if err != nil {
		return err
	}
	wallet.Balance += int64(amount)
	if err := s.repo.Update(wallet); err != nil {
		return err
	}
	tx := &domain.WalletTransaction{
		CustomerID:  customerID,
		Amount:    int64(amount),
		Type:        "topup",
		Description: "شحن المحفظة",
		StaffID:     staffID,
		Timestamp:   time.Now().Unix(),
		CreatedAt:   time.Now(),
	}
	s.log.Info("Wallet topup", "customerID", customerID, "amount", amount)
	return s.repo.CreateTransaction(tx)
}

func (s *WalletService) Debit(customerID string, amount float64, saleID, staffID string) error {
	wallet, err := s.repo.GetByCustomerID(customerID)
	if err != nil {
		return err
	}
	availableBalance := wallet.Balance + wallet.CreditLimit
	if availableBalance < int64(amount) {
		return errors.NewValidationError(domain.ModuleCustomer, "balance", fmt.Sprintf("رصيد غير كافٍ. المتاح: %d", availableBalance))
	}
	wallet.Balance -= int64(amount)
	if err := s.repo.Update(wallet); err != nil {
		return err
	}
	tx := &domain.WalletTransaction{
		CustomerID:  customerID,
		Amount:    int64(amount),
		Type:        "debit",
		ReferenceID: saleID,
		Description: "خصم من المحفظة",
		StaffID:     staffID,
		Timestamp:   time.Now().Unix(),
		CreatedAt:   time.Now(),
	}
	return s.repo.CreateTransaction(tx)
}

func (s *WalletService) UpdateCreditLimit(customerID string, creditLimit float64) error {
	wallet, err := s.repo.GetByCustomerID(customerID)
	if err != nil {
		return err
	}
	wallet.CreditLimit = int64(creditLimit)
	wallet.UpdatedAt = time.Now()
	return s.repo.Update(wallet)
}

func (s *WalletService) SetAutoDebit(customerID string, enabled bool, day int) error {
	wallet, err := s.repo.GetByCustomerID(customerID)
	if err != nil {
		return err
	}
	wallet.AutoDebitEnabled = enabled
	if day > 0 && day <= 28 {
		wallet.AutoDebitDay = day
	}
	wallet.UpdatedAt = time.Now()
	return s.repo.Update(wallet)
}

func (s *WalletService) GetTransactions(customerID string, page, limit int) ([]domain.WalletTransaction, int64, error) {
	return s.repo.GetTransactions(customerID, page, limit)
}
