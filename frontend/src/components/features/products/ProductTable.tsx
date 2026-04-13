import React from 'react';
import { Package, Eye, Pencil, Trash2 } from 'lucide-react';
import { Product, PaginatedProducts } from '@/types';

interface ProductTableProps {
  productsData?: PaginatedProducts;
  isLoading: boolean;
  onPreviewBarcode: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  productsData,
  isLoading,
  onPreviewBarcode,
  onEditProduct,
  onDeleteProduct
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <table className="w-full text-right border-collapse">
      <thead>
        <tr className="bg-brand-dark/45 border-b border-brand-border/30">
          <th className="py-4 px-6 text-[10px] font-black text-brand-muted/60 uppercase tracking-widest">المنتج</th>
          <th className="py-4 px-6 text-[10px] font-black text-brand-muted/60 uppercase tracking-widest text-center">الباركود</th>
          <th className="py-4 px-6 text-[10px] font-black text-brand-muted/60 uppercase tracking-widest">الفئة</th>
          <th className="py-4 px-6 text-[10px] font-black text-brand-muted/60 uppercase tracking-widest">السعر</th>
          <th className="py-4 px-6 text-[10px] font-black text-brand-muted/60 uppercase tracking-widest text-center">المخزون</th>
          <th className="py-4 px-6 text-[10px] font-black text-brand-muted/60 uppercase tracking-widest text-center">إجراءات</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-brand-border/10">
        {productsData?.data?.map((product) => (
          <tr key={product.id} className="hover:bg-brand-dark/35 transition-colors group">
            <td className="py-4 px-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-dark/40 flex items-center justify-center border border-brand-border/30 group-hover:border-primary-500/30 transition-colors">
                  <Package size={18} className="text-brand-muted/60 group-hover:text-primary-400" />
                </div>
                <div>
                  <p className="text-sm font-bold dark:text-white text-gray-900 leading-none mb-1">{product.name}</p>
                  <p className="text-[10px] text-brand-muted/50 font-medium truncate max-w-[200px]">{product.description || 'لا يوجد وصف'}</p>
                </div>
              </div>
            </td>
            <td className="py-4 px-6 text-center">
              <button
                onClick={() => onPreviewBarcode(product)}
                className="text-xs font-mono bg-brand-dark/40 px-2 py-1 rounded-lg border border-brand-border/35 text-brand-accent/60 hover:text-primary-400 hover:border-primary-500/50 transition-all cursor-pointer"
              >
                {product.barcode || '---'}
              </button>
            </td>
            <td className="py-4 px-6">
              <span className="text-xs font-bold text-brand-accent/60 bg-brand-dark/40 px-2.5 py-1 rounded-full border border-brand-border/35">
                {product.category || 'غير مصنف'}
              </span>
            </td>
            <td className="py-4 px-6">
              <p className="text-sm font-black text-primary-400">{product.price.toLocaleString('ar-IQ')} <span className="text-[10px]">د.ع</span></p>
              <p className="text-[10px] text-brand-muted/50 font-bold">التكلفة: {product.cost.toLocaleString('ar-IQ')}</p>
            </td>
            <td className="py-4 px-6">
              <div className="flex items-center gap-2 justify-center">
                <div className={`w-2 h-2 rounded-full ${product.stock <= product.minStock ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                <span className={`text-sm font-black ${product.stock <= product.minStock ? 'text-red-400' : 'dark:text-white text-gray-900'}`}>
                  {product.stock}
                </span>
              </div>
            </td>
            <td className="py-4 px-6">
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => onPreviewBarcode(product)}
                  className="p-2 rounded-xl bg-brand-dark/40 border border-brand-border/30 text-brand-muted/60 hover:text-blue-400 hover:border-blue-400/50 hover:bg-blue-400/10 transition-all"
                  title="عرض الباركود"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => onEditProduct(product)}
                  className="p-2 rounded-xl bg-brand-dark/40 border border-brand-border/30 text-brand-muted/60 hover:text-white hover:border-primary-500/50 hover:bg-primary-500/10 transition-all"
                  title="تعديل"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => {
                    // eslint-disable-next-line no-alert
                    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
                      onDeleteProduct(product);
                    }
                  }}
                  className="p-2 rounded-xl bg-brand-dark/40 border border-brand-border/30 text-brand-muted/60 hover:text-red-400 hover:border-red-400/50 hover:bg-red-400/10 transition-all"
                  title="حذف"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ProductTable;
