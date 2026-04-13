import React from 'react';
import { Search, Filter } from 'lucide-react';

interface ProductFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories?: string[];
  onFilterChange: () => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories,
  onFilterChange
}) => {
  return (
    <div className="p-4 border-b border-brand-border/30 flex flex-col md:flex-row gap-4 items-center">
      <div className="relative flex-1 w-full">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-muted/50" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            onFilterChange();
          }}
          className="input pr-10 bg-brand-dark/35 border-brand-border/35 focus:bg-brand-dark/40"
          placeholder="بحث باسم المنتج أو الباركود..."
        />
      </div>
      <div className="flex gap-2 w-full md:w-auto">
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            onFilterChange();
          }}
          className="input bg-brand-dark/35 border-brand-border/35 w-full md:w-48"
        >
          <option value="الكل">كل الفئات</option>
          {categories?.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <button className="btn-secondary p-2.5">
          <Filter size={20} />
        </button>
      </div>
    </div>
  );
};

export default ProductFilters;
