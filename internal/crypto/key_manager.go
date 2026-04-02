package crypto

import (
	"os"
	"path/filepath"
)

// KeyManager manages encryption keys securely
type KeyManager struct {
	keyPath string
}

// NewKeyManager creates a new key manager
func NewKeyManager() (*KeyManager, error) {
	configDir, err := os.UserConfigDir()
	if err != nil {
		return nil, err
	}

	appDir := filepath.Join(configDir, "BardPOS")
	if err := os.MkdirAll(appDir, 0755); err != nil {
		return nil, err
	}

	return &KeyManager{
		keyPath: filepath.Join(appDir, ".key"),
	}, nil
}

// GetOrCreateKey gets existing key or creates a new one
func (km *KeyManager) GetOrCreateKey() ([]byte, error) {
	// Try to read existing key
	key, err := os.ReadFile(km.keyPath)
	if err == nil && len(key) == 32 {
		return key, nil
	}

	// Generate new key
	key, err = GenerateKey()
	if err != nil {
		return nil, err
	}

	// Save key with restricted permissions
	if err := os.WriteFile(km.keyPath, key, 0600); err != nil {
		return nil, err
	}

	return key, nil
}

// HasKey checks if encryption key exists
func (km *KeyManager) HasKey() bool {
	key, err := os.ReadFile(km.keyPath)
	return err == nil && len(key) == 32
}

// DeleteKey deletes the encryption key (use with caution)
func (km *KeyManager) DeleteKey() error {
	return os.Remove(km.keyPath)
}
