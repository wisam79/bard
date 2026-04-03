import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { wailsApp } from '@/lib/wails';

export function useProducts(page = 1, limit = 20, search = '', category = 'الكل') {
  return useQuery({
    queryKey: ['products', page, limit, search, category],
    queryFn: () => wailsApp.GetProducts(page, limit, search, category),
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
    queryFn: () => wailsApp.GetCustomers(page, limit, search),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => wailsApp.GetCategories(),
  });
}

export function useRecentSales(limit = 10) {
  return useQuery({
    queryKey: ['recentSales', limit],
    queryFn: () => wailsApp.GetRecentSales(limit),
  });
}

export function useParkedSales() {
  return useQuery({
    queryKey: ['parkedSales'],
    queryFn: () => wailsApp.GetParkedSales(),
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => wailsApp.GetDashboardStats(),
    refetchInterval: 1000 * 60 * 5, // 5 minutes
  });
}

export function usePreferences() {
  return useQuery({
    queryKey: ['preferences'],
    queryFn: () => wailsApp.GetPreferences(),
    staleTime: Infinity,
  });
}
