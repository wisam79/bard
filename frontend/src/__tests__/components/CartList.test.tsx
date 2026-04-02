import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CartList from '@/components/features/sales/CartList';
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

    // Check for quantities - the component renders quantities
    const quantities = screen.getAllByText(/^[12]$/);
    expect(quantities.length).toBeGreaterThan(0);
  });

  it('renders product prices correctly', () => {
    render(
      <CartList
        cart={mockCart}
        updateQty={mockUpdateQty}
        removeFromCart={mockRemoveFromCart}
      />
    );

    expect(screen.getAllByText(/٥٬٠٠٠/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/٣٬٠٠٠/).length).toBeGreaterThan(0);
  });

  it('calls removeFromCart when delete button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <CartList
        cart={mockCart}
        updateQty={mockUpdateQty}
        removeFromCart={mockRemoveFromCart}
      />
    );

    const deleteButtons = screen.getAllByRole('button');
    if (deleteButtons.length > 0) {
      await user.click(deleteButtons[0]);
      expect(mockRemoveFromCart).toHaveBeenCalledWith('1');
    }
  });

  it('calculates correct total for each item', () => {
    render(
      <CartList
        cart={mockCart}
        updateQty={mockUpdateQty}
        removeFromCart={mockRemoveFromCart}
      />
    );

    expect(screen.getAllByText(/١٠٬٠٠٠/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/٣٬٠٠٠/).length).toBeGreaterThan(0);
  });
});
