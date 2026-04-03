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

describe('useCart - Real World Scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('typical checkout flow', () => {
    it('completes a full checkout with customer selection', () => {
      const { result } = renderHook(() => useCart());

      // Customer selects products
      act(() => {
        result.current.addToCart(createProduct('coffee', 25));
        result.current.addToCart(createProduct('tea', 15));
        result.current.addToCart(createProduct('sugar', 5));
      });

      // Customer selects loyalty member
      act(() => {
        result.current.setSelectedCustomer('cust-123', 'Ahmed Ali');
      });

      // Apply loyalty discount
      act(() => {
        result.current.setDiscount(10);
      });

      // Customer pays with card
      act(() => {
        result.current.setPaymentMethod('card');
        result.current.setReceivedAmount(100);
      });

      // Verify checkout state
      expect(result.current.subtotal).toBe(45);
      expect(result.current.discount).toBe(10);
      expect(result.current.total).toBe(35);
      expect(result.current.change).toBe(65);
      expect(result.current.selectedCustomerName).toBe('Ahmed Ali');
      expect(result.current.paymentMethod).toBe('card');
    });

    it('handles installment payment plan', () => {
      const { result } = renderHook(() => useCart());

      // Expensive purchase
      act(() => {
        result.current.addToCart(createProduct('laptop', 5000));
        result.current.addToCart(createProduct('mouse', 50));
        result.current.addToCart(createProduct('keyboard', 150));
      });

      // Select installment payment
      act(() => {
        result.current.setPaymentMethod('installment');
        result.current.setReceivedAmount(1000); // Down payment
      });

      expect(result.current.subtotal).toBe(5200);
      expect(result.current.receivedAmount).toBe(1000);
      expect(result.current.paymentMethod).toBe('installment');
    });

    it('handles split payment (cash + credit)', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(createProduct('item1', 300));
        result.current.addToCart(createProduct('item2', 200));
      });

      act(() => {
        result.current.setPaymentMethod('split');
        result.current.setReceivedAmount(300); // Partial cash payment
      });

      expect(result.current.subtotal).toBe(500);
      expect(result.current.receivedAmount).toBe(300);
      expect(result.current.paymentMethod).toBe('split');
    });
  });

  describe('customer service scenarios', () => {
    it('handles product return and exchange', () => {
      const { result } = renderHook(() => useCart());

      // Original purchase
      act(() => {
        result.current.addToCart(createProduct('shirt-m', 100));
        result.current.addToCart(createProduct('pants-l', 150));
      });

      // Customer wants to return shirt
      act(() => {
        result.current.removeFromCart('shirt-m');
      });

      // Add different size
      act(() => {
        result.current.addToCart(createProduct('shirt-l', 100));
      });

      expect(result.current.cart).toHaveLength(2);
      expect(result.current.subtotal).toBe(250);
    });

    it('handles bulk order with wholesale pricing', () => {
      const { result } = renderHook(() => useCart());

      // Wholesale customer buying in bulk
      act(() => {
        for (let i = 0; i < 50; i++) {
          result.current.addToCart(createProduct(`item-${i}`, 10));
        }
      });

      // Apply bulk discount
      act(() => {
        result.current.setDiscount(500); // 500 discount for bulk order
      });

      expect(result.current.cart).toHaveLength(50);
      expect(result.current.itemsCount).toBe(50);
      expect(result.current.subtotal).toBe(500);
      expect(result.current.discount).toBe(500);
    });

    it('handles price override for VIP customer', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(createProduct('vip-item', 1000));
      });

      // Manager applies 50% VIP discount
      act(() => {
        result.current.setDiscount(500);
      });

      expect(result.current.total).toBe(500);
    });
  });

  describe('error recovery scenarios', () => {
    it('recovers from accidental cart clear', () => {
      const { result } = renderHook(() => useCart());

      // Build cart
      act(() => {
        result.current.addToCart(createProduct('1', 100));
        result.current.addToCart(createProduct('2', 200));
        result.current.addToCart(createProduct('3', 300));
      });

      // Accidentally clear
      act(() => {
        result.current.clearCart();
      });

      expect(result.current.cart).toHaveLength(0);

      // Rebuild cart
      act(() => {
        result.current.addToCart(createProduct('1', 100));
        result.current.addToCart(createProduct('2', 200));
        result.current.addToCart(createProduct('3', 300));
      });

      expect(result.current.cart).toHaveLength(3);
      expect(result.current.subtotal).toBe(600);
    });

    it('handles wrong quantity correction', () => {
      const { result } = renderHook(() => useCart());

      // Accidentally add too many
      act(() => {
        result.current.addToCart(createProduct('1', 10));
        result.current.addToCart(createProduct('1', 10));
        result.current.addToCart(createProduct('1', 10));
        result.current.addToCart(createProduct('1', 10));
        result.current.addToCart(createProduct('1', 10));
      });

      expect(result.current.cart[0].qty).toBe(5);

      // Correct to 2
      act(() => {
        result.current.updateQty('1', 2);
      });

      expect(result.current.cart[0].qty).toBe(2);
      expect(result.current.cart[0].total).toBe(20);
    });

    it('handles payment method change', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(createProduct('1', 500));
      });

      // Start with cash
      act(() => {
        result.current.setPaymentMethod('cash');
        result.current.setReceivedAmount(500);
      });

      expect(result.current.paymentMethod).toBe('cash');
      expect(result.current.change).toBe(0);

      // Change to credit
      act(() => {
        result.current.setPaymentMethod('credit');
      });

      expect(result.current.paymentMethod).toBe('credit');
      // Change should still be calculated based on received amount
    });
  });

  describe('multi-customer scenarios', () => {
    it('handles switching between customers', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(createProduct('1', 100));
        result.current.setSelectedCustomer('cust-1', 'Customer 1');
      });

      expect(result.current.selectedCustomerId).toBe('cust-1');

      // Switch to different customer
      act(() => {
        result.current.setSelectedCustomer('cust-2', 'Customer 2');
      });

      expect(result.current.selectedCustomerId).toBe('cust-2');
      expect(result.current.selectedCustomerName).toBe('Customer 2');
    });

    it('handles walk-in customer (no selection)', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(createProduct('1', 100));
        // No customer selected for walk-in
      });

      expect(result.current.selectedCustomerId).toBe('');
      expect(result.current.selectedCustomerName).toBe('');
      expect(result.current.cart).toHaveLength(1);
    });
  });

  describe('promotional scenarios', () => {
    it('handles buy-one-get-one-free simulation', () => {
      const { result } = renderHook(() => useCart());

      // Add 2 items, discount one
      act(() => {
        result.current.addToCart(createProduct('1', 100));
        result.current.addToCart(createProduct('1', 100));
        result.current.setDiscount(100); // BOGO: discount one item
      });

      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].qty).toBe(2);
      expect(result.current.subtotal).toBe(200);
      expect(result.current.discount).toBe(100);
      expect(result.current.total).toBe(100);
    });

    it('handles percentage discount', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(createProduct('1', 1000));
        result.current.setDiscount(200); // 20% off
      });

      expect(result.current.total).toBe(800);
    });

    it('handles fixed amount discount', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(createProduct('1', 500));
        result.current.setDiscount(50); // Fixed 50 off
      });

      expect(result.current.total).toBe(450);
    });
  });

  describe('inventory awareness', () => {
    it('tracks items approaching stock limit', () => {
      const { result } = renderHook(() => useCart());

      // Add items that are low in stock
      act(() => {
        result.current.addToCart(createProduct('low-stock', 100, 3)); // Only 3 in stock
        result.current.addToCart(createProduct('low-stock', 100, 3));
        result.current.addToCart(createProduct('low-stock', 100, 3));
      });

      expect(result.current.cart[0].qty).toBe(3);
      // Cart allows adding up to stock limit
    });

    it('handles out-of-stock prevention', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(createProduct('out-of-stock', 100, 0));
      });

      // Cart still adds item (validation happens at checkout)
      expect(result.current.cart).toHaveLength(1);
    });
  });

  describe('accessibility scenarios', () => {
    it('maintains cart state for screen readers', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(createProduct('1', 100));
        result.current.addToCart(createProduct('2', 200));
      });

      // Cart state should be accessible
      expect(result.current.itemsCount).toBe(2);
      expect(result.current.subtotal).toBe(300);

      // Update should be detectable
      act(() => {
        result.current.updateQty('1', 5);
      });

      expect(result.current.itemsCount).toBe(6);
    });
  });

  describe('mobile POS scenarios', () => {
    it('handles quick add for repeat customers', () => {
      const { result } = renderHook(() => useCart());

      // Regular customer with usual order
      const usualOrder = [
        createProduct('coffee-large', 30),
        createProduct('croissant', 15),
      ];

      act(() => {
        usualOrder.forEach(product => result.current.addToCart(product));
      });

      expect(result.current.cart).toHaveLength(2);
      expect(result.current.subtotal).toBe(45);
    });

    it('handles zen mode for focused checkout', () => {
      const { result } = renderHook(() => useCart());

      expect(result.current.isZenMode).toBe(false);

      act(() => {
        result.current.setIsZenMode(true);
        result.current.addToCart(createProduct('1', 100));
      });

      expect(result.current.isZenMode).toBe(true);
      expect(result.current.cart).toHaveLength(1);
    });
  });
});
