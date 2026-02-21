'use client';

import React from 'react';
import { FileText } from 'lucide-react';
import { MenuItem, OrderCategory } from '@/types/order';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/components/ui/utils';

interface MenuItemCardProps {
  item: MenuItem;
  onClick: () => void;
}

const CATEGORY_STYLES: Record<OrderCategory, string> = {
  'Κρύα': 'bg-green-500 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/80',
  'Ζεστές': 'bg-orange-500 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/80',
  'Ψησταριά': 'bg-red-500 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/80',
  'Μαγειρευτό': 'bg-purple-500 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/80',
  'Ποτά': 'bg-blue-500 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/80',
};

export function MenuItemCard({ item, onClick }: MenuItemCardProps) {
  const isActive = item.active !== false;
  const hasNotes = Boolean(item.extraNotes?.trim());

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-lg border-2 p-4 transition-all duration-150 ease-in-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        isActive
          ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/80 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md active:scale-[0.98]'
          : 'bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-600/80 opacity-60 hover:border-gray-400 dark:hover:border-gray-500',
      )}
    >
      <Badge className={cn('mb-2 text-white dark:border', CATEGORY_STYLES[item.category])}>{item.category}</Badge>
      <div className={cn('font-bold mb-2 line-clamp-2 min-h-10', isActive ? 'text-foreground' : 'text-muted-foreground')}>
        {item.name}
      </div>
      <div className={cn('text-lg font-medium mb-2', isActive ? 'text-foreground' : 'text-muted-foreground')}>
        €{(item.price ?? 0).toFixed(2)}
      </div>
      {hasNotes ? (
        <div className={cn('flex items-center gap-1 text-sm mb-2', isActive ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground')}>
          <FileText className="size-4" />
          <span>Σημειώσεις</span>
        </div>
      ) : null}
      <div className="flex items-center gap-1.5 text-sm">
        <span className={cn('inline-block size-2 rounded-full', isActive ? 'bg-green-600 dark:bg-green-500' : 'bg-gray-400 dark:bg-gray-600')} />
        <span className={cn(isActive ? 'text-foreground' : 'text-muted-foreground')}>{isActive ? 'Ενεργό' : 'Ανενεργό'}</span>
      </div>
    </button>
  );
}