import React from 'react';
import { ShoppingCart, Trash2, Minus, Plus } from 'lucide-react';
import { CartItem } from '@/types';

interface CartListProps {
  cart: CartItem[];
  updateQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
}

const CartList: React.FC<CartListProps> = ({ cart, updateQty, removeFromCart }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-brand-accent/20 space-y-4 py-20 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-brand-border/10 flex items-center justify-center border-2 border-dashed border-brand-border/30">
            <ShoppingCart className="w-6 h-6 opacity-30" />
          </div>
          <div className="text-center">
            <p className="text-sm font-black text-brand-accent/30 tracking-tight">السلة فارغة</p>
            <p className="text-[10px] font-bold mt-1 uppercase tracking-widest">أضف المنتجات للبيع</p>
          </div>
        </div>
      ) : (
        cart.map((item: CartItem) => (
          <div
            key={item.product.id}
            className="bg-brand-surface/40 dark:bg-brand-dark/40 border border-brand-border/20 rounded-2xl p-4 group hover:border-primary-500/30 transition-all duration-150 shadow-sm animate-fade-in"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-2xl group-hover:scale-110 transition-transform">{item.product.emoji || '📦'}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[13px] font-bold text-brand-accent truncate leading-tight group-hover:text-primary-500 transition-colors">
                    {item.product.name}
                  </h4>
                  <p className="text-[9px] font-bold text-brand-accent/30 uppercase tracking-wide">
                    {item.product.price.toLocaleString('ar-IQ')} <span className="text-[8px] opacity-50">د.ع</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFromCart(item.product.id)}
                className="p-1.5 text-brand-accent/20 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 bg-brand-dark/10 p-0.5 rounded-lg border border-brand-border/10">
                <button
                  onClick={() => updateQty(item.product.id, item.qty - 1)}
                  className="w-7 h-7 rounded-md hover:bg-brand-border/20 text-brand-accent flex items-center justify-center transition-all active:scale-90"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-brand-accent font-black w-8 text-center text-xs">{item.qty}</span>
                <button
                  onClick={() => updateQty(item.product.id, item.qty + 1)}
                  className="w-7 h-7 rounded-md hover:bg-brand-border/20 text-brand-accent flex items-center justify-center transition-all active:scale-90"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              
              <div className="text-left">
                <p className="text-[14px] font-black text-primary-500 flex items-baseline gap-1">
                  {item.total.toLocaleString('ar-IQ')}
                  <span className="text-[8px] font-bold text-brand-accent/20">د.ع</span>
                </p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default CartList;
