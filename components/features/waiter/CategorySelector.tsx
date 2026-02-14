'use client';

import React from 'react';
import { OrderCategory } from '@/types/order';

interface CategorySelectorProps {
  categories: OrderCategory[];
  selectedCategory: OrderCategory;
  onSelect: (category: OrderCategory) => void;
  categoryColors: Record<OrderCategory, string>;
}

export function CategorySelector({
  categories,
  selectedCategory,
  onSelect,
  categoryColors,
}: CategorySelectorProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-x-auto flex-shrink-0">
      <div className="flex">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={`px-4 py-3 whitespace-nowrap transition-all text-sm font-medium ${
              selectedCategory === cat
                ? `${categoryColors[cat]} text-white`
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
