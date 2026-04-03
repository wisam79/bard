package cache_test

import (
	"bard/internal/cache"
	"testing"
	"time"
)

func TestNewCache(t *testing.T) {
	c := cache.NewCache()
	if c == nil {
		t.Fatal("NewCache returned nil")
	}
}

func TestCache_SetAndGet(t *testing.T) {
	c := cache.NewCache()

	t.Run("string value", func(t *testing.T) {
		c.Set("key1", "value1", time.Minute)
		
		val, found := c.Get("key1")
		if !found {
			t.Fatal("Expected to find key1")
		}
		if val != "value1" {
			t.Fatalf("Expected value1, got %v", val)
		}
	})

	t.Run("int value", func(t *testing.T) {
		c.Set("key2", 42, time.Minute)
		
		val, found := c.Get("key2")
		if !found {
			t.Fatal("Expected to find key2")
		}
		if val != 42 {
			t.Fatalf("Expected 42, got %v", val)
		}
	})

	t.Run("struct value", func(t *testing.T) {
		type TestStruct struct {
			Name  string
			Value int
		}
		
		expected := TestStruct{Name: "test", Value: 100}
		c.Set("key3", expected, time.Minute)
		
		val, found := c.Get("key3")
		if !found {
			t.Fatal("Expected to find key3")
		}
		if val != expected {
			t.Fatalf("Expected %+v, got %+v", expected, val)
		}
	})

	t.Run("non-existent key", func(t *testing.T) {
		_, found := c.Get("nonexistent")
		if found {
			t.Fatal("Expected not to find nonexistent key")
		}
	})
}

func TestCache_Expiration(t *testing.T) {
	c := cache.NewCache()

	t.Run("expired key", func(t *testing.T) {
		c.Set("expire_key", "value", 100*time.Millisecond)
		
		// Should exist immediately
		_, found := c.Get("expire_key")
		if !found {
			t.Fatal("Expected key to exist immediately")
		}
		
		// Wait for expiration
		time.Sleep(150 * time.Millisecond)
		
		_, found = c.Get("expire_key")
		if found {
			t.Fatal("Expected key to be expired")
		}
	})

	t.Run("non-expired key", func(t *testing.T) {
		c.Set("persistent_key", "value", time.Hour)
		
		// Should still exist after short delay
		time.Sleep(50 * time.Millisecond)
		
		_, found := c.Get("persistent_key")
		if !found {
			t.Fatal("Expected key to still exist")
		}
	})
}

func TestCache_Delete(t *testing.T) {
	c := cache.NewCache()
	
	c.Set("to_delete", "value", time.Minute)
	
	// Verify it exists
	_, found := c.Get("to_delete")
	if !found {
		t.Fatal("Expected key to exist before delete")
	}
	
	// Delete it
	c.Delete("to_delete")
	
	// Verify it's gone
	_, found = c.Get("to_delete")
	if found {
		t.Fatal("Expected key to be deleted")
	}
}

func TestCache_Clear(t *testing.T) {
	c := cache.NewCache()
	
	// Add multiple keys
	c.Set("key1", "value1", time.Minute)
	c.Set("key2", "value2", time.Minute)
	c.Set("key3", "value3", time.Minute)
	
	// Clear all
	c.Clear()
	
	// Verify all are gone
	_, found1 := c.Get("key1")
	_, found2 := c.Get("key2")
	_, found3 := c.Get("key3")
	
	if found1 || found2 || found3 {
		t.Fatal("Expected all keys to be cleared")
	}
}

func TestCache_Stats(t *testing.T) {
	c := cache.NewCache()
	
	// Initial stats should be zero
	hits, misses := c.GetStats()
	if hits != 0 || misses != 0 {
		t.Fatalf("Expected zero stats initially, got hits=%d, misses=%d", hits, misses)
	}
	
	// Add a key
	c.Set("stat_key", "value", time.Hour)
	
	// Get existing key (hit)
	c.Get("stat_key")
	c.Get("stat_key")
	
	// Get non-existent key (miss)
	c.Get("nonexistent1")
	c.Get("nonexistent2")
	c.Get("nonexistent3")
	
	hits, misses = c.GetStats()
	if hits != 2 {
		t.Fatalf("Expected 2 hits, got %d", hits)
	}
	if misses != 3 {
		t.Fatalf("Expected 3 misses, got %d", misses)
	}
}

func TestCache_ClearResetsStats(t *testing.T) {
	c := cache.NewCache()
	
	c.Set("key", "value", time.Hour)
	c.Get("key") // 1 hit
	c.Get("missing") // 1 miss
	
	c.Clear()
	
	hits, misses := c.GetStats()
	if hits != 0 || misses != 0 {
		t.Fatalf("Expected stats to be reset after clear, got hits=%d, misses=%d", hits, misses)
	}
}

func TestCache_ConcurrentAccess(t *testing.T) {
	c := cache.NewCache()
	
	done := make(chan bool)
	
	// Start multiple goroutines writing
	for i := 0; i < 10; i++ {
		go func(id int) {
			for j := 0; j < 100; j++ {
				key := string(rune('a' + id)) + string(rune(j))
				c.Set(key, j, time.Minute)
			}
			done <- true
		}(i)
	}
	
	// Start multiple goroutines reading
	for i := 0; i < 10; i++ {
		go func(id int) {
			for j := 0; j < 100; j++ {
				key := string(rune('a' + id)) + string(rune(j))
				c.Get(key)
			}
			done <- true
		}(i)
	}
	
	// Wait for all goroutines
	for i := 0; i < 20; i++ {
		<-done
	}
	
	// If we reach here without panic, concurrent access is safe
	t.Log("Concurrent access test passed")
}

