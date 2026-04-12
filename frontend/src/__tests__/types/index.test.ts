import { describe, it, expect } from 'vitest';
import type { BusinessMode, View, RestaurantTable, PaymentMethod, SaleStatus } from '@/types';

describe('Types validation', () => {
  describe('BusinessMode', () => {
    it('accepts retail', () => {
      const mode: BusinessMode = 'retail';
      expect(mode).toBe('retail');
    });

    it('accepts restaurant', () => {
      const mode: BusinessMode = 'restaurant';
      expect(mode).toBe('restaurant');
    });

    it('accepts wholesale', () => {
      const mode: BusinessMode = 'wholesale';
      expect(mode).toBe('wholesale');
    });
  });

  describe('View', () => {
    it('includes dashboard', () => {
      const view: View = 'dashboard';
      expect(view).toBe('dashboard');
    });

    it('includes tables', () => {
      const view: View = 'tables';
      expect(view).toBe('tables');
    });

    it('includes all standard views', () => {
      const views: View[] = ['dashboard', 'sales', 'products', 'customers', 'finance', 'invoices', 'reports', 'settings', 'shifts', 'inventory', 'tables'];
      expect(views.length).toBe(11);
    });
  });

  describe('RestaurantTable', () => {
    it('creates a valid table', () => {
      const table: RestaurantTable = {
        id: '1',
        number: 1,
        seats: 4,
        status: 'available',
        floor: 'Ground',
      };
      expect(table.id).toBe('1');
      expect(table.status).toBe('available');
    });

    it('creates table with all optional fields', () => {
      const table: RestaurantTable = {
        id: '2',
        number: 5,
        name: 'Window Table',
        seats: 8,
        status: 'occupied',
        currentOrderId: 'ORD-001',
        assignedWaiter: 'Ahmed',
        floor: 'First Floor',
        notes: 'VIP customer',
      };
      expect(table.name).toBe('Window Table');
      expect(table.assignedWaiter).toBe('Ahmed');
    });

    it('supports all status values', () => {
      const statuses: RestaurantTable['status'][] = ['available', 'occupied', 'reserved', 'cleaning'];
      expect(statuses.length).toBe(4);
    });
  });

  describe('PaymentMethod', () => {
    it('supports all payment methods', () => {
      const methods: PaymentMethod[] = ['cash', 'card', 'credit', 'installment', 'split', 'transfer'];
      expect(methods.length).toBe(6);
    });
  });

  describe('SaleStatus', () => {
    it('supports all sale statuses', () => {
      const statuses: SaleStatus[] = ['completed', 'pending', 'return', 'cancelled'];
      expect(statuses.length).toBe(4);
    });
  });
});
