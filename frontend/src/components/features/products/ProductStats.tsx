import React from 'react';
import { Package, Boxes, BarChart, TrendingUp } from 'lucide-react';
import { PaginatedProducts } from '@/types';

interface ProductStatsProps {
  productsData?: PaginatedProducts;
}

const ProductStats: React.FC<ProductStatsProps> = ({ productsData }) => {
  const stats = [
    { label: 'إجمالي المنتجات', value: productsData?.total || 0, icon: <Package size={20} />, color: 'text-blue-400' },
    { label: 'إجمالي المخزون', value: productsData?.stats?.totalStock?.toFixed(0) || 0, icon: <Boxes size={20} />, color: 'text-purple-400' },
    { label: 'قيمة المخزون', value: (productsData?.stats?.totalValue || 0).toLocaleString('ar-IQ'), suffix: 'د.ع', icon: <BarChart size={20} />, color: 'text-primary-400' },
    { label: 'الربح المتوقع', value: (productsData?.stats?.profit || 0).toLocaleString('ar-IQ'), suffix: 'د.ع', icon: <TrendingUp size={20} />, color: 'text-green-400' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, i) => (
        <div key={i} className="bg-brand-surface border border-brand-border/30 rounded-2xl p-4 flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl bg-brand-dark/40 flex items-center justify-center ${stat.color}`}>
            {stat.icon}
          </div>
          <div>
            <p className="text-[10px] font-bold text-brand-accent/40 uppercase tracking-widest">{stat.label}</p>
            <p className="text-lg font-black dark:text-white text-gray-900">{stat.value} <span className="text-[10px] opacity-50">{stat.suffix}</span></p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductStats;
