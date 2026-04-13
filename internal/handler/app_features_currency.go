package handler

import (
	"bard/internal/domain"
)

func (a *App) GetCurrencies() ([]domain.Currency, error) {
	return a.currency.GetAll()
}

func (a *App) GetCurrencyByCode(code string) (*domain.Currency, error) {
	return a.currency.GetByCode(code)
}

func (a *App) GetBaseCurrency() (*domain.Currency, error) {
	return a.currency.GetBaseCurrency()
}

func (a *App) CreateCurrency(token string, currency domain.Currency) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.currency.Create(&currency)
}

func (a *App) UpdateCurrency(token string, currency domain.Currency) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.currency.Update(&currency)
}

func (a *App) DeleteCurrency(token string, id string) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.currency.Delete(id)
}

func (a *App) ConvertCurrency(amount float64, fromCode, toCode string) (float64, error) {
	converted, _, _, err := a.currency.Convert(amount, fromCode, toCode)
	return converted, err
}

func (a *App) UpdateExchangeRate(token string, code string, rate float64) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.currency.UpdateExchangeRate(code, rate)
}

func (a *App) GetCurrencyTransactions(saleID string) ([]domain.CurrencyTransaction, error) {
	return a.currency.GetTransactions(saleID)
}
