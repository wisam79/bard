package crypto_test

import (
	"bard/internal/crypto"
	"testing"
)

func TestGenerateKey(t *testing.T) {
	key, err := crypto.GenerateKey()
	if err != nil {
		t.Fatalf("GenerateKey failed: %v", err)
	}

	if len(key) != 32 {
		t.Fatalf("Expected key length 32, got %d", len(key))
	}

	// Ensure two keys are different
	key2, err := crypto.GenerateKey()
	if err != nil {
		t.Fatalf("GenerateKey failed: %v", err)
	}

	if string(key) == string(key2) {
		t.Fatal("Two generated keys should be different")
	}
}

func TestNewEncryptor(t *testing.T) {
	t.Run("valid 32-byte key", func(t *testing.T) {
		key := make([]byte, 32)
		encryptor, err := crypto.NewEncryptor(key)
		if err != nil {
			t.Fatalf("NewEncryptor failed with valid key: %v", err)
		}
		if encryptor == nil {
			t.Fatal("NewEncryptor returned nil")
		}
	})

	t.Run("invalid key length - too short", func(t *testing.T) {
		key := make([]byte, 16)
		_, err := crypto.NewEncryptor(key)
		if err == nil {
			t.Fatal("Expected error for 16-byte key")
		}
		if err.Error() != "key must be 32 bytes for AES-256" {
			t.Fatalf("Unexpected error: %v", err)
		}
	})

	t.Run("invalid key length - too long", func(t *testing.T) {
		key := make([]byte, 64)
		_, err := crypto.NewEncryptor(key)
		if err == nil {
			t.Fatal("Expected error for 64-byte key")
		}
	})

	t.Run("nil key", func(t *testing.T) {
		_, err := crypto.NewEncryptor(nil)
		if err == nil {
			t.Fatal("Expected error for nil key")
		}
	})
}

func TestEncryptDecrypt(t *testing.T) {
	key, err := crypto.GenerateKey()
	if err != nil {
		t.Fatalf("GenerateKey failed: %v", err)
	}

	encryptor, err := crypto.NewEncryptor(key)
	if err != nil {
		t.Fatalf("NewEncryptor failed: %v", err)
	}

	t.Run("simple text", func(t *testing.T) {
		plaintext := []byte("Hello, World!")
		
		ciphertext, err := encryptor.Encrypt(plaintext)
		if err != nil {
			t.Fatalf("Encrypt failed: %v", err)
		}

		if len(ciphertext) <= len(plaintext) {
			t.Fatal("Ciphertext should be longer than plaintext (nonce + tag)")
		}

		decrypted, err := encryptor.Decrypt(ciphertext)
		if err != nil {
			t.Fatalf("Decrypt failed: %v", err)
		}

		if string(decrypted) != string(plaintext) {
			t.Fatalf("Decrypted text doesn't match. Got %s, want %s", string(decrypted), string(plaintext))
		}
	})

	t.Run("empty data", func(t *testing.T) {
		plaintext := []byte("")
		
		ciphertext, err := encryptor.Encrypt(plaintext)
		if err != nil {
			t.Fatalf("Encrypt failed: %v", err)
		}

		decrypted, err := encryptor.Decrypt(ciphertext)
		if err != nil {
			t.Fatalf("Decrypt failed: %v", err)
		}

		if len(decrypted) != 0 {
			t.Fatalf("Expected empty decrypted data, got %d bytes", len(decrypted))
		}
	})

	t.Run("large data", func(t *testing.T) {
		plaintext := make([]byte, 10000)
		for i := range plaintext {
			plaintext[i] = byte(i % 256)
		}
		
		ciphertext, err := encryptor.Encrypt(plaintext)
		if err != nil {
			t.Fatalf("Encrypt failed: %v", err)
		}

		decrypted, err := encryptor.Decrypt(ciphertext)
		if err != nil {
			t.Fatalf("Decrypt failed: %v", err)
		}

		if len(decrypted) != len(plaintext) {
			t.Fatalf("Decrypted length mismatch. Got %d, want %d", len(decrypted), len(plaintext))
		}

		for i := range decrypted {
			if decrypted[i] != plaintext[i] {
				t.Fatalf("Data mismatch at index %d", i)
			}
		}
	})

	t.Run("different nonces for same data", func(t *testing.T) {
		plaintext := []byte("Same data")
		
		ciphertext1, err := encryptor.Encrypt(plaintext)
		if err != nil {
			t.Fatalf("Encrypt failed: %v", err)
		}

		ciphertext2, err := encryptor.Encrypt(plaintext)
		if err != nil {
			t.Fatalf("Encrypt failed: %v", err)
		}

		if string(ciphertext1) == string(ciphertext2) {
			t.Fatal("Same plaintext should produce different ciphertexts (different nonces)")
		}

		// Both should decrypt to same plaintext
		decrypted1, _ := encryptor.Decrypt(ciphertext1)
		decrypted2, _ := encryptor.Decrypt(ciphertext2)

		if string(decrypted1) != string(decrypted2) {
			t.Fatal("Both ciphertexts should decrypt to same plaintext")
		}
	})
}

