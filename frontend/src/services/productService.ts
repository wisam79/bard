import type { Product, PaginatedProducts } from '@/types';

export const productService = {
  async getAll(page = 1, limit = 20, search = '', category = ''): Promise<PaginatedProducts> {
    return window.go.main.App.GetProducts(page, limit, search, category);
  },

  async getById(id: string): Promise<Product> {
    return window.go.main.App.GetProduct(id);
  },

  async getByBarcode(barcode: string): Promise<Product | null> {
    try {
      return await window.go.main.App.GetProductByBarcode(barcode);
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
    return window.go.main.App.CreateProduct(newProduct);
  },

  async update(product: Product): Promise<void> {
    return window.go.main.App.UpdateProduct(product);
  },

  async delete(id: string): Promise<void> {
    return window.go.main.App.DeleteProduct(id);
  },

  async getCategories(): Promise<string[]> {
    return window.go.main.App.GetCategories();
  },

  async getStats() {
    return window.go.main.App.GetProductStats();
  },

  async search(query: string, limit = 10): Promise<Product[]> {
    return window.go.main.App.SearchProducts(query, limit);
  },
};
