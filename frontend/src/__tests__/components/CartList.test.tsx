import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CartList } from '@/components/features/sales/CartList';
import type { CartItem } from '@/types';

describe('CartList', () => {
  const mockCart: CartItem[] = [
    {
      product: {
        id: '1',
        name: 'قهوة تركية',
        barcode: '1000001',
        price: 5000,
        cost: 3000,
        stock: 45,
        minStock: 10,
        category: 'مشروبات',
        wholesalePrice: 4000,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
      qty: 2,
      discount: 0,
      total: 10000,
    },
    {
      product: {
        id: '2',
        name: 'شاي ربيع',
        barcode: '1000003',
        price: 3000,
        cost: 1800,
        stock: 60,
        minStock: 10,
        category: 'مشروبات',
        wholesalePrice: 2500,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
      qty: 1,
      discount: 0,
      total: 3000,
    },
  ];

  const mockUpdateQty = vi.fn();
  const mockRemoveFromCart = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state when cart is empty', () => {
    render(
      <CartList
        cart={[]}
        updateQty={mockUpdateQty}
        removeFromCart={mockRemoveFromCart}
      />
    );

    expect(screen.getByText('السلة فارغة')).toBeInTheDocument();
    expect(screen.getByText('أضف المنتجات للبيع')).toBeInTheDocument();
  });

  it('renders cart items correctly', () => {
    render(
      <CartList
        cart={mockCart}
        updateQty={mockUpdateQty}
        removeFromCart={mockRemoveFromCart}
      />
    );

    expect(screen.getByText('قهوة تركية')).toBeInTheDocument();
    expect(screen.getByText('شاي ربيع')).toBeInTheDocument();
  });

  it('displays correct quantities', () => {
    render(
      <CartList
        cart={mockCart}
        updateQty={mockUpdateQty}
        removeFromCart={mockRemoveFromCart}
      />
    );

    // Find the quantity displays
    const quantities = screen.getAllByText(/^[12]$/);
    expect(quantities.length).toBeGreaterThan(0);
  });

  it('displays correct totals', () => {
    render(
      <CartList
        cart={mockCart}
        updateQty={mockUpdateQty}
        removeFromCart={mockRemoveFromCart}
      />
    );

    expect(screen.getByText(/10,000/)).toBeInTheDocument();
    expect(screen.getByText(/3,000/)).toBeInTheDocument();
  });

  it('calls updateQty when minus button is clicked', () => {
    render(
      <CartList
        cart={mockCart}
        updateQty={mockUpdateQty}
        removeFromCart={mockRemoveFromCart}
      />
    );

    const minusButtons = screen.getAllByRole('button', { name: '' });
    const firstMinusButton = minusButtons[0];
    
    fireEvent.click(firstMinusButton);
    
    expect(mockUpdateQty).toHaveBeenCalledWith('1', 1);
  });

  it('calls updateQty when plus button is clicked', () => {
    render(
      <CartList
        cart={mockCart}
        updateQty={mockUpdateQty}
        removeFromCart={mockRemoveFromCart}
      />
    );

    const plusButtons = screen.getAllByRole('button', { name: '' });
    const firstPlusButton = plusButtons[1];
    
    fireEvent.click(firstPlusButton);
    
    expect(mockUpdateQty).toHaveBeenCalledWith('1', 3);
  });

  it('calls removeFromCart when delete button is clicked', () => {
    render(
      <CartList
        cart={mockCart}
        updateQty={mockUpdateQty}
        removeFromCart={mockRemoveFromCart}
      />
    );

    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons[0];
    
    fireEvent.click(deleteButton);
    
    expect(mockRemoveFromCart).toHaveBeenCalledWith('1');
  });

  it('calculates correct total for each item', () => {
    render(
      <CartList
        cart={mockCart}
        updateQty={mockUpdateQty}
        removeFromCart={mockRemoveFromCart}
      />
    );

    // First item: 2 * 5000 = 10000
    // Second item: 1 * 3000 = 3000
    expect(screen.getByText(/10,000/)).toBeInTheDocument();
    expect(screen.getByText(/3,000/)).toBeInTheDocument();
  });
});
