import React from 'react';
import { Product } from '@/types';
import EmptyState from '@/components/ui/EmptyState';
import { Package } from 'lucide-react';

interface ProductGridProps {
  products?: Product[];
  addToCart: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, addToCart }) => {
  if (!products || products.length === 0) {
    return <EmptyState icon={Package} title="لا يوجد منتجات" description="لم يتم العثور على أي منتج يطابق بحثك" />;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 pb-8 h-full">
      {products.map((product) => {
        const isLowStock = product.stock <= (product.minStock || 5);
        const outOfStock = product.stock <= 0;

        return (
          <button
            key={product.id}
            onClick={() => !outOfStock && addToCart(product)}
            disabled={outOfStock}
            aria-label={`إضافة ${product.name}`}
            data-testid={`product-card-${product.id}`}
            className={`group relative aspect-square bg-brand-surface/20 dark:bg-brand-dark/20 backdrop-blur-md rounded-2xl p-4 border border-brand-border/20 flex flex-col items-center justify-between text-center transition-all duration-200 hover:shadow-xl hover:border-primary-500/30 hover:-translate-y-1 active:scale-95 ${
              outOfStock ? 'opacity-40 grayscale cursor-not-allowed' : ''
            }`}
          >
            {/* Top Badge: Stock Level - Subtle */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-brand-dark/10 border border-brand-border/10">
               <div className={`w-1.5 h-1.5 rounded-full ${outOfStock ? 'bg-rose-500' : isLowStock ? 'bg-amber-500' : 'bg-emerald-500'}`} />
               <span className={`text-[9px] font-black uppercase tracking-widest ${isLowStock ? 'text-amber-500' : 'text-brand-accent/40'}`}>
                 {product.stock}
               </span>
            </div>

            {/* Middle: Emoji / Icon */}
            <div className="flex-1 flex items-center justify-center pt-2">
              <span className="text-5xl drop-shadow-2xl group-hover:scale-110 transition-transform duration-300 pointer-events-none">
                {product.emoji || '📦'}
              </span>
            </div>

            {/* Bottom: Info - Compact */}
            <div className="w-full mt-2">
              <h3 className="text-[12px] font-black text-brand-accent leading-tight truncate mb-1">
                {product.name}
              </h3>
              <div className="flex items-center justify-center gap-1">
                <span className="text-sm font-black text-primary-500 dark:text-primary-400">
                  {product.price.toLocaleString('ar-IQ')}
                </span>
                <span className="text-[8px] font-bold text-brand-accent/20 uppercase tracking-tighter">د.ع</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ProductGrid;
