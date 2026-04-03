import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCart } from './useCart';
import type { Product } from '@/types';

const createProduct = (id: string, price: number, stock: number = 10): Product => ({
  id,
  name: `Product ${id}`,
  barcode: `BARCODE-${id}`,
  price,
  cost: price * 0.5,
  stock,
  minStock: 5,
  category: 'Test',
  wholesalePrice: price * 0.8,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

describe('useCart - Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('extreme values', () => {
    it('handles very large quantities', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(createProduct('1', 1));
        result.current.updateQty('1', 999999);
      });

      expect(result.current.cart[0].qty).toBe(999999);
      expect(result.current.cart[0].total).toBe(999999);
      expect(result.current.itemsCount).toBe(999999);
    });

    it('handles very small decimal prices', () => {
      const { result } = renderHook(() => useCart());

      const product = createProduct('1', 0.01);

      act(() => {
        result.current.addToCart(product);
        result.current.addToCart(product);
        result.current.addToCart(product);
      });

      expect(result.current.subtotal).toBe(0.03);
    });

    it('handles zero price products', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(createProduct('free', 0));
        result.current.addToCart(createProduct('free', 0));
      });

      expect(result.current.subtotal).toBe(0);
      expect(result.current.total).toBe(0);
    });

    it('handles very large discount', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(createProduct('1', 100));
        result.current.setDiscount(1000000);
      });

      expect(result.current.total).toBe(-999900);
    });
  });

  describe('cart operations order', () => {
    it('handles add-remove-add same product', () => {
      const { result } = renderHook(() => useCart());
      const product = createProduct('1', 100);

      act(() => {
        result.current.addToCart(product);
        result.current.removeFromCart('1');
        result.current.addToCart(product);
      });

      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].qty).toBe(1);
    });

    it('handles update quantity to zero then add again', () => {
      const { result } = renderHook(() => useCart());
      const product = createProduct('1', 100);

      act(() => {
        result.current.addToCart(product);
        result.current.updateQty('1', 0);
        result.current.addToCart(product);
      });

      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].qty).toBe(1);
    });

    it('handles multiple rapid quantity updates', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(createProduct('1', 100));
        result.current.updateQty('1', 5);
        result.current.updateQty('1', 10);
        result.current.updateQty('1', 3);
      });

      expect(result.current.cart[0].qty).toBe(3);
      expect(result.current.cart[0].total).toBe(300);
    });
  });

  describe('customer selection', () => {
    it('handles empty customer name', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.setSelectedCustomer('cust-1', '');
      });

      expect(result.current.selectedCustomerId).toBe('cust-1');
      expect(result.current.selectedCustomerName).toBe('');
    });

    it('handles very long customer name', () => {
      const { result } = renderHook(() => useCart());
      const longName = 'A'.repeat(1000);

      act(() => {
        result.current.setSelectedCustomer('cust-1', longName);
      });

      expect(result.current.selectedCustomerName).toBe(longName);
    });

    it('clears customer on clearCart', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(createProduct('1', 100));
        result.current.setSelectedCustomer('cust-1', 'John Doe');
        result.current.clearCart();
      });

      expect(result.current.selectedCustomerId).toBe('');
      expect(result.current.selectedCustomerName).toBe('');
    });
  });

  describe('payment method', () => {
    it('handles all payment methods', () => {
      const { result } = renderHook(() => useCart());

      const methods = ['cash', 'card', 'credit', 'installment', 'split'];

      for (const method of methods) {
        act(() => {
          result.current.setPaymentMethod(method);
        });
        expect(result.current.paymentMethod).toBe(method);
      }
    });

    it('handles empty payment method', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.setPaymentMethod('');
      });

      expect(result.current.paymentMethod).toBe('');
    });
  });

  describe('discount edge cases', () => {
    it('handles negative discount', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(createProduct('1', 100));
        result.current.setDiscount(-50);
      });

      expect(result.current.total).toBe(150);
    });

    it('handles decimal discount', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(createProduct('1', 100));
        result.current.setDiscount(33.33);
      });

      expect(result.current.total).toBe(66.67);
    });

    it('handles discount equal to subtotal', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(createProduct('1', 100));
        result.current.setDiscount(100);
      });

      expect(result.current.total).toBe(0);
    });
  });

  describe('received amount and change', () => {
    it('handles negative received amount', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(createProduct('1', 100));
        result.current.setReceivedAmount(-50);
      });

      expect(result.current.change).toBe(0);
    });

    it('handles received amount exactly equal to total', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(createProduct('1', 100));
        result.current.setReceivedAmount(100);
      });

      expect(result.current.change).toBe(0);
    });

    it('handles very large received amount', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(createProduct('1', 100));
        result.current.setReceivedAmount(1000000);
      });

      expect(result.current.change).toBe(999900);
    });
  });

  describe('zen mode', () => {
    it('toggles zen mode on and off', () => {
      const { result } = renderHook(() => useCart());

      expect(result.current.isZenMode).toBe(false);

      act(() => {
        result.current.setIsZenMode(true);
      });
      expect(result.current.isZenMode).toBe(true);

      act(() => {
        result.current.setIsZenMode(false);
      });
      expect(result.current.isZenMode).toBe(false);
    });

    it('preserves zen mode state during cart operations', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.setIsZenMode(true);
        result.current.addToCart(createProduct('1', 100));
      });

      expect(result.current.isZenMode).toBe(true);
      expect(result.current.cart).toHaveLength(1);
    });
  });

  describe('justAddedId tracking', () => {
    it('clears justAddedId after timeout', async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(createProduct('1', 100));
      });

      expect(result.current.justAddedId).toBe('1');

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current.justAddedId).toBeNull();
      vi.useRealTimers();
    });

    it('updates justAddedId for different products', async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(createProduct('1', 100));
      });
      expect(result.current.justAddedId).toBe('1');

      act(() => {
        result.current.addToCart(createProduct('2', 200));
      });
      expect(result.current.justAddedId).toBe('2');

      vi.useRealTimers();
    });
  });

  describe('setCart direct manipulation', () => {
    it('replaces entire cart', () => {
      const { result } = renderHook(() => useCart());

      const newCart = [
        { product: createProduct('1', 100), qty: 2, discount: 0, total: 200 },
        { product: createProduct('2', 50), qty: 3, discount: 0, total: 150 },
      ];

      act(() => {
        result.current.setCart(newCart);
      });

      expect(result.current.cart).toEqual(newCart);
      expect(result.current.subtotal).toBe(350);
      expect(result.current.itemsCount).toBe(5);
    });

    it('handles empty cart', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(createProduct('1', 100));
        result.current.setCart([]);
      });

      expect(result.current.cart).toHaveLength(0);
      expect(result.current.subtotal).toBe(0);
    });
  });

  describe('multiple products with same price', () => {
    it('handles products with identical prices correctly', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(createProduct('1', 100));
        result.current.addToCart(createProduct('2', 100));
        result.current.addToCart(createProduct('3', 100));
      });

      expect(result.current.cart).toHaveLength(3);
      expect(result.current.subtotal).toBe(300);
    });
  });

  describe('cart with many items', () => {
    it('handles cart with 100+ items', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.addToCart(createProduct(`item-${i}`, i));
        }
      });

      expect(result.current.cart).toHaveLength(100);
      expect(result.current.subtotal).toBeGreaterThan(0);
    });
  });
});
