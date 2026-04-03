import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/store';
import { Product, PaginatedProducts } from '@/types';
import { Boxes, Plus, Printer } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import BarcodeDisplay from '@/components/ui/BarcodeDisplay';
import BarcodeLabelsPrint from '@/components/features/BarcodeLabelsPrint';
import ProductStats from '../components/features/products/ProductStats';
import ProductFilters from '../components/features/products/ProductFilters';
import ProductTable from '../components/features/products/ProductTable';
import ProductPagination from '../components/features/products/ProductPagination';
import ProductFormModal from '../components/features/products/ProductFormModal';
import { wailsApp } from '@/lib/wails';

const Products: React.FC = () => {
  const { notify } = useAppStore();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [barcodeProduct, setBarcodeProduct] = useState<Product | null>(null);
  const [showBarcodeLabels, setShowBarcodeLabels] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    price: 0,
    cost: 0,
    stock: 0,
    minStock: 5,
    category: '',
    wholesalePrice: 0,
    description: '',
  });

  const { data: productsData, isLoading } = useQuery<PaginatedProducts>({
    queryKey: ['products', page, 20, searchQuery, selectedCategory],
    queryFn: () => wailsApp.GetProducts(page, 20, searchQuery, selectedCategory),
  });

  const { data: categories } = useQuery<string[]>({
    queryKey: ['categories'],
    queryFn: () => wailsApp.GetCategories(),
  });

  const createMutation = useMutation({
    mutationFn: (product: Partial<Product>) => wailsApp.CreateProduct(product as Product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      notify('تم إضافة المنتج بنجاح', 'success');
      handleCloseModal();
    },
    onError: () => notify('فشل في إضافة المنتج', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: (product: Partial<Product>) => wailsApp.UpdateProduct(product as Product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      notify('تم تحديث المنتج بنجاح', 'success');
      handleCloseModal();
    },
    onError: () => notify('فشل في تحديث المنتج', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => wailsApp.DeleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      notify('تم حذف المنتج', 'success');
    },
    onError: () => notify('فشل في حذف المنتج', 'error'),
  });

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({ name: '', barcode: '', price: 0, cost: 0, stock: 0, minStock: 5, category: '', wholesalePrice: 0, description: '' });
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        barcode: product.barcode,
        price: product.price,
        cost: product.cost,
        stock: product.stock,
        minStock: product.minStock,
        category: product.category,
        wholesalePrice: product.wholesalePrice,
        description: product.description || '',
      });
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.barcode) {
      notify('يرجى ملء الحقول المطلوبة', 'error');
      return;
    }
    if (editingProduct) {
      updateMutation.mutate({ ...editingProduct, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col gap-6 relative overflow-hidden bg-brand-dark/20">
      {/* Barcode Labels Print Modal */}
      <BarcodeLabelsPrint isOpen={showBarcodeLabels} onClose={() => setShowBarcodeLabels(false)} />

      {/* Barcode Preview Modal */}
      <Modal
        isOpen={showBarcodeModal}
        onClose={() => { setShowBarcodeModal(false); setBarcodeProduct(null); }}
        title="عرض الباركود"
        size="md"
        footer={
          <>
            <Button
              onClick={() => { setShowBarcodeModal(false); setShowBarcodeLabels(true); }}
              icon={<Printer size={18} />}
            >
              طباعة ملصقات
            </Button>
            <Button
              onClick={() => setShowBarcodeModal(false)}
              variant="secondary"
            >
              إغلاق
            </Button>
          </>
        }
      >
        {barcodeProduct && (
          <div className="flex flex-col items-center gap-6">
            <div className="bg-white p-4 rounded-xl">
              <BarcodeDisplay
                value={barcodeProduct.barcode || barcodeProduct.id}
                format="CODE128"
                width={2}
                height={120}
                fontSize={14}
                showValue={true}
              />
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900 dark:text-white">{barcodeProduct.name}</p>
              <p className="text-primary-500 font-black text-xl">
                {barcodeProduct.price.toLocaleString('ar-IQ')} د.ع
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full text-sm">
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
                <p className="text-gray-500 mb-1">التكلفة</p>
                <p className="font-bold">{barcodeProduct.cost.toLocaleString('ar-IQ')} د.ع</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
                <p className="text-gray-500 mb-1">المخزون</p>
                <p className="font-bold">{barcodeProduct.stock}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black dark:text-white text-gray-900 tracking-tight flex items-center gap-3">
            <Boxes className="text-primary-400" />
            إدارة المنتجات
          </h1>
          <p className="text-brand-accent/50 font-medium mt-1">إضافة، تعديل ومراقبة المخزون الخاص بك</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowBarcodeLabels(true)}
            variant="secondary"
            icon={<Printer size={18} />}
          >
            طباعة ملصقات
          </Button>
          <Button onClick={() => handleOpenModal()} icon={<Plus size={20} />}>
            إضافة منتج جديد
          </Button>
        </div>
      </div>

      {/* Stats */}
      <ProductStats productsData={productsData} />

      {/* Table */}
      <div className="bg-brand-surface border border-brand-border/30 rounded-3xl flex-1 flex flex-col overflow-hidden shadow-2xl">
        {/* Filters */}
        <ProductFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
          onFilterChange={() => setPage(1)}
        />

        {/* Products Table */}
        <div className="flex-1 overflow-auto">
          <ProductTable
            productsData={productsData}
            isLoading={isLoading}
            onPreviewBarcode={(product) => { setBarcodeProduct(product); setShowBarcodeModal(true); }}
            onEditProduct={handleOpenModal}
            onDeleteProduct={(product) => deleteMutation.mutate(product.id)}
          />
        </div>

        {/* Pagination */}
        <ProductPagination
          page={page}
          setPage={setPage}
          productsData={productsData}
        />
      </div>

      {/* Product Form Modal */}
      <ProductFormModal
        showModal={showModal}
        handleCloseModal={handleCloseModal}
        editingProduct={editingProduct}
        handleSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        isPending={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};

export default Products;
