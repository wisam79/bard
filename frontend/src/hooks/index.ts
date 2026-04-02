import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

export function useProducts(page = 1, limit = 20, search = '', category = 'الكل') {
  return useQuery({
    queryKey: ['products', page, limit, search, category],
    queryFn: () => window.go.main.App.GetProducts(page, limit, search, category),
  });
}

export function useInvalidateProducts() {
  const queryClient = useQueryClient();
  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
  }, [queryClient]);
}

export function useCustomers(page = 1, limit = 20, search = '') {
  return useQuery({
    queryKey: ['customers', page, limit, search],
    queryFn: () => window.go.main.App.GetCustomers(page, limit, search),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => window.go.main.App.GetCategories(),
  });
}

export function useRecentSales(limit = 10) {
  return useQuery({
    queryKey: ['recentSales', limit],
    queryFn: () => window.go.main.App.GetRecentSales(limit),
  });
}

export function useParkedSales() {
  return useQuery({
    queryKey: ['parkedSales'],
    queryFn: () => window.go.main.App.GetParkedSales(),
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => window.go.main.App.GetDashboardStats(),
    refetchInterval: 1000 * 60 * 5, // 5 minutes
  });
}

export function usePreferences() {
  return useQuery({
    queryKey: ['preferences'],
    queryFn: () => window.go.main.App.GetPreferences(),
    staleTime: Infinity,
  });
}
