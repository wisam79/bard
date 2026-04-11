package cache

import (
	"fmt"
	"sync"
	"time"
)

type CacheItem struct {
	Value     interface{}
	ExpiresAt time.Time
}

type Cache struct {
	mu    sync.RWMutex
	items map[string]CacheItem
	stats *CacheStats
}

type CacheStats struct {
	Hits   int64
	Misses int64
}

func NewCache() *Cache {
	c := &Cache{
		items: make(map[string]CacheItem),
		stats: &CacheStats{},
	}
	go c.cleanup()
	return c
}

func (c *Cache) Set(key string, value interface{}, ttl time.Duration) {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.items[key] = CacheItem{
		Value:     value,
		ExpiresAt: time.Now().Add(ttl),
	}
}

func (c *Cache) Get(key string) (interface{}, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	item, found := c.items[key]
	if !found {
		c.stats.Misses++
		return nil, false
	}

	if time.Now().After(item.ExpiresAt) {
		c.stats.Misses++
		return nil, false
	}

	c.stats.Hits++
	return item.Value, true
}

func (c *Cache) Delete(key string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	delete(c.items, key)
}

func (c *Cache) Clear() {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.items = make(map[string]CacheItem)
	c.stats = &CacheStats{}
}

func (c *Cache) GetStats() (hits, misses int64) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.stats.Hits, c.stats.Misses
}

func (c *Cache) cleanup() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		c.mu.Lock()
		now := time.Now()
		for key, item := range c.items {
			if now.After(item.ExpiresAt) {
				delete(c.items, key)
			}
		}
		c.mu.Unlock()
	}
}

// DashboardCache provides caching for dashboard stats
type DashboardCache struct {
	*Cache
}

func NewDashboardCache() *DashboardCache {
	return &DashboardCache{
		Cache: NewCache(),
	}
}

const (
	DashboardStatsTTL = 5 * time.Minute
)

func (c *DashboardCache) GetDashboardStats() (interface{}, bool) {
	return c.Get("dashboard:stats")
}

func (c *DashboardCache) SetDashboardStats(stats interface{}) {
	c.Set("dashboard:stats", stats, DashboardStatsTTL)
}

func (c *DashboardCache) InvalidateDashboardStats() {
	c.Delete("dashboard:stats")
}

// ProductCache provides caching for products
type ProductCache struct {
	*Cache
}

func NewProductCache() *ProductCache {
	return &ProductCache{
		Cache: NewCache(),
	}
}

const (
	ProductListTTL  = 10 * time.Minute
	ProductTTL      = 5 * time.Minute
	CategoryListTTL = 1 * time.Hour
)

func (c *ProductCache) GetProductList(page, limit int, search, category string) (interface{}, bool) {
	key := fmt.Sprintf("products:list:%d:%d:%s:%s", page, limit, search, category)
	return c.Get(key)
}

func (c *ProductCache) SetProductList(page, limit int, search, category string, data interface{}) {
	key := fmt.Sprintf("products:list:%d:%d:%s:%s", page, limit, search, category)
	c.Set(key, data, ProductListTTL)
}

func (c *ProductCache) GetProduct(id string) (interface{}, bool) {
	return c.Get("product:" + id)
}

func (c *ProductCache) SetProduct(id string, product interface{}) {
	c.Set("product:"+id, product, ProductTTL)
}

func (c *ProductCache) GetCategories() (interface{}, bool) {
	return c.Get("categories:list")
}

func (c *ProductCache) SetCategories(categories interface{}) {
	c.Set("categories:list", categories, CategoryListTTL)
}

func (c *ProductCache) InvalidateProduct(id string) {
	c.Delete("product:" + id)
	c.Delete("products:list:")
	c.Delete("categories:list")
}

func (c *ProductCache) InvalidateAllProducts() {
	c.Clear()
}

// SaleCache provides caching for sales
type SaleCache struct {
	*Cache
}

func NewSaleCache() *SaleCache {
	return &SaleCache{
		Cache: NewCache(),
	}
}

const (
	SaleListTTL   = 2 * time.Minute
	SaleDetailTTL = 5 * time.Minute
	RecentSaleTTL = 1 * time.Minute
)

func (c *SaleCache) GetSaleList(page, limit int, search, status string) (interface{}, bool) {
	return c.Get(fmt.Sprintf("sales:list:%d:%s:%s", page, search, status))
}

func (c *SaleCache) SetSaleList(page, limit int, search, status string, data interface{}) {
	c.Set(fmt.Sprintf("sales:list:%d:%s:%s", page, search, status), data, SaleListTTL)
}

func (c *SaleCache) GetSale(id string) (interface{}, bool) {
	return c.Get("sale:" + id)
}

func (c *SaleCache) SetSale(id string, sale interface{}) {
	c.Set("sale:"+id, sale, SaleDetailTTL)
}

func (c *SaleCache) GetRecentSales(limit int) (interface{}, bool) {
	return c.Get(fmt.Sprintf("sales:recent:%d", limit))
}

func (c *SaleCache) SetRecentSales(limit int, sales interface{}) {
	c.Set(fmt.Sprintf("sales:recent:%d", limit), sales, RecentSaleTTL)
}

func (c *SaleCache) InvalidateSale(id string) {
	c.Delete("sale:" + id)
	c.Delete("sales:recent:")
}

func (c *SaleCache) InvalidateAllSales() {
	c.Clear()
}

// CustomerCache provides caching for customers
type CustomerCache struct {
	*Cache
}

func NewCustomerCache() *CustomerCache {
	return &CustomerCache{
		Cache: NewCache(),
	}
}

const (
	CustomerListTTL = 5 * time.Minute
	CustomerTTL     = 10 * time.Minute
)

func (c *CustomerCache) GetCustomerList(page, limit int, search string) (interface{}, bool) {
	return c.Get(fmt.Sprintf("customers:list:%d:%s", page, search))
}

func (c *CustomerCache) SetCustomerList(page, limit int, search string, data interface{}) {
	c.Set(fmt.Sprintf("customers:list:%d:%s", page, search), data, CustomerListTTL)
}

func (c *CustomerCache) GetCustomer(id string) (interface{}, bool) {
	return c.Get("customer:" + id)
}

func (c *CustomerCache) SetCustomer(id string, customer interface{}) {
	c.Set("customer:"+id, customer, CustomerTTL)
}

func (c *CustomerCache) InvalidateCustomer(id string) {
	c.Delete("customer:" + id)
	c.Delete("customers:list:")
}
