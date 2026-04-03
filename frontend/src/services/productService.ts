import type { Product, PaginatedProducts } from '@/types';
import { wailsApp } from '@/lib/wails';

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
    const newProduct: Product = {
      ...product,
      id: '',
      createdAt: '',
      updatedAt: '',
    };
    return wailsApp.CreateProduct(newProduct);
  },

  async update(product: Product): Promise<void> {
    return wailsApp.UpdateProduct(product);
  },

  async delete(id: string): Promise<void> {
    return wailsApp.DeleteProduct(id);
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
