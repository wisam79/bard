package crypto

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"io"
)

// Encryptor provides AES-256-GCM encryption
type Encryptor struct {
	cipher cipher.AEAD
}

// NewEncryptor creates a new encryptor with the given key
func NewEncryptor(key []byte) (*Encryptor, error) {
	if len(key) != 32 {
		return nil, errors.New("key must be 32 bytes for AES-256")
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	return &Encryptor{cipher: gcm}, nil
}

// Encrypt encrypts data using AES-256-GCM
// Returns: nonce + ciphertext
func (e *Encryptor) Encrypt(data []byte) ([]byte, error) {
	nonce := make([]byte, e.cipher.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, err
	}

	// Seal appends ciphertext to nonce
	ciphertext := e.cipher.Seal(nonce, nonce, data, nil)
	return ciphertext, nil
}

// Decrypt decrypts data using AES-256-GCM
func (e *Encryptor) Decrypt(data []byte) ([]byte, error) {
	if len(data) < e.cipher.NonceSize() {
		return nil, errors.New("ciphertext too short")
	}

	nonce, ciphertext := data[:e.cipher.NonceSize()], data[e.cipher.NonceSize():]
	return e.cipher.Open(nil, nonce, ciphertext, nil)
}

// GenerateKey generates a random 256-bit key
func GenerateKey() ([]byte, error) {
	key := make([]byte, 32)
	if _, err := io.ReadFull(rand.Reader, key); err != nil {
		return nil, err
	}
	return key, nil
}

// HashKey hashes the key for storage verification using SHA-256
func HashKey(key []byte) string {
	hash := sha256.Sum256(key)
	return hex.EncodeToString(hash[:])
}
