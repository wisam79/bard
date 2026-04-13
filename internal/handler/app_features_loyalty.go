package handler

import (
	"bard/internal/domain"
	"bard/internal/middleware"
)

func (a *App) GetLoyaltyTiers() ([]domain.LoyaltyTier, error) {
	return a.loyalty.GetTiers()
}

func (a *App) CreateLoyaltyTier(token string, tier domain.LoyaltyTier) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.loyalty.CreateTier(&tier)
}

func (a *App) UpdateLoyaltyTier(token string, tier domain.LoyaltyTier) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.loyalty.UpdateTier(&tier)
}

func (a *App) DeleteLoyaltyTier(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.loyalty.DeleteTier(id)
}

func (a *App) GetLoyaltyRules() ([]domain.LoyaltyRule, error) {
	return a.loyalty.GetRules()
}

func (a *App) CreateLoyaltyRule(token string, rule domain.LoyaltyRule) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.loyalty.CreateRule(&rule)
}

func (a *App) UpdateLoyaltyRule(token string, rule domain.LoyaltyRule) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.loyalty.UpdateRule(&rule)
}

func (a *App) GetLoyaltyTransactions(customerID string) ([]domain.LoyaltyTransaction, error) {
	return a.loyalty.GetTransactions(customerID)
}

func (a *App) RedeemLoyaltyPoints(token string, customerID string, points int, rewardType string, rewardValue float64) error {
	staff, ok := a.authMiddleware.GetStaff(token)
	if !ok {
		return &domain.AppError{Module: domain.ModuleStaff, Code: "UNAUTHORIZED", Message: "لم يتم تسجيل الدخول"}
	}
	return a.loyalty.RedeemPoints(customerID, points, rewardType, rewardValue, staff.ID)
}

func (a *App) GetGiftCards(page, limit int) ([]domain.GiftCard, int64, error) {
	return a.giftCard.GetAll(page, limit)
}

func (a *App) GetGiftCardByCode(code string) (*domain.GiftCard, error) {
	return a.giftCard.GetByCode(code)
}

func (a *App) CreateGiftCard(token string, card domain.GiftCard) error {
	if err := a.checkPermission(token, middleware.PermViewFinance); err != nil {
		return err
	}
	return a.giftCard.Create(&card)
}

func (a *App) UpdateGiftCard(token string, card domain.GiftCard) error {
	if err := a.checkPermission(token, middleware.PermViewFinance); err != nil {
		return err
	}
	return a.giftCard.Update(&card)
}

func (a *App) DeleteGiftCard(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermViewFinance); err != nil {
		return err
	}
	return a.giftCard.Delete(id)
}

func (a *App) RedeemGiftCard(token string, code string, amount float64, saleID string) error {
	staff, ok := a.authMiddleware.GetStaff(token)
	if !ok {
		return &domain.AppError{Module: domain.ModuleStaff, Code: "UNAUTHORIZED", Message: "لم يتم تسجيل الدخول"}
	}
	return a.giftCard.Redeem(code, amount, saleID, staff.ID)
}

func (a *App) TopUpGiftCard(token string, id string, amount float64) error {
	staff, ok := a.authMiddleware.GetStaff(token)
	if !ok {
		return &domain.AppError{Module: domain.ModuleStaff, Code: "UNAUTHORIZED", Message: "لم يتم تسجيل الدخول"}
	}
	return a.giftCard.TopUp(id, amount, staff.ID)
}

func (a *App) GetGiftCardTransactions(cardID string) ([]domain.GiftCardTransaction, error) {
	return a.giftCard.GetTransactions(cardID)
}

func (a *App) GetVouchers() ([]domain.Voucher, error) {
	return a.giftCard.GetVouchers()
}

func (a *App) CreateVoucher(token string, v domain.Voucher) error {
	if err := a.checkPermission(token, middleware.PermViewFinance); err != nil {
		return err
	}
	return a.giftCard.CreateVoucher(&v)
}

func (a *App) UpdateVoucher(token string, v domain.Voucher) error {
	if err := a.checkPermission(token, middleware.PermViewFinance); err != nil {
		return err
	}
	return a.giftCard.UpdateVoucher(&v)
}

func (a *App) DeleteVoucher(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermViewFinance); err != nil {
		return err
	}
	return a.giftCard.DeleteVoucher(id)
}

func (a *App) ApplyVoucher(code string) (*domain.Voucher, error) {
	return a.giftCard.ApplyVoucher(code)
}
