package crypto

import (
	"database/sql/driver"
	"encoding/hex"
	"errors"
	"fmt"
)

// GlobalEncryptor must be initialized at startup for SecureString to work.
var GlobalEncryptor *Encryptor

// SecureString is a custom string type that automatically encrypts its contents
// before saving to the database and decrypts when reading from the database.
type SecureString string

// Value implements the driver.Valuer interface for database writes
func (s SecureString) Value() (driver.Value, error) {
	if s == "" {
		return "", nil
	}
	if GlobalEncryptor == nil {
		return nil, errors.New("GlobalEncryptor not initialized")
	}

	ciphertext, err := GlobalEncryptor.Encrypt([]byte(s))
	if err != nil {
		return nil, fmt.Errorf("failed to encrypt SecureString: %w", err)
	}

	// Store as hex string so it fits safely in standard SQLite TEXT fields
	return hex.EncodeToString(ciphertext), nil
}

// Scan implements the sql.Scanner interface for database reads
func (s *SecureString) Scan(value interface{}) error {
	if value == nil {
		*s = ""
		return nil
	}
	if GlobalEncryptor == nil {
		return errors.New("GlobalEncryptor not initialized")
	}

	var hexStr string
	switch v := value.(type) {
	case string:
		hexStr = v
	case []byte:
		hexStr = string(v)
	default:
		return fmt.Errorf("incompatible type for SecureString: %T", value)
	}

	if hexStr == "" {
		*s = ""
		return nil
	}

	ciphertext, err := hex.DecodeString(hexStr)
	if err != nil {
		// If it's not valid hex, it might be an old unencrypted value.
		// For backward compatibility, we can fall back to the raw value.
		*s = SecureString(hexStr)
		return nil
	}

	plaintext, err := GlobalEncryptor.Decrypt(ciphertext)
	if err != nil {
		// If decryption fails (e.g. wrong key, or it was actually unencrypted plain text that happened to be hex),
		// returning the raw value as fallback might be risky, but we'll return error for safety.
		return fmt.Errorf("failed to decrypt SecureString: %w", err)
	}

	*s = SecureString(plaintext)
	return nil
}

// String implements the stringer interface, safely returning the unencrypted value
// for normal application use.
func (s SecureString) String() string {
	return string(s)
}
