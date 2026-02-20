'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { cn } from '@/components/ui/utils';
import { KitchenOrderFilterKey } from './orderStatus';

interface KitchenHeaderProps {
  pendingCount: number;
  statusFilters: Record<KitchenOrderFilterKey, boolean>;
  filterKeys: KitchenOrderFilterKey[];
  filterLabels: Record<KitchenOrderFilterKey, string>;
  onFilterToggle: (filter: KitchenOrderFilterKey) => void;
  onFilterReset: () => void;
  // View Switcher Props
  onSwitchView: (view: 'waiter' | 'kitchen' | 'admin') => void;
  ThemeToggle: React.ReactNode;
}

export function KitchenHeader({
  pendingCount,
  statusFilters,
  filterKeys,
  filterLabels,
  onFilterToggle,
  onFilterReset,
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
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onSwitchView('admin')}
            className="h-9 px-4 bg-white text-blue-700 font-bold"
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
                      'px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap border',
                      isActive
                        ? 'bg-slate-800 text-white border-slate-800 dark:bg-slate-700 dark:border-slate-700'
                        : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-600'
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
        </ScrollArea>
      </div>
    </div>
  );
}
