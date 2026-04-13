import React from 'react';

interface CategoryBarProps {
  categories?: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  selectedCategory,
  setSelectedCategory,
}) => {
  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-4 scrollbar-none snap-x">
      <button
        onClick={() => setSelectedCategory('الكل')}
        className={`px-6 py-2 rounded-xl text-[11px] font-black transition-all duration-200 whitespace-nowrap border-2 snap-center uppercase tracking-widest ${
          selectedCategory === 'الكل'
            ? 'bg-primary-500 text-white border-primary-500 shadow-lg shadow-primary-500/30'
            : 'bg-brand-surface/40 dark:bg-brand-dark/40 text-brand-muted/60 border-brand-border/35 hover:border-primary-500/20'
        }`}
      >
        الكل
      </button>
      {categories?.map((cat) => (
        <button
          key={cat}
          onClick={() => setSelectedCategory(cat)}
          className={`px-6 py-2 rounded-xl text-[11px] font-black transition-all duration-200 whitespace-nowrap border-2 snap-center uppercase tracking-widest ${
            selectedCategory === cat
              ? 'bg-primary-500 text-white border-primary-500 shadow-lg shadow-primary-500/30'
              : 'bg-brand-surface/40 dark:bg-brand-dark/40 text-brand-muted/60 border-brand-border/35 hover:border-primary-500/20'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default CategoryBar;
