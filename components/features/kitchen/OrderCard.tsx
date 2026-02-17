'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Order, OrderCategory, OrderItem } from '@/types/order';
import { OrderItemRow } from './OrderItemRow';

interface OrderCardProps {
  order: Order;
  index: number;
  onDelete: (id: string) => void;
  onItemClick: (orderId: string, itemId: string) => void;
  categoryLabels: Record<OrderCategory, string>;
  selectedFilter: OrderCategory | 'all';
}

export function OrderCard({
  order,
  index,
  onDelete,
  onItemClick,
  categoryLabels,
  selectedFilter,
}: OrderCardProps) {
  const displayedItems = selectedFilter === 'all' 
    ? order.items 
    : order.items.filter(item => item.category === selectedFilter);

  const groupItemsByCategory = (items: OrderItem[]) => {
    const grouped: Record<string, OrderItem[]> = {};
    items.forEach(item => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });
    return grouped;
  };

  const groupedItems = groupItemsByCategory(displayedItems);

  return (
    <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md border-2 border-gray-200 dark:border-gray-600">
      <div className="bg-gray-50 dark:bg-gray-800/50 p-3 flex items-center justify-between border-b-2 border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2 py-1 rounded bg-blue-600 text-white">
            #{index + 1}
          </span>
          <div className="flex flex-col">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
              {order.isExtra ? 'EXTRA — ' : ''}Τραπέζι {order.tableNumber}
            </h3>
            {order.isExtra && (
              <span className="text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 font-bold px-1.5 py-0.5 rounded w-fit uppercase">
                EXTRA
              </span>
            )}
            {order.extraNotes && (
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase truncate max-w-[150px]">
                Σημ: {order.extraNotes}
              </span>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(order.id)}
          className="h-7 w-7 p-0 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
        >
          <X className="size-4" />
        </Button>
      </div>

      <div className="p-3 space-y-3">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category}>
            <div className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 uppercase">
              {categoryLabels[category as OrderCategory]}
            </div>
            <div className="space-y-1">
              {items.map((item) => (
                <OrderItemRow
                  key={item.id}
                  item={item}
                  onClick={() => onItemClick(order.id, item.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
