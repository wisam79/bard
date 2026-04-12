import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from '@/store/authStore';
import type { Staff } from '@/types';

const mockApp = (
  window as typeof window & {
    go: { handler: { App: Record<string, unknown> } };
  }
).go.handler.App;

const mockStaff: Staff = {
  id: 'staff-1',
  username: 'admin',
  name: 'المدير',
  role: 'admin',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Helper: set a user with a given role directly (bypasses Wails API)
const setUser = (role: string) => {
  useAuthStore.setState({
    currentUser: { ...mockStaff, role } as Staff,
    isAuthenticated: true,
    sessionStartedAt: Date.now(),
    isLoading: false,
  });
};

// Helper: reset to unauthenticated state
const resetStore = () => {
  useAuthStore.setState({
    currentUser: null,
    isAuthenticated: false,
    isLoading: false,
    sessionStartedAt: null,
  });
};

beforeEach(() => {
  resetStore();
  vi.clearAllMocks();
});

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('authStore', () => {
  // ── Initial State ──────────────────────────────────────────────────────────
  describe('initial state', () => {
    it('starts unauthenticated', () => {
      const { isAuthenticated, currentUser, sessionStartedAt } = useAuthStore.getState();
      expect(isAuthenticated).toBe(false);
      expect(currentUser).toBeNull();
      expect(sessionStartedAt).toBeNull();
    });
  });

  // ── Login via Wails API ────────────────────────────────────────────────────
  describe('login', () => {
    it('sets authenticated when API returns a staff object with token', async () => {
      mockApp.Login = vi.fn().mockResolvedValue({ ...mockStaff, token: 'test-token' });

      const result = await useAuthStore.getState().login('admin', 'password');

      const { isAuthenticated, currentUser, sessionStartedAt } = useAuthStore.getState();
      expect(result).toBe(true);
      expect(isAuthenticated).toBe(true);
      expect(currentUser?.username).toBe('admin');
      expect(sessionStartedAt).toBeTypeOf('number');
    });

    it('stays unauthenticated when API returns null', async () => {
      mockApp.Login = vi.fn().mockResolvedValue(null);

      const result = await useAuthStore.getState().login('x', 'y');

      expect(result).toBe(false);
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it('stays unauthenticated when API throws', async () => {
      mockApp.Login = vi.fn().mockRejectedValue(new Error('net'));

      const result = await useAuthStore.getState().login('x', 'y');

      expect(result).toBe(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  // ── Logout ─────────────────────────────────────────────────────────────────
  describe('logout', () => {
    it('clears session on logout', () => {
      setUser('admin');

      useAuthStore.getState().logout();

      const { isAuthenticated, currentUser, sessionStartedAt } = useAuthStore.getState();
      expect(isAuthenticated).toBe(false);
      expect(currentUser).toBeNull();
      expect(sessionStartedAt).toBeNull();
    });
  });

  // ── RBAC Permissions ───────────────────────────────────────────────────────
  describe('permissions (RBAC)', () => {
    it('admin can manage products', () => {
      setUser('admin');
      expect(useAuthStore.getState().canManageProducts()).toBe(true);
    });

    it('admin can manage staff', () => {
      setUser('admin');
      expect(useAuthStore.getState().canManageStaff()).toBe(true);
    });

    it('admin can view reports', () => {
      setUser('admin');
      expect(useAuthStore.getState().canViewReports()).toBe(true);
    });

    it('admin can create sales', () => {
      setUser('admin');
      expect(useAuthStore.getState().canCreateSale()).toBe(true);
    });

    it('cashier can create sales', () => {
      setUser('cashier');
      expect(useAuthStore.getState().canCreateSale()).toBe(true);
    });

    it('cashier cannot manage staff', () => {
      setUser('cashier');
      expect(useAuthStore.getState().canManageStaff()).toBe(false);
    });

    it('cashier cannot manage products (no edit:product perm)', () => {
      setUser('cashier');
      expect(useAuthStore.getState().canManageProducts()).toBe(false);
    });

    it('viewer cannot create sales', () => {
      setUser('viewer');
      expect(useAuthStore.getState().canCreateSale()).toBe(false);
    });

    it('viewer can view reports', () => {
      setUser('viewer');
      expect(useAuthStore.getState().canViewReports()).toBe(true);
    });

    it('unauthenticated user has no permissions', () => {
      resetStore();
      expect(useAuthStore.getState().can('view:dashboard')).toBe(false);
    });

    it('isAdmin is true for admin role', () => {
      setUser('admin');
      expect(useAuthStore.getState().isAdmin()).toBe(true);
    });

    it('isAdmin is false for cashier role', () => {
      setUser('cashier');
      expect(useAuthStore.getState().isAdmin()).toBe(false);
    });

    it('unknown role has no permissions', () => {
      setUser('unknown_role');
      expect(useAuthStore.getState().can('view:dashboard')).toBe(false);
    });
  });
});
