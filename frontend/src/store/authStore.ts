import { create } from 'zustand';
import type { Staff } from '@/types';
import { wailsApp } from '@/lib/wails';

// ─── Session Configuration ─────────────────────────────────────────────────────
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const WARNING_BEFORE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes before timeout
const SESSION_CHECK_INTERVAL_MS = 60 * 1000; // Check every minute

// ─── Permission map per role ─────────────────────────────────────────────────
const ROLE_PERMISSIONS: Record<string, Set<string>> = {
  admin: new Set([
    'view:dashboard',
    'view:sales',
    'view:products',
    'view:customers',
    'view:finance',
    'view:reports',
    'view:settings',
    'create:sale',
    'create:product',
    'create:customer',
    'edit:product',
    'edit:customer',
    'edit:settings',
    'delete:product',
    'delete:sale',
    'manage:staff',
    'view:reports:full',
    'export:reports',
  ]),
  manager: new Set([
    'view:dashboard',
    'view:sales',
    'view:products',
    'view:customers',
    'view:finance',
    'view:reports',
    'view:settings',
    'create:sale',
    'create:product',
    'create:customer',
    'edit:product',
    'edit:customer',
    'edit:settings',
    'delete:product',
    'delete:sale',
    'view:reports:full',
    'export:reports',
  ]),
  cashier: new Set([
    'view:dashboard',
    'view:sales',
    'view:products',
    'view:customers',
    'create:sale',
    'create:customer',
    'edit:customer',
  ]),
  viewer: new Set([
    'view:dashboard',
    'view:reports',
    'view:products',
    'view:customers',
  ]),
};

// ─── State interface ─────────────────────────────────────────────────────────
interface AuthState {
  currentUser: Staff | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  sessionStartedAt: number | null;
  lastActivityAt: number | null;
  showSessionWarning: boolean;
  sessionTimerId: number | null;
  warningTimerId: number | null;

  // Actions
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resetSessionTimer: () => void;
  checkSessionTimeout: () => void;
  dismissSessionWarning: () => void;
  getToken: () => string | null;

  // Permission helpers
  can: (permission: string) => boolean;
  canManageProducts: () => boolean;
  canManageStaff: () => boolean;
  canViewReports: () => boolean;
  canViewSettings: () => boolean;
  canCreateSale: () => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;
}

// ─── Session Timer Helpers ──────────────────────────────────────────────────
type AuthSetter = (
  partial:
    | Partial<AuthState>
    | ((state: AuthState) => Partial<AuthState>)
) => void;

const startSessionTimer = (
  set: AuthSetter,
  get: () => AuthState
) => {
  const state = get();
  
  // Clear existing timers
  if (state.sessionTimerId) {
    clearInterval(state.sessionTimerId);
  }
  if (state.warningTimerId) {
    clearTimeout(state.warningTimerId);
  }

  // Set warning timer (5 minutes before timeout)
  const warningTimerId = window.setTimeout(() => {
    set({ showSessionWarning: true });
  }, SESSION_TIMEOUT_MS - WARNING_BEFORE_TIMEOUT_MS);

  // Set session check interval
  const sessionTimerId = window.setInterval(() => {
    get().checkSessionTimeout();
  }, SESSION_CHECK_INTERVAL_MS);

  set({ sessionTimerId, warningTimerId });
};

const stopSessionTimer = (set: AuthSetter, get: () => AuthState) => {
  const state = get();
  
  if (state.sessionTimerId) {
    clearInterval(state.sessionTimerId);
  }
  if (state.warningTimerId) {
    clearTimeout(state.warningTimerId);
  }
  
  set({ 
    sessionTimerId: null, 
    warningTimerId: null,
    showSessionWarning: false 
  });
};

// ─── Activity Event Handlers ───────────────────────────────────────────────
let cleanupActivityListeners: (() => void) | null = null;

const setupActivityListeners = (
  resetTimer: () => void
) => {
  const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
  
  events.forEach(event => {
    document.addEventListener(event, resetTimer, { passive: true });
  });

  return () => {
    events.forEach(event => {
      document.removeEventListener(event, resetTimer);
    });
  };
};

// ─── Store ───────────────────────────────────────────────────────────────────
export const useAuthStore = create<AuthState>()((set, get) => ({
      currentUser: null,
      isAuthenticated: false,
      isLoading: false,
      token: null,
      sessionStartedAt: null,
      lastActivityAt: null,
      showSessionWarning: false,
      sessionTimerId: null,
      warningTimerId: null,

      login: async (username: string, password: string) => {
        set({ isLoading: true });
        try {
          const staff = await wailsApp.Login(username, password);
          if (staff && staff.token) {
            const now = Date.now();
            set({
              currentUser: staff,
              token: staff.token,
              isAuthenticated: true,
              isLoading: false,
              sessionStartedAt: now,
              lastActivityAt: now,
            });
            
            // Start session timer
            startSessionTimer(set, get);
            
            // Setup activity listeners
            if (cleanupActivityListeners) cleanupActivityListeners();
            cleanupActivityListeners = setupActivityListeners(get().resetSessionTimer);
            
            return true;
          }
          set({ isLoading: false });
          return false;
        } catch {
          set({ isLoading: false });
          return false;
        }
      },

      logout: async () => {
        // Stop session timer
        stopSessionTimer(set, get);
        
        // Cleanup activity listeners
        if (cleanupActivityListeners) {
          cleanupActivityListeners();
          cleanupActivityListeners = null;
        }

        // Notify backend to destroy session
        const token = get().token;
        if (token) {
          try {
            await wailsApp.Logout(token);
          } catch {
            // Ignore logout errors
          }
        }
        
        set({
          currentUser: null,
          token: null,
          isAuthenticated: false,
          sessionStartedAt: null,
          lastActivityAt: null,
          showSessionWarning: false,
        });
      },

      getToken: () => get().token,

      resetSessionTimer: () => {
        if (!get().isAuthenticated) return;
        
        const now = Date.now();
        set({ lastActivityAt: now });
        
        // Reset the warning timer
        startSessionTimer(set, get);
      },

      checkSessionTimeout: () => {
        const state = get();
        if (!state.isAuthenticated || !state.sessionStartedAt || !state.lastActivityAt) return;

        const now = Date.now();
        const elapsed = now - (state.lastActivityAt ?? now);

        if (elapsed >= SESSION_TIMEOUT_MS) {
          // Auto logout due to inactivity
          state.logout();
        }
      },

      dismissSessionWarning: () => {
        set({ showSessionWarning: false });
        // Reset timer when user acknowledges warning
        get().resetSessionTimer();
      },

      // ── Permission helpers ──────────────────────────────────────────────
      can: (permission: string): boolean => {
        const { currentUser } = get();
        if (!currentUser) return false;
        const perms = ROLE_PERMISSIONS[currentUser.role] ?? new Set();
        return perms.has(permission);
      },

      canManageProducts: () => get().can('edit:product'),
      canManageStaff: ()   => get().can('manage:staff'),
      canViewReports: ()   => get().can('view:reports'),
      canViewSettings: ()  => get().can('view:settings'),
      canCreateSale: ()    => get().can('create:sale'),
      isAdmin: ()          => get().currentUser?.role === 'admin',
      isManager: ()        => {
        const role = get().currentUser?.role;
        return role === 'admin' || role === 'manager';
      },
    }));
