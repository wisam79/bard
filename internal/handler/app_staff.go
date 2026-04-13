package handler

import (
	"bard/internal/audit"
	"bard/internal/domain"
	"bard/internal/middleware"
	"fmt"
)

func (a *App) Login(username, password string) (*domain.Staff, error) {
	allowed, retryAfter := a.rateLimiter.Allow(username)
	if !allowed {
		return nil, &domain.AppError{
			Module:  domain.ModuleStaff,
			Code:    "TOO_MANY_ATTEMPTS",
			Message: fmt.Sprintf("محاولات كثيرة جداً. حاول بعد %.0f دقيقة", retryAfter.Minutes()),
		}
	}

	staff, err := a.staff.Authenticate(username, password)
	if err != nil {
		a.rateLimiter.Record(username)
		return nil, err
	}

	a.rateLimiter.Reset(username)
	token := a.authMiddleware.CreateSession(staff)
	staff.Token = token
	return staff, nil
}

func (a *App) Logout(token string) error {
	a.authMiddleware.DestroySession(token)
	return nil
}

func (a *App) GetStaff(token string) ([]domain.Staff, error) {
	if err := a.checkPermission(token, middleware.PermManageStaff); err != nil {
		return nil, err
	}
	return a.staff.GetAll()
}

func (a *App) CreateStaff(token string, staff domain.Staff) error {
	if err := a.checkPermission(token, middleware.PermManageStaff); err != nil {
		return err
	}
	return a.staff.Create(&staff)
}

func (a *App) UpdateStaff(token string, staff domain.Staff) error {
	if err := a.checkPermission(token, middleware.PermManageStaff); err != nil {
		return err
	}
	return a.staff.Update(&staff)
}

func (a *App) DeleteStaff(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermManageStaff); err != nil {
		return err
	}
	return a.staff.Delete(id)
}

func (a *App) ChangePassword(token, oldPassword, newPassword string) error {
	staff, ok := a.authMiddleware.GetStaff(token)
	if !ok {
		return &domain.AppError{
			Module:  domain.ModuleStaff,
			Code:    "UNAUTHORIZED",
			Message: "لم يتم تسجيل الدخول",
		}
	}

	a.audit.LogStaffAction(a.ctx, audit.ActionPasswordChange, staff.ID, staff.ID, staff.Name, "Password changed")
	return a.staff.UpdatePassword(staff.ID, oldPassword, newPassword)
}

func (a *App) GetStaffPerformance(staffID, periodStart, periodEnd string) (*domain.StaffPerformance, error) {
	return a.commission.GetStaffPerformance(staffID, periodStart, periodEnd)
}

func (a *App) GetAllStaffPerformance(periodStart, periodEnd string) ([]domain.StaffPerformance, error) {
	return a.commission.GetAllStaffPerformance(periodStart, periodEnd)
}
