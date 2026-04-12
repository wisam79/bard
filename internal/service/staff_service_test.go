package service

import (
	"testing"

	"bard/internal/domain"
	"bard/internal/errors"
	"bard/internal/logger"
	"bard/internal/mocks"
	"bard/pkg/utils"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestStaffService_GetAll(t *testing.T) {
	mockRepo := new(mocks.MockStaffRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewStaffService(mockRepo, log)

	staff := []domain.Staff{
		{ID: "1", Username: "admin", Name: "Admin", Role: "admin"},
		{ID: "2", Username: "cashier1", Name: "Cashier", Role: "cashier"},
	}

	mockRepo.On("GetAll").Return(staff, nil)

	result, err := svc.GetAll()

	assert.NoError(t, err)
	assert.Equal(t, 2, len(result))
	mockRepo.AssertExpectations(t)
}

func TestStaffService_GetByID(t *testing.T) {
	mockRepo := new(mocks.MockStaffRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewStaffService(mockRepo, log)

	expected := &domain.Staff{ID: "staff-1", Username: "admin", Name: "Admin", Role: "admin"}
	mockRepo.On("GetByID", "staff-1").Return(expected, nil)

	result, err := svc.GetByID("staff-1")

	assert.NoError(t, err)
	assert.Equal(t, "staff-1", result.ID)
	assert.Equal(t, "admin", result.Username)
	mockRepo.AssertExpectations(t)
}

func TestStaffService_Create(t *testing.T) {
	mockRepo := new(mocks.MockStaffRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewStaffService(mockRepo, log)

	staff := &domain.Staff{
		Username: "newuser",
		Name:     "New User",
		Role:     "cashier",
		Password: "plaintext123",
	}

	mockRepo.On("Create", mock.AnythingOfType("*domain.Staff")).Return(nil)

	err := svc.Create(staff)

	assert.NoError(t, err)
	assert.NotEmpty(t, staff.ID)
	assert.NotZero(t, staff.CreatedAt)
	assert.NotEqual(t, "plaintext123", staff.Password, "Password should be hashed")
	assert.True(t, utils.IsHashed(staff.Password), "Password should be a bcrypt hash")
	mockRepo.AssertExpectations(t)
}

func TestStaffService_Create_Validation(t *testing.T) {
	tests := []struct {
		name    string
		staff   *domain.Staff
		wantErr bool
		field   string
	}{
		{
			name: "empty username",
			staff: &domain.Staff{
				Username: "",
				Name:     "Test",
				Role:     "cashier",
			},
			wantErr: true,
			field:   "username",
		},
		{
			name: "whitespace only username",
			staff: &domain.Staff{
				Username: "   ",
				Name:     "Test",
				Role:     "cashier",
			},
			wantErr: true,
			field:   "username",
		},
		{
			name: "empty name",
			staff: &domain.Staff{
				Username: "user1",
				Name:     "",
				Role:     "cashier",
			},
			wantErr: true,
			field:   "name",
		},
		{
			name: "empty role",
			staff: &domain.Staff{
				Username: "user1",
				Name:     "Test User",
				Role:     "",
			},
			wantErr: true,
			field:   "role",
		},
		{
			name: "valid staff",
			staff: &domain.Staff{
				Username: "user1",
				Name:     "Test User",
				Role:     "cashier",
				Password: "pass123",
			},
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := new(mocks.MockStaffRepository)
			log := logger.New(logger.LevelInfo, false)
			svc := NewStaffService(mockRepo, log)

			if !tt.wantErr {
				mockRepo.On("Create", mock.AnythingOfType("*domain.Staff")).Return(nil)
			}

			err := svc.Create(tt.staff)

			if tt.wantErr {
				assert.Error(t, err)
				assert.True(t, errors.IsValidationError(err))
			} else {
				assert.NoError(t, err)
			}
			mockRepo.AssertExpectations(t)
		})
	}
}

func TestStaffService_Create_EmptyPassword(t *testing.T) {
	mockRepo := new(mocks.MockStaffRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewStaffService(mockRepo, log)

	staff := &domain.Staff{
		Username: "nopassword",
		Name:     "No Password",
		Role:     "cashier",
		Password: "",
	}

	mockRepo.On("Create", mock.AnythingOfType("*domain.Staff")).Return(nil)

	err := svc.Create(staff)

	assert.NoError(t, err)
	assert.Empty(t, staff.Password, "Empty password should remain empty")
	mockRepo.AssertExpectations(t)
}

func TestStaffService_Create_AlreadyHashedPassword(t *testing.T) {
	mockRepo := new(mocks.MockStaffRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewStaffService(mockRepo, log)

	hashedPw, _ := utils.HashPassword("mypassword")
	staff := &domain.Staff{
		Username: "hashed",
		Name:     "Hashed User",
		Role:     "admin",
		Password: hashedPw,
	}

	mockRepo.On("Create", mock.AnythingOfType("*domain.Staff")).Return(nil)

	err := svc.Create(staff)

	assert.NoError(t, err)
	assert.Equal(t, hashedPw, staff.Password, "Already hashed password should not be re-hashed")
	mockRepo.AssertExpectations(t)
}

func TestStaffService_Update(t *testing.T) {
	mockRepo := new(mocks.MockStaffRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewStaffService(mockRepo, log)

	staff := &domain.Staff{
		ID:       "staff-1",
		Name:     "Updated Admin",
		Password: "newpassword",
	}

	mockRepo.On("Update", mock.AnythingOfType("*domain.Staff")).Return(nil)

	err := svc.Update(staff)

	assert.NoError(t, err)
	assert.NotEqual(t, "newpassword", staff.Password, "Password should be hashed on update")
	assert.True(t, utils.IsHashed(staff.Password))
	mockRepo.AssertExpectations(t)
}

func TestStaffService_Update_PreservePassword(t *testing.T) {
	mockRepo := new(mocks.MockStaffRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewStaffService(mockRepo, log)

	existing := &domain.Staff{
		ID:       "staff-1",
		Name:     "Admin",
		Password: "$2a$12$existinghash",
	}

	staff := &domain.Staff{
		ID:       "staff-1",
		Name:     "Updated Admin",
		Password: "",
	}

	mockRepo.On("GetByID", "staff-1").Return(existing, nil)
	mockRepo.On("Update", mock.MatchedBy(func(s *domain.Staff) bool {
		return s.Password == "$2a$12$existinghash"
	})).Return(nil)

	err := svc.Update(staff)

	assert.NoError(t, err)
	assert.Equal(t, "$2a$12$existinghash", staff.Password, "Empty password should be preserved from existing")
	mockRepo.AssertExpectations(t)
}

func TestStaffService_Update_EmptyName(t *testing.T) {
	mockRepo := new(mocks.MockStaffRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewStaffService(mockRepo, log)

	staff := &domain.Staff{
		ID:       "staff-1",
		Name:     "",
		Password: "pass",
	}

	err := svc.Update(staff)

	assert.Error(t, err)
	assert.True(t, errors.IsValidationError(err))
}

func TestStaffService_Delete(t *testing.T) {
	mockRepo := new(mocks.MockStaffRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewStaffService(mockRepo, log)

	mockRepo.On("Delete", "staff-1").Return(nil)

	err := svc.Delete("staff-1")

	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestStaffService_Authenticate_Success(t *testing.T) {
	mockRepo := new(mocks.MockStaffRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewStaffService(mockRepo, log)

	expected := &domain.Staff{ID: "staff-1", Username: "admin", Role: "admin", IsActive: true}
	mockRepo.On("Authenticate", "admin", "password123").Return(expected, nil)

	result, err := svc.Authenticate("admin", "password123")

	assert.NoError(t, err)
	assert.Equal(t, "admin", result.Username)
	mockRepo.AssertExpectations(t)
}

func TestStaffService_Authenticate_Failure(t *testing.T) {
	mockRepo := new(mocks.MockStaffRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewStaffService(mockRepo, log)

	mockRepo.On("Authenticate", "admin", "wrongpassword").Return((*domain.Staff)(nil), assert.AnError)

	result, err := svc.Authenticate("admin", "wrongpassword")

	assert.Error(t, err)
	assert.Nil(t, result)
	mockRepo.AssertExpectations(t)
}

func TestStaffService_UpdatePassword_Success(t *testing.T) {
	mockRepo := new(mocks.MockStaffRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewStaffService(mockRepo, log)

	hashedPw, _ := utils.HashPassword("oldpassword")
	existing := &domain.Staff{
		ID:       "staff-1",
		Password: hashedPw,
	}

	mockRepo.On("GetByID", "staff-1").Return(existing, nil)
	mockRepo.On("UpdatePassword", "staff-1", mock.AnythingOfType("string")).Return(nil)

	err := svc.UpdatePassword("staff-1", "oldpassword", "newpassword")

	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestStaffService_UpdatePassword_WrongOldPassword(t *testing.T) {
	mockRepo := new(mocks.MockStaffRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewStaffService(mockRepo, log)

	hashedPw, _ := utils.HashPassword("correctpassword")
	existing := &domain.Staff{
		ID:       "staff-1",
		Password: hashedPw,
	}

	mockRepo.On("GetByID", "staff-1").Return(existing, nil)

	err := svc.UpdatePassword("staff-1", "wrongoldpassword", "newpassword")

	assert.Error(t, err)
	assert.True(t, errors.IsValidationError(err))
}

func TestStaffService_UpdatePassword_StaffNotFound(t *testing.T) {
	mockRepo := new(mocks.MockStaffRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewStaffService(mockRepo, log)

	mockRepo.On("GetByID", "nonexistent").Return((*domain.Staff)(nil), assert.AnError)

	err := svc.UpdatePassword("nonexistent", "old", "new")

	assert.Error(t, err)
}

func TestStaffService_UpdatePassword_ClearMustChangePassword(t *testing.T) {
	mockRepo := new(mocks.MockStaffRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewStaffService(mockRepo, log)

	hashedPw, _ := utils.HashPassword("oldpassword")
	existing := &domain.Staff{
		ID:                 "staff-1",
		Password:           hashedPw,
		MustChangePassword: true,
	}

	mockRepo.On("GetByID", "staff-1").Return(existing, nil)
	mockRepo.On("UpdatePassword", "staff-1", mock.AnythingOfType("string")).Return(nil)
	mockRepo.On("UpdateFields", "staff-1", mock.MatchedBy(func(fields map[string]interface{}) bool {
		return fields["must_change_password"] == false
	})).Return(nil)

	err := svc.UpdatePassword("staff-1", "oldpassword", "newpassword")

	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}
