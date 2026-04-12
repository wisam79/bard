package service

import (
	"testing"

	"bard/internal/domain"
	"bard/internal/logger"
	"bard/internal/mocks"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestShiftService_StartShift_Success(t *testing.T) {
	mockRepo := new(mocks.MockShiftRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewShiftService(mockRepo, log)

	mockRepo.On("GetActive", "staff-1").Return((*domain.Shift)(nil), nil)
	mockRepo.On("Create", mock.AnythingOfType("*domain.Shift")).Return(nil)

	shift, err := svc.StartShift("staff-1", "John Doe", 1000)

	assert.NoError(t, err)
	assert.NotNil(t, shift)
	assert.Equal(t, "staff-1", shift.StaffID)
	assert.Equal(t, "John Doe", shift.StaffName)
	assert.Equal(t, float64(1000), shift.StartCash)
	assert.Equal(t, "active", shift.Status)
	assert.NotEmpty(t, shift.ID)
	mockRepo.AssertExpectations(t)
}

func TestShiftService_StartShift_AlreadyExists(t *testing.T) {
	mockRepo := new(mocks.MockShiftRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewShiftService(mockRepo, log)

	existing := &domain.Shift{ID: "shift-1", StaffID: "staff-1", Status: "active"}

	mockRepo.On("GetActive", "staff-1").Return(existing, nil)

	shift, err := svc.StartShift("staff-1", "John Doe", 1000)

	assert.Error(t, err)
	assert.Nil(t, shift)
	appErr, ok := err.(*domain.AppError)
	assert.True(t, ok)
	assert.Equal(t, "ACTIVE_SHIFT_EXISTS", appErr.Code)
	mockRepo.AssertExpectations(t)
}

func TestShiftService_StartShift_RepoError(t *testing.T) {
	mockRepo := new(mocks.MockShiftRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewShiftService(mockRepo, log)

	mockRepo.On("GetActive", "staff-1").Return((*domain.Shift)(nil), assert.AnError)

	shift, err := svc.StartShift("staff-1", "John Doe", 1000)

	assert.Error(t, err)
	assert.Nil(t, shift)
	mockRepo.AssertExpectations(t)
}

func TestShiftService_CloseShift_Success(t *testing.T) {
	mockRepo := new(mocks.MockShiftRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewShiftService(mockRepo, log)

	existing := &domain.Shift{
		ID:        "shift-1",
		StaffID:   "staff-1",
		StartTime: 1000,
		StartCash: 1000,
		Status:    "active",
	}

	mockRepo.On("GetActive", "shift-1").Return(existing, nil)
	mockRepo.On("Close", mock.AnythingOfType("*domain.Shift")).Return(nil)

	shift, err := svc.CloseShift("shift-1", 1500)

	assert.NoError(t, err)
	assert.NotNil(t, shift)
	assert.Equal(t, float64(1500), shift.EndCash)
	assert.Equal(t, "closed", shift.Status)
	assert.NotZero(t, shift.EndTime)
	mockRepo.AssertExpectations(t)
}

func TestShiftService_CloseShift_NotFound(t *testing.T) {
	mockRepo := new(mocks.MockShiftRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewShiftService(mockRepo, log)

	mockRepo.On("GetActive", "nonexistent").Return((*domain.Shift)(nil), assert.AnError)

	shift, err := svc.CloseShift("nonexistent", 1500)

	assert.Error(t, err)
	assert.Nil(t, shift)
	mockRepo.AssertExpectations(t)
}

func TestShiftService_GetActiveShift(t *testing.T) {
	mockRepo := new(mocks.MockShiftRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewShiftService(mockRepo, log)

	expected := &domain.Shift{ID: "shift-1", StaffID: "staff-1", Status: "active"}

	mockRepo.On("GetActive", "staff-1").Return(expected, nil)

	result, err := svc.GetActiveShift("staff-1")

	assert.NoError(t, err)
	assert.Equal(t, "shift-1", result.ID)
	assert.Equal(t, "active", result.Status)
	mockRepo.AssertExpectations(t)
}

func TestShiftService_GetActiveShift_None(t *testing.T) {
	mockRepo := new(mocks.MockShiftRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewShiftService(mockRepo, log)

	mockRepo.On("GetActive", "staff-1").Return((*domain.Shift)(nil), nil)

	result, err := svc.GetActiveShift("staff-1")

	assert.NoError(t, err)
	assert.Nil(t, result)
	mockRepo.AssertExpectations(t)
}

func TestShiftService_GetShifts(t *testing.T) {
	mockRepo := new(mocks.MockShiftRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewShiftService(mockRepo, log)

	shifts := []domain.Shift{
		{ID: "1", StaffID: "staff-1", Status: "closed"},
		{ID: "2", StaffID: "staff-2", Status: "active"},
	}

	mockRepo.On("GetAll", 1, 20).Return(shifts, int64(2), nil)

	result, total, err := svc.GetShifts(1, 20)

	assert.NoError(t, err)
	assert.Equal(t, int64(2), total)
	assert.Equal(t, 2, len(result))
	mockRepo.AssertExpectations(t)
}

func TestShiftService_GetShifts_InvalidPagination(t *testing.T) {
	mockRepo := new(mocks.MockShiftRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewShiftService(mockRepo, log)

	mockRepo.On("GetAll", 1, 20).Return([]domain.Shift{}, int64(0), nil)

	result, total, err := svc.GetShifts(0, 0)

	assert.NoError(t, err)
	assert.Equal(t, int64(0), total)
	assert.Empty(t, result)
	mockRepo.AssertExpectations(t)
}

func TestShiftService_AddCashMovement(t *testing.T) {
	mockRepo := new(mocks.MockShiftRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewShiftService(mockRepo, log)

	mockRepo.On("AddCashMovement", mock.AnythingOfType("*domain.CashMovement")).Return(nil)

	err := svc.AddCashMovement("shift-1", "staff-1", "add", "Starting cash", 500)

	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestShiftService_AddCashMovement_Remove(t *testing.T) {
	mockRepo := new(mocks.MockShiftRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewShiftService(mockRepo, log)

	mockRepo.On("AddCashMovement", mock.MatchedBy(func(m *domain.CashMovement) bool {
		return m.Type == "remove" && m.Amount == 200
	})).Return(nil)

	err := svc.AddCashMovement("shift-1", "staff-1", "remove", "Cash withdrawal", 200)

	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestShiftService_GetCashMovements(t *testing.T) {
	mockRepo := new(mocks.MockShiftRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewShiftService(mockRepo, log)

	movements := []domain.CashMovement{
		{ID: 1, ShiftID: "shift-1", Type: "add", Amount: 500, Reason: "Starting cash"},
		{ID: 2, ShiftID: "shift-1", Type: "remove", Amount: 200, Reason: "Withdrawal"},
	}

	mockRepo.On("GetCashMovements", "shift-1").Return(movements, nil)

	result, err := svc.GetCashMovements("shift-1")

	assert.NoError(t, err)
	assert.Equal(t, 2, len(result))
	mockRepo.AssertExpectations(t)
}

func TestShiftService_GetCashMovements_Empty(t *testing.T) {
	mockRepo := new(mocks.MockShiftRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewShiftService(mockRepo, log)

	mockRepo.On("GetCashMovements", "shift-1").Return([]domain.CashMovement{}, nil)

	result, err := svc.GetCashMovements("shift-1")

	assert.NoError(t, err)
	assert.Empty(t, result)
	mockRepo.AssertExpectations(t)
}
