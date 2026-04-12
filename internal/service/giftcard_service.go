package service

import (
	"bard/internal/domain"
	"bard/internal/logger"
	"bard/internal/repository"
	"fmt"
	"math/rand"
	"time"

	"github.com/google/uuid"
)

type GiftCardService struct {
	repo repository.GiftCardRepository
	log  *logger.Logger
}

func NewGiftCardService(repo repository.GiftCardRepository, log *logger.Logger) *GiftCardService {
	return &GiftCardService{repo: repo, log: log}
}

func generateGiftCardCode() string {
	const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	code := make([]byte, 12)
	for i := range code {
		code[i] = charset[rand.Intn(len(charset))]
	}
	return string(code[:4]) + "-" + string(code[4:8]) + "-" + string(code[8:12])
}

func (s *GiftCardService) GetAll(page, limit int) ([]domain.GiftCard, int64, error) {
	return s.repo.GetAll(page, limit)
}

func (s *GiftCardService) GetByCode(code string) (*domain.GiftCard, error) {
	return s.repo.GetByCode(code)
}

func (s *GiftCardService) Create(card *domain.GiftCard) error {
	card.ID = uuid.New().String()
	if card.Code == "" {
		card.Code = generateGiftCardCode()
	}
	card.Balance = card.InitialBalance
	card.CreatedAt = time.Now()
	card.UpdatedAt = time.Now()
	s.log.Info("Gift card created", "code", card.Code, "balance", card.InitialBalance)
	return s.repo.Create(card)
}

func (s *GiftCardService) Update(card *domain.GiftCard) error {
	card.UpdatedAt = time.Now()
	return s.repo.Update(card)
}

func (s *GiftCardService) Delete(id string) error {
	return s.repo.Delete(id)
}

func (s *GiftCardService) Redeem(code string, amount float64, saleID, staffID string) error {
	card, err := s.repo.GetByCode(code)
	if err != nil {
		return fmt.Errorf("بطاقة غير صالحة")
	}
	if !card.IsActive {
		return fmt.Errorf("البطاقة غير مفعلة")
	}
	if card.Balance < amount {
		return fmt.Errorf("رصيد البطاقة غير كافٍ")
	}
	if card.ExpiresAt != nil && card.ExpiresAt.Before(time.Now()) {
		return fmt.Errorf("البطاقة منتهية الصلاحية")
	}

	card.Balance -= amount
	if card.Balance <= 0 {
		card.IsActive = false
	}
	if err := s.repo.Update(card); err != nil {
		return err
	}

	tx := &domain.GiftCardTransaction{
		GiftCardID: card.ID,
		Amount:     amount,
		Type:       "redeem",
		SaleID:     saleID,
		StaffID:    staffID,
		Timestamp:  time.Now().Unix(),
		CreatedAt:  time.Now(),
	}
	s.log.Info("Gift card redeemed", "code", code, "amount", amount)
	return s.repo.CreateTransaction(tx)
}

func (s *GiftCardService) TopUp(id string, amount float64, staffID string) error {
	card, err := s.repo.GetByID(id)
	if err != nil {
		return err
	}
	card.Balance += amount
	card.IsActive = true
	if err := s.repo.Update(card); err != nil {
		return err
	}

	tx := &domain.GiftCardTransaction{
		GiftCardID: card.ID,
		Amount:     amount,
		Type:       "topup",
		StaffID:    staffID,
		Timestamp:  time.Now().Unix(),
		CreatedAt:  time.Now(),
	}
	return s.repo.CreateTransaction(tx)
}

func (s *GiftCardService) GetTransactions(cardID string) ([]domain.GiftCardTransaction, error) {
	return s.repo.GetTransactions(cardID)
}

func (s *GiftCardService) GetVouchers() ([]domain.Voucher, error) {
	return s.repo.GetVouchers()
}

func (s *GiftCardService) GetVoucherByCode(code string) (*domain.Voucher, error) {
	return s.repo.GetVoucherByCode(code)
}

func (s *GiftCardService) CreateVoucher(v *domain.Voucher) error {
	v.ID = uuid.New().String()
	v.CreatedAt = time.Now()
	v.UpdatedAt = time.Now()
	v.UsedCount = 0
	s.log.Info("Voucher created", "code", v.Code)
	return s.repo.CreateVoucher(v)
}

func (s *GiftCardService) UpdateVoucher(v *domain.Voucher) error {
	v.UpdatedAt = time.Now()
	return s.repo.UpdateVoucher(v)
}

func (s *GiftCardService) DeleteVoucher(id string) error {
	return s.repo.DeleteVoucher(id)
}

func (s *GiftCardService) ApplyVoucher(code string) (*domain.Voucher, error) {
	voucher, err := s.repo.GetVoucherByCode(code)
	if err != nil {
		return nil, fmt.Errorf("كود الخصم غير صالح")
	}
	if voucher.ExpiresAt != nil && voucher.ExpiresAt.Before(time.Now()) {
		return nil, fmt.Errorf("كود الخصم منتهي الصلاحية")
	}
	if voucher.MaxUses > 0 && voucher.UsedCount >= voucher.MaxUses {
		return nil, fmt.Errorf("كود الخصم استُخدم الحد الأقصى")
	}
	if err := s.repo.IncrementVoucherUsage(voucher.ID); err != nil {
		return nil, err
	}
	return voucher, nil
}
