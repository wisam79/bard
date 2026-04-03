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

describe('useCart - Performance and Stress Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('large cart operations', () => {
    it('handles adding 500 items efficiently', () => {
      const { result } = renderHook(() => useCart());

      const startTime = Date.now();

      act(() => {
        for (let i = 0; i < 500; i++) {
          result.current.addToCart(createProduct(`item-${i}`, i));
        }
      });

      const endTime = Date.now();
      const elapsed = endTime - startTime;

      expect(result.current.cart).toHaveLength(500);
      // Should complete in reasonable time (< 1 second)
      expect(elapsed).toBeLessThan(1000);
    });

    it('handles updating quantities in large cart', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        // Add 100 items
        for (let i = 0; i < 100; i++) {
          result.current.addToCart(createProduct(`item-${i}`, 10));
        }
      });

      const startTime = Date.now();

      act(() => {
        // Update all quantities
        for (let i = 0; i < 100; i++) {
          result.current.updateQty(`item-${i}`, 5);
        }
      });

      const endTime = Date.now();
      const elapsed = endTime - startTime;

      expect(result.current.itemsCount).toBe(500);
      expect(elapsed).toBeLessThan(500);
    });

    it('handles removing items from large cart', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.addToCart(createProduct(`item-${i}`, 10));
        }
      });

      const startTime = Date.now();

      act(() => {
        // Remove every other item
        for (let i = 0; i < 100; i += 2) {
          result.current.removeFromCart(`item-${i}`);
        }
      });

      const endTime = Date.now();
      const elapsed = endTime - startTime;

      expect(result.current.cart).toHaveLength(50);
      expect(elapsed).toBeLessThan(500);
    });
  });

  describe('rapid state updates', () => {
    it('handles 1000 rapid add/remove cycles', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        for (let i = 0; i < 1000; i++) {
          result.current.addToCart(createProduct('temp', 10));
          result.current.removeFromCart('temp');
        }
      });

      expect(result.current.cart).toHaveLength(0);
      expect(result.current.subtotal).toBe(0);
    });

    it('handles rapid discount changes', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(createProduct('1', 100));
      });

      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.setDiscount(i);
        }
      });

      expect(result.current.discount).toBe(99);
      expect(result.current.total).toBe(1);
    });

    it('handles rapid payment method switches', () => {
      const { result } = renderHook(() => useCart());

      const methods = ['cash', 'card', 'credit', 'installment', 'split'];

      act(() => {
        for (let i = 0; i < 500; i++) {
          result.current.setPaymentMethod(methods[i % methods.length]);
        }
      });

      expect(result.current.paymentMethod).toBe('split');
    });
  });

  describe('memory efficiency', () => {
    it('clears cart completely', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.addToCart(createProduct(`item-${i}`, i));
        }
        result.current.setDiscount(50);
        result.current.setReceivedAmount(1000);
        result.current.setSelectedCustomer('cust-1', 'Test Customer');
        result.current.setPaymentMethod('credit');
      });

      const beforeCount = result.current.cart.length;
      expect(beforeCount).toBe(100);

      act(() => {
        result.current.clearCart();
      });

      expect(result.current.cart).toHaveLength(0);
      expect(result.current.discount).toBe(0);
      expect(result.current.receivedAmount).toBe(0);
      expect(result.current.selectedCustomerId).toBe('');
      // Note: clearCart doesn't reset paymentMethod
      expect(result.current.paymentMethod).toBe('credit');
    });

    it('replaces cart efficiently', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.addToCart(createProduct(`old-${i}`, i));
        }
      });

      const newCart = Array.from({ length: 50 }, (_, i) => ({
        product: createProduct(`new-${i}`, i),
        qty: 1,
        discount: 0,
        total: i,
      }));

      act(() => {
        result.current.setCart(newCart);
      });

      expect(result.current.cart).toHaveLength(50);
      expect(result.current.cart[0].product.id).toBe('new-0');
    });
  });

  describe('concurrent-like operations', () => {
    it('handles interleaved operations', async () => {
      const { result } = renderHook(() => useCart());

      const operations = [
        () => result.current.addToCart(createProduct('a', 10)),
        () => result.current.addToCart(createProduct('b', 20)),
        () => result.current.updateQty('a', 5),
        () => result.current.addToCart(createProduct('c', 30)),
        () => result.current.removeFromCart('b'),
        () => result.current.setDiscount(10),
        () => result.current.setReceivedAmount(100),
        () => result.current.updateQty('a', 3),
        () => result.current.addToCart(createProduct('d', 40)),
        () => result.current.setPaymentMethod('card'),
      ];

      act(() => {
        operations.forEach(op => op());
      });

      expect(result.current.cart).toHaveLength(3); // a, c, d
      expect(result.current.cart.find(c => c.product.id === 'a')?.qty).toBe(3);
      expect(result.current.discount).toBe(10);
      expect(result.current.receivedAmount).toBe(100);
      expect(result.current.paymentMethod).toBe('card');
    });
  });

  describe('extreme numeric values', () => {
    it('handles maximum safe integer for quantity', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(createProduct('1', 1));
        result.current.updateQty('1', Number.MAX_SAFE_INTEGER);
      });

      expect(result.current.cart[0].qty).toBe(Number.MAX_SAFE_INTEGER);
    });

    it('handles very small decimal prices', () => {
      const { result } = renderHook(() => useCart());

      const tinyPriceProduct: Product = {
        ...createProduct('tiny', 0.000001),
        price: 0.000001,
      };

      act(() => {
        result.current.addToCart(tinyPriceProduct);
        result.current.addToCart(tinyPriceProduct);
        result.current.addToCart(tinyPriceProduct);
      });

      expect(result.current.subtotal).toBe(0.000003);
    });

    it('handles Number.MAX_VALUE for discount', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(createProduct('1', 100));
        result.current.setDiscount(Number.MAX_VALUE);
      });

      expect(result.current.discount).toBe(Number.MAX_VALUE);
      // Total will be negative infinity
      expect(result.current.total).toBeLessThan(0);
    });

    it('handles NaN gracefully', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(createProduct('1', 100));
        // This might produce NaN in some calculations
        result.current.setDiscount(NaN as any);
      });

      // Should not crash
      expect(result.current.discount).toBeNaN();
    });

    it('handles Infinity for received amount', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(createProduct('1', 100));
        result.current.setReceivedAmount(Infinity);
      });

      expect(result.current.receivedAmount).toBe(Infinity);
      expect(result.current.change).toBe(Infinity);
    });
  });

  describe('cart state consistency', () => {
    it('maintains consistent state after many operations', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        // Add items
        for (let i = 0; i < 50; i++) {
          result.current.addToCart(createProduct(`item-${i}`, 10));
        }

        // Update some quantities
        for (let i = 0; i < 25; i++) {
          result.current.updateQty(`item-${i}`, 2);
        }

        // Remove some items
        for (let i = 25; i < 50; i++) {
          result.current.removeFromCart(`item-${i}`);
        }

        // Set discount
        result.current.setDiscount(100);

        // Set received amount
        result.current.setReceivedAmount(1000);
      });

      // Verify state consistency
      const cart = result.current.cart;
      const calculatedSubtotal = cart.reduce((sum, item) => sum + item.total, 0);
      const calculatedItemsCount = cart.reduce((sum, item) => sum + item.qty, 0);

      expect(cart).toHaveLength(25);
      expect(result.current.subtotal).toBe(calculatedSubtotal);
      expect(result.current.itemsCount).toBe(calculatedItemsCount);
      // total = subtotal - discount = 500 - 100 = 400 (25 items * 10 * 2 qty = 500)
      expect(result.current.total).toBe(400);
      // change = received - total = 1000 - 400 = 600
      expect(result.current.change).toBe(600);
    });

    it('maintains consistency with customer selection', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(createProduct('1', 100));
        result.current.setSelectedCustomer('cust-1', 'Customer 1');
        result.current.setDiscount(10);
        result.current.setReceivedAmount(150);
      });

      expect(result.current.selectedCustomerId).toBe('cust-1');
      expect(result.current.selectedCustomerName).toBe('Customer 1');
      expect(result.current.subtotal).toBe(100);
      expect(result.current.discount).toBe(10);
      expect(result.current.total).toBe(90);
      expect(result.current.change).toBe(60);
    });
  });

  describe('edge case sequences', () => {
    it('handles add-update-remove-add same product', () => {
      const { result } = renderHook(() => useCart());
      const product = createProduct('1', 100);

      act(() => {
        result.current.addToCart(product);
        result.current.updateQty('1', 5);
        result.current.removeFromCart('1');
        result.current.addToCart(product);
        result.current.updateQty('1', 10);
      });

      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].qty).toBe(10);
      expect(result.current.cart[0].total).toBe(1000);
    });

    it('handles clear-then-operations', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(createProduct('1', 100));
        result.current.addToCart(createProduct('2', 200));
        result.current.clearCart();
        result.current.addToCart(createProduct('3', 300));
      });

      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].product.id).toBe('3');
      expect(result.current.subtotal).toBe(300);
    });

    it('handles setCart-then-operations', () => {
      const { result } = renderHook(() => useCart());

      const newCart = [
        { product: createProduct('1', 100), qty: 2, discount: 0, total: 200 },
      ];

      act(() => {
        result.current.setCart(newCart);
        result.current.addToCart(createProduct('2', 50));
      });

      expect(result.current.cart).toHaveLength(2);
      expect(result.current.subtotal).toBe(250);
    });
  });
});
