package utils

import (
	"testing"
)

func TestHashPassword(t *testing.T) {
	password := "testpassword123"
	hash, err := HashPassword(password)
	if err != nil {
		t.Fatalf("HashPassword failed: %v", err)
	}

	if hash == "" {
		t.Fatal("HashPassword returned empty hash")
	}

	if hash == password {
		t.Fatal("HashPassword returned the same password as hash")
	}
}

func TestCheckPassword(t *testing.T) {
	password := "testpassword123"
	hash, err := HashPassword(password)
	if err != nil {
		t.Fatalf("HashPassword failed: %v", err)
	}

	if !CheckPassword(password, hash) {
		t.Fatal("CheckPassword should return true for correct password")
	}

	if CheckPassword("wrongpassword", hash) {
		t.Fatal("CheckPassword should return false for wrong password")
	}
}

func TestIsHashed(t *testing.T) {
	password := "plaintext"
	hash, _ := HashPassword(password)

	if IsHashed(password) {
		t.Fatal("IsHashed should return false for plain text password")
	}

	if !IsHashed(hash) {
		t.Fatal("IsHashed should return true for hashed password")
	}

	if IsHashed("") {
		t.Fatal("IsHashed should return false for empty string")
	}
}

func TestHashPasswordDifferentSalts(t *testing.T) {
	password := "samepassword"
	hash1, err := HashPassword(password)
	if err != nil {
		t.Fatalf("HashPassword failed: %v", err)
	}

	hash2, err := HashPassword(password)
	if err != nil {
		t.Fatalf("HashPassword failed: %v", err)
	}

	if hash1 == hash2 {
		t.Fatal("Two hashes of the same password should be different (different salts)")
	}

	if !CheckPassword(password, hash1) || !CheckPassword(password, hash2) {
		t.Fatal("Both hashes should verify against the original password")
	}
}