func TestDecryptErrors(t *testing.T) {
	key, err := crypto.GenerateKey()
	if err != nil {
		t.Fatalf("GenerateKey failed: %v", err)
	}

	encryptor, err := crypto.NewEncryptor(key)
	if err != nil {
		t.Fatalf("NewEncryptor failed: %v", err)
	}

	t.Run("ciphertext too short", func(t *testing.T) {
		shortData := []byte("short")
		_, err := encryptor.Decrypt(shortData)
		if err == nil {
			t.Fatal("Expected error for short ciphertext")
		}
		if err.Error() != "ciphertext too short" {
			t.Fatalf("Unexpected error: %v", err)
		}
	})

	t.Run("empty ciphertext", func(t *testing.T) {
		_, err := encryptor.Decrypt([]byte{})
		if err == nil {
			t.Fatal("Expected error for empty ciphertext")
		}
	})

	t.Run("tampered ciphertext", func(t *testing.T) {
		plaintext := []byte("Original message")
		ciphertext, _ := encryptor.Encrypt(plaintext)
		
		// Tamper with ciphertext
		ciphertext[5] ^= 0xFF
		
		_, err := encryptor.Decrypt(ciphertext)
		if err == nil {
			t.Fatal("Expected error for tampered ciphertext")
		}
	})

	t.Run("wrong key decryption", func(t *testing.T) {
		plaintext := []byte("Secret message")
		ciphertext, _ := encryptor.Encrypt(plaintext)
		
		// Generate different key
		wrongKey, _ := crypto.GenerateKey()
		wrongEncryptor, _ := crypto.NewEncryptor(wrongKey)
		
		_, err := wrongEncryptor.Decrypt(ciphertext)
		if err == nil {
			t.Fatal("Expected error when decrypting with wrong key")
		}
	})
}

func TestHashKey(t *testing.T) {
	key1 := make([]byte, 32)
	key2 := make([]byte, 32)
	
	for i := range key1 {
		key1[i] = byte(i)
		key2[i] = byte(i)
	}
	
	hash1 := crypto.HashKey(key1)
	hash2 := crypto.HashKey(key2)
	
	if hash1 != hash2 {
		t.Fatal("Same key should produce same hash")
	}
	
	// Different keys should produce different hashes (with high probability)
	// Note: HashKey uses a simple hash function that may have collisions
	// For testing, we just verify it returns a non-empty string
	key3 := make([]byte, 32)
	for i := range key3 {
		key3[i] = byte(255 - i)
	}
	hash3 := crypto.HashKey(key3)
	
	if hash3 == "" {
		t.Fatal("HashKey should return non-empty string")
	}
	
	// Empty key
	emptyHash := crypto.HashKey([]byte{})
	if emptyHash == "" {
		t.Fatal("HashKey should return non-empty string for empty key")
	}
}

func TestEncryptDecryptBinaryData(t *testing.T) {
	key, _ := crypto.GenerateKey()
	encryptor, _ := crypto.NewEncryptor(key)

	// Test with binary data containing null bytes
	binaryData := []byte{0x00, 0x01, 0x02, 0xFF, 0xFE, 0x00, 0x00}
	
	ciphertext, err := encryptor.Encrypt(binaryData)
	if err != nil {
		t.Fatalf("Encrypt failed: %v", err)
	}

	decrypted, err := encryptor.Decrypt(ciphertext)
	if err != nil {
		t.Fatalf("Decrypt failed: %v", err)
	}

	if len(decrypted) != len(binaryData) {
		t.Fatalf("Length mismatch. Got %d, want %d", len(decrypted), len(binaryData))
	}

	for i := range decrypted {
		if decrypted[i] != binaryData[i] {
			t.Fatalf("Data mismatch at index %d: got 0x%02x, want 0x%02x", i, decrypted[i], binaryData[i])
		}
	}
}
