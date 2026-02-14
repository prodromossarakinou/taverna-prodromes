'use client';

import React from 'react';
import { MenuItem } from './MenuItem';

interface MenuGridProps {
  items: string[];
  onAddItem: (itemName: string) => void;
}

export function MenuGrid({ items, onAddItem }: MenuGridProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-100 dark:bg-gray-800">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {items.map((item) => (
          <MenuItem
            key={item}
            name={item}
            onAdd={onAddItem}
          />
        ))}
      </div>
    </div>
  );
}
