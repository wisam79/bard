package utils

import (
	"golang.org/x/crypto/bcrypt"
)

const DefaultCost = 12

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), DefaultCost)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}

func CheckPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func IsHashed(password string) bool {
	return len(password) > 0 && (password[:4] == "$2a$" || password[:4] == "$2b$" || password[:4] == "$2y$")
}
