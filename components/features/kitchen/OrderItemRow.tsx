'use client';

import React from 'react';
import { OrderItem } from '@/types/order';

interface OrderItemRowProps {
  item: OrderItem;
  onClick: () => void;
}

export function OrderItemRow({ item, onClick }: OrderItemRowProps) {
  const status = item.itemStatus || 'pending';
  
  const statusStyles = {
    pending: 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400',
    ready: 'bg-blue-500 text-white border-transparent',
    delivered: 'bg-green-500 text-white border-transparent',
  };

  return (
    <button
      onClick={onClick}
      className={`w-full text-right py-1 px-2 rounded border-2 transition-all ${statusStyles[status]}`}
    >
      <div className="flex flex-col">
        <div className="flex items-center justify-end gap-3">
          <span className="text-sm font-medium">
            {item.name}
          </span>
          <span className="text-lg font-bold">
            ×{item.quantity}
          </span>
        </div>
        {item.extraNotes && (
          <div className="text-[10px] font-bold italic opacity-80 -mt-1">
            {item.extraNotes}
          </div>
        )}
      </div>
    </button>
  );
}
