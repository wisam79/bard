package service

import (
	"bard/internal/domain"
	"bard/internal/logger"
	"bard/internal/repository"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type CurrencyService struct {
	repo repository.CurrencyRepository
	log  *logger.Logger
}

func NewCurrencyService(repo repository.CurrencyRepository, log *logger.Logger) *CurrencyService {
	return &CurrencyService{repo: repo, log: log}
}

func (s *CurrencyService) GetAll() ([]domain.Currency, error) {
	return s.repo.GetAll()
}

func (s *CurrencyService) GetByCode(code string) (*domain.Currency, error) {
	return s.repo.GetByCode(code)
}

func (s *CurrencyService) GetBaseCurrency() (*domain.Currency, error) {
	return s.repo.GetBaseCurrency()
}

func (s *CurrencyService) Create(currency *domain.Currency) error {
	if currency.Code == "" || currency.Name == "" {
		return fmt.Errorf("رمز واسم العملة مطلوبان")
	}
	currency.ID = uuid.New().String()
	currency.CreatedAt = time.Now()
	currency.UpdatedAt = time.Now()
	s.log.Info("Currency created", "code", currency.Code)
	return s.repo.Create(currency)
}

func (s *CurrencyService) Update(currency *domain.Currency) error {
	currency.UpdatedAt = time.Now()
	return s.repo.Update(currency)
}

func (s *CurrencyService) Delete(id string) error {
	return s.repo.Delete(id)
}

func (s *CurrencyService) Convert(amount float64, fromCode, toCode string) (float64, *domain.Currency, *domain.Currency, error) {
	from, err := s.repo.GetByCode(fromCode)
	if err != nil {
		return 0, nil, nil, fmt.Errorf("عملة المصدر غير صالحة")
	}
	to, err := s.repo.GetByCode(toCode)
	if err != nil {
		return 0, nil, nil, fmt.Errorf("عملة الهدف غير صالحة")
	}
	if from.ExchangeRate == 0 {
		return 0, nil, nil, fmt.Errorf("سعر الصرف للمصدر غير صالح")
	}
	baseAmount := amount / from.ExchangeRate
	converted := baseAmount * to.ExchangeRate
	return converted, from, to, nil
}

func (s *CurrencyService) RecordTransaction(saleID, fromCurrency, toCurrency string, fromAmount, toAmount, appliedRate float64, staffID string) error {
	tx := &domain.CurrencyTransaction{
		SaleID:       saleID,
		FromCurrency: fromCurrency,
		ToCurrency:   toCurrency,
		FromAmount:   int64(fromAmount),
		ToAmount:     int64(toAmount),
		AppliedRate:  appliedRate,
		StaffID:      staffID,
		Timestamp:    time.Now().Unix(),
		CreatedAt:    time.Now(),
	}
	return s.repo.CreateTransaction(tx)
}

func (s *CurrencyService) GetTransactions(saleID string) ([]domain.CurrencyTransaction, error) {
	return s.repo.GetTransactions(saleID)
}

func (s *CurrencyService) UpdateExchangeRate(code string, rate float64) error {
	currency, err := s.repo.GetByCode(code)
	if err != nil {
		return err
	}
	currency.ExchangeRate = rate
	currency.UpdatedAt = time.Now()
	s.log.Info("Exchange rate updated", "code", code, "rate", rate)
	return s.repo.Update(currency)
}
