package service

import (
	"testing"

	"bard/internal/crypto"
	"bard/internal/domain"
	"bard/internal/logger"
	"bard/internal/mocks"

	"github.com/stretchr/testify/assert"
)

func newTestEncryptor(t *testing.T) *crypto.Encryptor {
	t.Helper()
	key := make([]byte, 32) // zero-key is fine for tests
	enc, err := crypto.NewEncryptor(key)
	if err != nil {
		t.Fatalf("failed to create test encryptor: %v", err)
	}
	return enc
}

func TestSettingsService_GetPreferences(t *testing.T) {
	mockRepo := new(mocks.SettingsRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewSettingsService(mockRepo, newTestEncryptor(t), log)

	expected := &domain.AppPreferences{
		StoreName: "Bard Store",
		Currency:  "IQD",
		TaxRate:   15,
	}

	mockRepo.On("GetPreferences").Return(expected, nil)

	result, err := svc.GetPreferences()

	assert.NoError(t, err)
	assert.Equal(t, "Bard Store", result.StoreName)
	assert.Equal(t, "IQD", result.Currency)
	assert.Equal(t, float64(15), result.TaxRate)
	mockRepo.AssertExpectations(t)
}

func TestSettingsService_GetPreferences_Error(t *testing.T) {
	mockRepo := new(mocks.SettingsRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewSettingsService(mockRepo, newTestEncryptor(t), log)

	mockRepo.On("GetPreferences").Return((*domain.AppPreferences)(nil), assert.AnError)

	result, err := svc.GetPreferences()

	assert.Error(t, err)
	assert.Nil(t, result)
	mockRepo.AssertExpectations(t)
}

func TestSettingsService_UpdatePreferences(t *testing.T) {
	mockRepo := new(mocks.SettingsRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewSettingsService(mockRepo, newTestEncryptor(t), log)

	prefs := &domain.AppPreferences{
		StoreName: "Updated Store",
		Currency:  "USD",
		TaxRate:   10,
	}

	mockRepo.On("UpdatePreferences", prefs).Return(nil)

	err := svc.UpdatePreferences(prefs)

	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestSettingsService_UpdatePreferences_Error(t *testing.T) {
	mockRepo := new(mocks.SettingsRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewSettingsService(mockRepo, newTestEncryptor(t), log)

	prefs := &domain.AppPreferences{StoreName: "Test"}

	mockRepo.On("UpdatePreferences", prefs).Return(assert.AnError)

	err := svc.UpdatePreferences(prefs)

	assert.Error(t, err)
	mockRepo.AssertExpectations(t)
}

func TestSettingsService_ResetDatabase(t *testing.T) {
	mockRepo := new(mocks.SettingsRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewSettingsService(mockRepo, newTestEncryptor(t), log)

	mockRepo.On("ResetDatabase").Return(nil)

	err := svc.ResetDatabase()

	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestSettingsService_ResetDatabase_Error(t *testing.T) {
	mockRepo := new(mocks.SettingsRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewSettingsService(mockRepo, newTestEncryptor(t), log)

	mockRepo.On("ResetDatabase").Return(assert.AnError)

	err := svc.ResetDatabase()

	assert.Error(t, err)
	mockRepo.AssertExpectations(t)
}

func TestSettingsService_ExportDatabase(t *testing.T) {
	mockRepo := new(mocks.SettingsRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewSettingsService(mockRepo, newTestEncryptor(t), log)

	expected := &domain.DatabaseExport{
		Products: []domain.Product{{ID: "1", Name: "Product 1"}},
	}

	mockRepo.On("ExportDatabase").Return(expected, nil)

	result, err := svc.ExportDatabase()

	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, 1, len(result.Products))
	mockRepo.AssertExpectations(t)
}

func TestSettingsService_ExportDatabase_Error(t *testing.T) {
	mockRepo := new(mocks.SettingsRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewSettingsService(mockRepo, newTestEncryptor(t), log)

	mockRepo.On("ExportDatabase").Return((*domain.DatabaseExport)(nil), assert.AnError)

	result, err := svc.ExportDatabase()

	assert.Error(t, err)
	assert.Nil(t, result)
	mockRepo.AssertExpectations(t)
}

func TestSettingsService_ImportDatabase(t *testing.T) {
	mockRepo := new(mocks.SettingsRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewSettingsService(mockRepo, newTestEncryptor(t), log)

	data := &domain.DatabaseExport{
		Products: []domain.Product{{ID: "1", Name: "Product 1"}},
	}

	mockRepo.On("ImportDatabase", data).Return(nil)

	err := svc.ImportDatabase(data)

	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestSettingsService_ImportDatabase_Error(t *testing.T) {
	mockRepo := new(mocks.SettingsRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewSettingsService(mockRepo, newTestEncryptor(t), log)

	data := &domain.DatabaseExport{}

	mockRepo.On("ImportDatabase", data).Return(assert.AnError)

	err := svc.ImportDatabase(data)

	assert.Error(t, err)
	mockRepo.AssertExpectations(t)
}
