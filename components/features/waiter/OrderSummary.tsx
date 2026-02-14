'use client';

import React from 'react';
import { Trash2, Minus, Plus, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { OrderItem, OrderCategory } from '@/types/order';

interface OrderSummaryProps {
  currentOrder: OrderItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onClearOrder: () => void;
  onSubmitOrder: () => void;
  categoryColors: Record<OrderCategory, string>;
}

export function OrderSummary({
  currentOrder,
  onUpdateQuantity,
  onClearOrder,
  onSubmitOrder,
  categoryColors,
}: OrderSummaryProps) {
  if (currentOrder.length === 0) return null;

  const totalQuantity = currentOrder.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-white dark:bg-gray-850 border-t-4 border-gray-300 dark:border-gray-600 shadow-2xl max-h-64 overflow-y-auto">
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-gray-900 dark:text-white">
            Παραγγελία ({totalQuantity})
          </h3>
          <Button variant="ghost" size="sm" onClick={onClearOrder} className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950">
            <Trash2 className="size-4 mr-1" />
            Καθαρισμός
          </Button>
        </div>
        <div className="space-y-2 mb-4">
          {currentOrder.map((item) => (
            <div key={item.id} className="flex items-center justify-between bg-gray-100 dark:bg-gray-700/80 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                <Badge className={`${categoryColors[item.category]} text-white text-[10px] mt-1 border-transparent`}>
                  {item.category}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => onUpdateQuantity(item.id, -1)} className="h-8 w-8 p-0 border-gray-200 dark:border-gray-600">
                  <Minus className="size-4" />
                </Button>
                <span className="w-8 text-center font-bold text-lg text-gray-900 dark:text-white">{item.quantity}</span>
                <Button size="sm" variant="outline" onClick={() => onUpdateQuantity(item.id, 1)} className="h-8 w-8 p-0 border-gray-200 dark:border-gray-600">
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button onClick={onSubmitOrder} className="w-full h-14 text-lg bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white">
          <Send className="size-5 mr-2" />
          Αποστολή
        </Button>
      </div>
    </div>
  );
}
