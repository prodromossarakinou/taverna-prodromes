'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { cn } from '@/components/ui/utils';
import { OrderCategory } from '@/types/order';
import { KitchenOrderFilterKey } from './orderStatus';

interface KitchenHeaderProps {
  pendingCount: number;
  statusFilters: Record<KitchenOrderFilterKey, boolean>;
  filterKeys: KitchenOrderFilterKey[];
  filterLabels: Record<KitchenOrderFilterKey, string>;
  onFilterToggle: (filter: KitchenOrderFilterKey) => void;
  onFilterReset: () => void;
  selectedCategory: OrderCategory | 'all';
  onCategoryChange: (category: OrderCategory | 'all') => void;
  categoryLabels: Record<OrderCategory, string>;
  // View Switcher Props
  onSwitchView: (view: 'waiter' | 'kitchen' | 'admin') => void;
  ThemeToggle: React.ReactNode;
  // Bill Popup
  onOpenBill: () => void;
}

export function KitchenHeader({
  pendingCount,
  statusFilters,
  filterKeys,
  filterLabels,
  onFilterToggle,
  onFilterReset,
  selectedCategory,
  onCategoryChange,
  categoryLabels,
  onSwitchView,
  ThemeToggle,
  onOpenBill,
}: KitchenHeaderProps) {
  const categoryEntries: Array<[OrderCategory | 'all', string]> = [
    ['all', 'ΟΛΑ'],
    ...Object.entries(categoryLabels),
  ];

  return (
    <div className="shadow-md flex-shrink-0">
      {/* Title Bar */}
      <div className="bg-linear-to-r from-blue-700 to-blue-800 dark:from-blue-900 dark:to-slate-950 text-white p-4 flex items-center justify-between border-b dark:border-blue-900/50">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenBill}
            className="h-9 px-4 bg-white/10 text-white border-white/20 hover:bg-white/15 font-bold uppercase"
          >
            Λογαριασμός
          </Button>
          <h1 className="text-2xl font-bold">ΠΑΣΟ - {pendingCount} Παραγγελίες</h1>
        </div>
        <div className="flex items-center gap-3">
          {ThemeToggle}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onSwitchView('waiter')}
            className="h-9 px-4 bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-400 font-bold border dark:border-blue-900/50"
          >
            Waiter View
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onSwitchView('admin')}
            className="h-9 px-4 bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-400 font-bold border dark:border-blue-900/50"
          >
            Admin View
          </Button>
        </div>
      </div>
      
      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-2 px-4">
        <ScrollArea className="w-full">
          <div className="flex flex-wrap gap-2 pb-1 justify-between">
            <div className="flex flex-wrap gap-2">
              {filterKeys.map((key) => {
                const isActive = statusFilters[key];
                return (
                  <button
                    key={key}
                    onClick={() => onFilterToggle(key)}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap border kitchen-filter-button',
                      `kitchen-status-${key}`,
                      isActive && 'is-active'
                    )}
                  >
                    {filterLabels[key]}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-muted-foreground">{pendingCount} παραγγελίες</span>
              <Button variant="ghost" size="sm" onClick={onFilterReset} className="h-8 px-3">
                Reset
              </Button>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {categoryEntries.map(([key, label]) => {
              const isActive = selectedCategory === key;
              return (
                <button
                  key={key}
                  onClick={() => onCategoryChange(key)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap border',
                    isActive
                      ? 'bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:border-blue-500'
                      : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-600'
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
