'use client';

import React from 'react';
import { ItemStatus, OrderItem, OrderItemUnit } from '@/types/order';
import { cn } from '@/components/ui/utils';

interface OrderItemRowProps {
  item: OrderItem;
  isExpanded: boolean;
  isEditing: boolean;
  onToggleExpand: () => void;
  onCycleStatus: () => void;
  onUnitClick: (unit: OrderItemUnit, status: ItemStatus) => void;
  onUnitStatusChange?: (unit: OrderItemUnit, status: ItemStatus) => void;
  onItemStatusChange?: (status: ItemStatus) => void;
  unitStatusOverrides?: Record<string, ItemStatus>;
  itemStatusOverride?: ItemStatus;
}

const ITEM_STATUSES: ItemStatus[] = ['pending', 'ready', 'delivered'];

const STATUS_LABELS: Record<ItemStatus, string> = {
  pending: 'NEW',
  ready: 'STARTED',
  delivered: 'DONE',
};

export function OrderItemRow({
  item,
  isExpanded,
  isEditing,
  onToggleExpand,
  onCycleStatus,
  onUnitClick,
  onUnitStatusChange,
  onItemStatusChange,
  unitStatusOverrides,
  itemStatusOverride,
}: OrderItemRowProps) {
  const fallbackStatus = itemStatusOverride ?? item.itemStatus ?? 'pending';
  
  const statusStyles = {
    pending: 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400',
    ready: 'bg-blue-500 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/80 text-white border-transparent',
    delivered: 'bg-green-500 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/80 text-white border-transparent',
  };

  // Build units and ensure a stable, locale/number-aware order that does not depend on status
  const units = item.units && item.units.length > 0
    ? item.units
    : Array.from({ length: item.quantity }, (_value, index) => ({
        id: `${item.id}-unit-${index}`,
        status: fallbackStatus,
        unitIndex: index,
      }));
  // Sort by numeric unitIndex first; fall back to id with numeric compare for stability
  const sortedUnits = units.slice().sort((a, b) => {
    const ai = typeof a.unitIndex === 'number' ? a.unitIndex : Number.POSITIVE_INFINITY;
    const bi = typeof b.unitIndex === 'number' ? b.unitIndex : Number.POSITIVE_INFINITY;
    if (ai !== bi) return ai - bi;
    return String(a.id).localeCompare(String(b.id), undefined, { numeric: true, sensitivity: 'base' });
  });
  const unitStatuses = sortedUnits.map(unit => unitStatusOverrides?.[unit.id] ?? unit.status);
  const uniqueStatuses = new Set(unitStatuses);
  const isUnified = item.quantity > 1 && uniqueStatuses.size === 1;
  const mixedStatus = item.quantity > 1 && uniqueStatuses.size > 1;
  const status = isUnified ? unitStatuses[0] : fallbackStatus;

  const handleItemClick = () => {
    if (item.quantity > 1) {
      onToggleExpand();
      return;
    }
    onCycleStatus();
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleItemClick}
        className={cn(
          'w-full text-right py-1 px-2 rounded border-2 transition-all',
          statusStyles[status],
          item.quantity > 1 && 'cursor-pointer'
        )}
      >
        <div className="flex flex-col">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {item.name}
              </span>
              {mixedStatus && (
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200">
                  ΜΕΙΚΤΟ
                </span>
              )}
            </div>
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
      {isEditing && onItemStatusChange && (
        <div className="flex items-center justify-end gap-2">
          <span className="text-[10px] font-semibold text-muted-foreground">Item status</span>
          <select
            value={status}
            onChange={(event) => onItemStatusChange(event.target.value as ItemStatus)}
            className="h-7 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 text-[10px] font-semibold"
          >
            {ITEM_STATUSES.map(option => (
              <option key={option} value={option}>
                {STATUS_LABELS[option]}
              </option>
            ))}
          </select>
        </div>
      )}
      {isExpanded && item.quantity > 1 && (
        <div className="space-y-1">
          {sortedUnits.map((unit) => {
            const unitStatus = unitStatusOverrides?.[unit.id] ?? unit.status;
            return (
              <div key={unit.id} className="flex items-center justify-between gap-3">
                <button
                  onClick={() => onUnitClick(unit, unitStatus)}
                  className={cn(
                    'flex-1 text-right py-1 px-2 rounded border-2 transition-all text-xs',
                    statusStyles[unitStatus]
                  )}
                >
                  <span className="font-medium">
                    {item.name} ×1
                  </span>
                </button>
                {isEditing && onUnitStatusChange && (
                  <select
                    value={unitStatus}
                    onChange={(event) => onUnitStatusChange(unit, event.target.value as ItemStatus)}
                    className="h-7 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 text-[10px] font-semibold"
                  >
                    {ITEM_STATUSES.map(option => (
                      <option key={option} value={option}>
                        {STATUS_LABELS[option]}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
