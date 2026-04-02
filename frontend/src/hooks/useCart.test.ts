import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCart } from './useCart';
import type { Product } from '@/types';

const mockProduct: Product = {
  id: '1',
  name: 'Test Product',
  barcode: '123456',
  price: 100,
  cost: 50,
  stock: 10,
  minStock: 5,
  category: 'Test',
  wholesalePrice: 80,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const mockProduct2: Product = {
  id: '2',
  name: 'Test Product 2',
  barcode: '789012',
  price: 200,
  cost: 100,
  stock: 5,
  minStock: 2,
  category: 'Test',
  wholesalePrice: 160,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

describe('useCart', () => {
  it('starts with empty cart', () => {
    const { result } = renderHook(() => useCart());
    expect(result.current.cart).toEqual([]);
    expect(result.current.subtotal).toBe(0);
    expect(result.current.total).toBe(0);
    expect(result.current.itemsCount).toBe(0);
  });

  it('adds product to cart', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addToCart(mockProduct);
    });

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0].product.id).toBe('1');
    expect(result.current.cart[0].qty).toBe(1);
    expect(result.current.cart[0].total).toBe(100);
  });

  it('increments quantity for existing product', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addToCart(mockProduct);
    });

    act(() => {
      result.current.addToCart(mockProduct);
    });

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0].qty).toBe(2);
    expect(result.current.cart[0].total).toBe(200);
  });

  it('adds different products separately', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addToCart(mockProduct);
    });

    act(() => {
      result.current.addToCart(mockProduct2);
    });

    expect(result.current.cart).toHaveLength(2);
  });

  it('updates quantity', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addToCart(mockProduct);
    });

    act(() => {
      result.current.updateQty('1', 5);
    });

    expect(result.current.cart[0].qty).toBe(5);
    expect(result.current.cart[0].total).toBe(500);
  });

  it('removes item when quantity is 0 or less', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addToCart(mockProduct);
    });

    act(() => {
      result.current.updateQty('1', 0);
    });

    expect(result.current.cart).toHaveLength(0);
  });

  it('removes product from cart', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addToCart(mockProduct);
    });

    act(() => {
      result.current.addToCart(mockProduct2);
    });

    act(() => {
      result.current.removeFromCart('1');
    });

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0].product.id).toBe('2');
  });

  it('clears cart', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addToCart(mockProduct);
    });

    act(() => {
      result.current.setDiscount(10);
    });

    act(() => {
      result.current.setReceivedAmount(100);
    });

    act(() => {
      result.current.setSelectedCustomer('c1', 'Customer 1');
    });

    act(() => {
      result.current.clearCart();
    });

    expect(result.current.cart).toHaveLength(0);
    expect(result.current.discount).toBe(0);
    expect(result.current.receivedAmount).toBe(0);
    expect(result.current.selectedCustomerId).toBe('');
    expect(result.current.selectedCustomerName).toBe('');
  });

  it('calculates subtotal correctly', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addToCart(mockProduct);
    });

    act(() => {
      result.current.addToCart(mockProduct2);
    });

    expect(result.current.subtotal).toBe(300);
  });

  it('calculates total with discount', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addToCart(mockProduct);
    });

    act(() => {
      result.current.setDiscount(20);
    });

    expect(result.current.total).toBe(80);
  });

  it('calculates change correctly', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addToCart(mockProduct);
    });

    act(() => {
      result.current.setReceivedAmount(150);
    });

    expect(result.current.change).toBe(50);
  });

  it('returns 0 change when received is less than total', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addToCart(mockProduct);
    });

    act(() => {
      result.current.setReceivedAmount(50);
    });

    expect(result.current.change).toBe(0);
  });

  it('calculates items count correctly', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addToCart(mockProduct);
    });

    act(() => {
      result.current.addToCart(mockProduct);
    });

    act(() => {
      result.current.addToCart(mockProduct2);
    });

    expect(result.current.itemsCount).toBe(3);
  });

  it('sets selected customer', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.setSelectedCustomer('c1', 'John Doe');
    });

    expect(result.current.selectedCustomerId).toBe('c1');
    expect(result.current.selectedCustomerName).toBe('John Doe');
  });
});