func TestDashboardCache(t *testing.T) {
	dc := cache.NewDashboardCache()
	
	t.Run("set and get dashboard stats", func(t *testing.T) {
		stats := map[string]interface{}{
			"total_sales": 1000,
			"total_revenue": 50000,
		}
		
		dc.SetDashboardStats(stats)
		
		val, found := dc.GetDashboardStats()
		if !found {
			t.Fatal("Expected to find dashboard stats")
		}
		valMap, ok := val.(map[string]interface{})
		if !ok {
			t.Fatal("Expected map[string]interface{}")
		}
		if valMap["total_sales"] != 1000 || valMap["total_revenue"] != 50000 {
			t.Fatalf("Expected %+v, got %+v", stats, val)
		}
	})

	t.Run("invalidate dashboard stats", func(t *testing.T) {
		stats := map[string]interface{}{"test": "value"}
		dc.SetDashboardStats(stats)
		
		dc.InvalidateDashboardStats()
		
		_, found := dc.GetDashboardStats()
		if found {
			t.Fatal("Expected dashboard stats to be invalidated")
		}
	})
}

func TestProductCache(t *testing.T) {
	pc := cache.NewProductCache()
	
	t.Run("set and get product", func(t *testing.T) {
		product := map[string]interface{}{
			"id": "prod-1",
			"name": "Test Product",
			"price": 100,
		}
		
		pc.SetProduct("prod-1", product)
		
		val, found := pc.GetProduct("prod-1")
		if !found {
			t.Fatal("Expected to find product")
		}
		valMap, ok := val.(map[string]interface{})
		if !ok {
			t.Fatal("Expected map[string]interface{}")
		}
		if valMap["id"] != "prod-1" || valMap["name"] != "Test Product" || valMap["price"] != 100 {
			t.Fatalf("Expected %+v, got %+v", product, val)
		}
	})

	t.Run("set and get categories", func(t *testing.T) {
		categories := []string{"Electronics", "Food", "Clothing"}
		
		pc.SetCategories(categories)
		
		val, found := pc.GetCategories()
		if !found {
			t.Fatal("Expected to find categories")
		}
		valSlice, ok := val.([]string)
		if !ok {
			t.Fatal("Expected []string")
		}
		if len(valSlice) != 3 {
			t.Fatalf("Expected 3 categories, got %d", len(valSlice))
		}
	})

	t.Run("invalidate product", func(t *testing.T) {
		product := map[string]interface{}{"id": "prod-2"}
		pc.SetProduct("prod-2", product)
		
		pc.InvalidateProduct("prod-2")
		
		_, found := pc.GetProduct("prod-2")
		if found {
			t.Fatal("Expected product to be invalidated")
		}
	})

	t.Run("invalidate all products", func(t *testing.T) {
		pc.SetProduct("prod-3", map[string]interface{}{"id": "prod-3"})
		pc.SetCategories([]string{"Cat1"})
		
		pc.InvalidateAllProducts()
		
		_, found1 := pc.GetProduct("prod-3")
		_, found2 := pc.GetCategories()
		
		if found1 || found2 {
			t.Fatal("Expected all product cache to be invalidated")
		}
	})
}

func TestSaleCache(t *testing.T) {
	sc := cache.NewSaleCache()
	
	t.Run("set and get sale", func(t *testing.T) {
		sale := map[string]interface{}{
			"id": "sale-1",
			"total": 500,
		}
		
		sc.SetSale("sale-1", sale)
		
		val, found := sc.GetSale("sale-1")
		if !found {
			t.Fatal("Expected to find sale")
		}
		valMap, ok := val.(map[string]interface{})
		if !ok {
			t.Fatal("Expected map[string]interface{}")
		}
		if valMap["id"] != "sale-1" || valMap["total"] != 500 {
			t.Fatalf("Expected %+v, got %+v", sale, val)
		}
	})

	t.Run("invalidate sale", func(t *testing.T) {
		sale := map[string]interface{}{"id": "sale-2"}
		sc.SetSale("sale-2", sale)
		
		sc.InvalidateSale("sale-2")
		
		_, found := sc.GetSale("sale-2")
		if found {
			t.Fatal("Expected sale to be invalidated")
		}
	})

	t.Run("invalidate all sales", func(t *testing.T) {
		sc.SetSale("sale-3", map[string]interface{}{"id": "sale-3"})
		
		sc.InvalidateAllSales()
		
		_, found := sc.GetSale("sale-3")
		if found {
			t.Fatal("Expected all sales to be invalidated")
		}
	})
}

func TestCustomerCache(t *testing.T) {
	cc := cache.NewCustomerCache()
	
	t.Run("set and get customer", func(t *testing.T) {
		customer := map[string]interface{}{
			"id": "cust-1",
			"name": "John Doe",
		}
		
		cc.SetCustomer("cust-1", customer)
		
		val, found := cc.GetCustomer("cust-1")
		if !found {
			t.Fatal("Expected to find customer")
		}
		valMap, ok := val.(map[string]interface{})
		if !ok {
			t.Fatal("Expected map[string]interface{}")
		}
		if valMap["id"] != "cust-1" || valMap["name"] != "John Doe" {
			t.Fatalf("Expected %+v, got %+v", customer, val)
		}
	})

	t.Run("invalidate customer", func(t *testing.T) {
		customer := map[string]interface{}{"id": "cust-2"}
		cc.SetCustomer("cust-2", customer)
		
		cc.InvalidateCustomer("cust-2")
		
		_, found := cc.GetCustomer("cust-2")
		if found {
			t.Fatal("Expected customer to be invalidated")
		}
	})
}
