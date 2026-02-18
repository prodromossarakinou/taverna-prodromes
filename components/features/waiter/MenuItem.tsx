'use client';

import React, { useState } from 'react';
import { MenuItem as MenuItemType } from '@/types/order';

interface MenuItemProps {
  item: MenuItemType;
  onAdd: (item: MenuItemType) => void;
}

export function MenuItem({ item, onAdd }: MenuItemProps) {
  const [isAnimate, setIsAnimate] = useState(false);

  const handleClick = () => {
    onAdd(item);
    setIsAnimate(true);
    setTimeout(() => setIsAnimate(false), 300);
  };

  return (
    <button
      onClick={handleClick}
      className={`
        bg-white dark:bg-gray-700 p-3 rounded-lg shadow-md border-2 
        border-gray-200 dark:border-gray-600 hover:border-blue-500 
        dark:hover:border-blue-400 hover:shadow-lg dark:hover:shadow-blue-500/20 
        transition-all active:scale-95 text-left flex items-center h-15
        ${isAnimate ? 'animate-heart-beat' : ''}
      `}
    >
      <span className="font-medium text-foreground leading-tight">{item.name}</span>
    </button>
  );
}
