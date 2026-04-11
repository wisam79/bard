import type { Product, PaginatedProducts } from '@/types';
import { wailsApp } from '@/lib/wails';
import { useAuthStore } from '@/store/authStore';

export const productService = {
  async getAll(page = 1, limit = 20, search = '', category = ''): Promise<PaginatedProducts> {
    return wailsApp.GetProducts(page, limit, search, category);
  },

  async getById(id: string): Promise<Product> {
    return wailsApp.GetProduct(id);
  },

  async getByBarcode(barcode: string): Promise<Product | null> {
    try {
      return await wailsApp.GetProductByBarcode(barcode);
    } catch {
      return null;
    }
  },

  async create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const token = useAuthStore.getState().getToken();
    if (!token) throw new Error('Not authenticated');
    const newProduct: Product = {
      ...product,
      id: '',
      createdAt: '',
      updatedAt: '',
    };
    return wailsApp.CreateProduct(token, newProduct);
  },

  async update(product: Product): Promise<void> {
    const token = useAuthStore.getState().getToken();
    if (!token) throw new Error('Not authenticated');
    return wailsApp.UpdateProduct(token, product);
  },

  async delete(id: string): Promise<void> {
    const token = useAuthStore.getState().getToken();
    if (!token) throw new Error('Not authenticated');
    return wailsApp.DeleteProduct(token, id);
  },

  async getCategories(): Promise<string[]> {
    return wailsApp.GetCategories();
  },

  async getStats() {
    return wailsApp.GetProductStats();
  },

  async search(query: string, limit = 10): Promise<Product[]> {
    return wailsApp.SearchProducts(query, limit);
  },
};
