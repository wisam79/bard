import React from 'react';
import { PaginatedProducts } from '@/types';

interface ProductPaginationProps {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  productsData?: PaginatedProducts;
}

const ProductPagination: React.FC<ProductPaginationProps> = ({ page, setPage, productsData }) => {
  return (
    <div className="p-4 bg-brand-dark/35 border-t border-brand-border/30 flex items-center justify-between">
      <p className="text-xs font-bold text-brand-muted/60">
        عرض <span className="dark:text-white text-gray-900">{(page - 1) * 20 + 1}</span> إلى <span className="dark:text-white text-gray-900">{Math.min(page * 20, productsData?.total || 0)}</span> من <span className="dark:text-white text-gray-900">{productsData?.total || 0}</span> منتج
      </p>
      {productsData && productsData.totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-30"
          >
            السابق
          </button>
          <div className="flex gap-1 mx-2">
            {[...Array(productsData.totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${
                  page === i + 1 ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'bg-brand-dark/40 text-brand-muted/60 hover:bg-brand-dark/60'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(productsData.totalPages, p + 1))}
            disabled={page === productsData.totalPages}
            className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-30"
          >
            التالي
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductPagination;
