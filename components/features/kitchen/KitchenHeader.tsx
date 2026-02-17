'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { OrderCategory } from '@/types/order';

interface KitchenHeaderProps {
  pendingCount: number;
  selectedFilter: OrderCategory | 'all';
  onFilterChange: (filter: OrderCategory | 'all') => void;
  categoryLabels: Record<OrderCategory, string>;
  // View Switcher Props
  onSwitchView: (view: 'waiter' | 'kitchen') => void;
  ThemeToggle: React.ReactNode;
}

export function KitchenHeader({
  pendingCount,
  selectedFilter,
  onFilterChange,
  categoryLabels,
  onSwitchView,
  ThemeToggle,
}: KitchenHeaderProps) {
  return (
    <div className="shadow-md flex-shrink-0">
      {/* Title Bar */}
      <div className="bg-linear-to-r from-blue-700 to-blue-800 dark:from-blue-800 dark:to-blue-950 text-white p-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">ΠΑΣΟ - {pendingCount} Παραγγελίες</h1>
        <div className="flex items-center gap-3">
          {ThemeToggle}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onSwitchView('waiter')}
            className="h-9 px-4 bg-white text-blue-700 font-bold"
          >
            Waiter View
          </Button>
        </div>
      </div>
      
      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-2 px-4">
        <ScrollArea className="w-full">
          <div className="flex gap-2 pb-1 justify-end">
            <button
              onClick={() => onFilterChange('all')}
              className={`
                px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap border
                ${selectedFilter === 'all'
                  ? 'bg-slate-800 text-white border-slate-800 dark:bg-slate-700 dark:border-slate-700'
                  : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-600'
                }
              `}
            >
              ΟΛA ({pendingCount})
            </button>
            {(Object.keys(categoryLabels) as OrderCategory[]).map((cat) => {
              const isActive = selectedFilter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => onFilterChange(cat)}
                  className={`
                    px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap border
                    ${isActive
                      ? 'bg-slate-800 text-white border-slate-800 dark:bg-slate-700 dark:border-slate-700'
                      : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-600'
                    }
                  `}
                >
                  {categoryLabels[cat]}
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
