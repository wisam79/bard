package middleware

import (
	"testing"
	"time"
)

func TestRateLimiterAllow(t *testing.T) {
	rl := NewRateLimiter(3, time.Minute, 5*time.Minute)

	// First request should be allowed
	allowed, _ := rl.Allow("user1")
	if !allowed {
		t.Fatal("First request should be allowed")
	}

	// Record attempts
	rl.Record("user1")
	rl.Record("user1")
	rl.Record("user1")

	// Fourth attempt should be blocked
	allowed, duration := rl.Allow("user1")
	if allowed {
		t.Fatal("Fourth request should be blocked")
	}
	if duration == 0 {
		t.Fatal("Blocked request should have a duration")
	}
}

func TestRateLimiterReset(t *testing.T) {
	rl := NewRateLimiter(2, time.Minute, 5*time.Minute)

	rl.Record("user1")
	rl.Record("user1")

	// Should be blocked
	allowed, _ := rl.Allow("user1")
	if allowed {
		t.Fatal("Should be blocked after max attempts")
	}

	// Reset
	rl.Reset("user1")

	// Should be allowed again
	allowed, _ = rl.Allow("user1")
	if !allowed {
		t.Fatal("Should be allowed after reset")
	}
}

func TestRateLimiterWindowExpiration(t *testing.T) {
	rl := NewRateLimiter(2, 100*time.Millisecond, 5*time.Minute)

	rl.Record("user1")
	rl.Record("user1")

	// Should be blocked
	allowed, _ := rl.Allow("user1")
	if allowed {
		t.Fatal("Should be blocked")
	}

	// Wait for window to expire
	time.Sleep(150 * time.Millisecond)

	// Should be allowed again
	allowed, _ = rl.Allow("user1")
	if !allowed {
		t.Fatal("Should be allowed after window expiration")
	}
}

func TestRateLimiterDifferentUsers(t *testing.T) {
	rl := NewRateLimiter(2, time.Minute, 5*time.Minute)

	rl.Record("user1")
	rl.Record("user1")

	// user1 should be blocked
	allowed, _ := rl.Allow("user1")
	if allowed {
		t.Fatal("user1 should be blocked")
	}

	// user2 should be allowed
	allowed, _ = rl.Allow("user2")
	if !allowed {
		t.Fatal("user2 should be allowed")
	}
}
