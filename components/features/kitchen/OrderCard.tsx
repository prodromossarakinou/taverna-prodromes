'use client';

import React, { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ItemStatus, Order, OrderCategory, OrderItem, OrderItemUnit } from '@/types/order';
import { OrderItemRow } from './OrderItemRow';
import { cn } from '@/components/ui/utils';
import { getOrderAccent } from './orderStatus';

const CATEGORY_LABELS: Record<OrderCategory, string> = {
  'Κρύα': 'ΚΡΥΑ ΚΟΥΖΙΝΑ',
  'Ζεστές': 'ΖΕΣΤΕΣ ΣΑΛΑΤΕΣ',
  'Ψησταριά': 'ΨΗΣΤΑΡΙΑ',
  'Μαγειρευτό': 'ΜΑΓΕΙΡΕΥΤΟ',
  'Ποτά': 'ΠΟΤΑ',
};

interface OrderCardProps {
  order: Order;
  index: number;
  onDelete: (id: string) => void;
  onItemStatusCycle: (orderId: string, itemId: string) => Promise<void>;
  onUnitStatusCycle: (orderId: string, unitId: string, status: ItemStatus) => Promise<void>;
  onSetItemStatus: (orderId: string, itemId: string, status: ItemStatus) => Promise<void>;
}

export function OrderCard({
  order,
  index,
  onDelete,
  onItemStatusCycle,
  onUnitStatusCycle,
  onSetItemStatus,
}: OrderCardProps) {
  const accentClass = getOrderAccent(order);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const groupedItems = useMemo(() => {
    const grouped: Record<string, OrderItem[]> = {};
    order.items.forEach(item => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });
    return grouped;
  }, [order.items]);
  const orderTime = new Intl.DateTimeFormat('el-GR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(order.timestamp));

  const buildUnitList = (item: OrderItem): OrderItemUnit[] => {
    if (item.units && item.units.length > 0) {
      return item.units;
    }
    return Array.from({ length: item.quantity }, (_value, index) => ({
      id: `${item.id}-unit-${index}`,
      status: item.itemStatus ?? 'pending',
      unitIndex: index,
    }));
  };

  const handleUnitClick = async (item: OrderItem, unit: OrderItemUnit, status: ItemStatus) => {
    const statuses: ItemStatus[] = ['pending', 'ready', 'delivered'];
    const currentIndex = statuses.indexOf(status || 'pending');
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    await onUnitStatusCycle(order.id, unit.id, status);

    const unitStatuses = buildUnitList(item).map(unitItem =>
      unitItem.id === unit.id ? nextStatus : unitItem.status
    );
    const isUnified = unitStatuses.every(unitStatus => unitStatus === unitStatuses[0]);
    const shouldCollapse = isUnified && (nextStatus === 'ready' || nextStatus === 'delivered');
    if (shouldCollapse) {
      await onSetItemStatus(order.id, item.id, nextStatus);
      setExpandedItems(prev => ({ ...prev, [item.id]: false }));
    }
  };

  return (
    <div
      className={cn(
        'kitchen-order-card bg-white dark:bg-gray-700 rounded-lg shadow-md border-2 flex flex-col min-w-[260px] sm:min-w-[300px] md:min-w-[340px] max-h-[70vh]',
        accentClass
      )}
    >
      <div className="kitchen-order-card-header p-3 flex items-center justify-between border-b-2">
        <div className="flex items-start gap-2">
          <span className="kitchen-order-accent-badge text-xs font-bold px-2 py-1 rounded">
            #{index + 1}
          </span>
          <div className="flex flex-col">
            <h3 className="text-lg font-bold leading-tight">
              Τραπέζι {order.tableNumber}
            </h3>
            <span className="text-xs font-semibold opacity-90">
              {order.waiterName} • {orderTime}
            </span>
            {order.isExtra && (
              <span className="kitchen-order-extra-badge text-[10px] font-bold px-1.5 py-0.5 rounded w-fit uppercase mt-1">
                EXTRA
              </span>
            )}
            {order.extraNotes && (
              <span className="text-[10px] font-bold uppercase truncate max-w-[150px] opacity-80 mt-1">
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

      <div className="p-3 space-y-3 overflow-y-auto">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category}>
            <div className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 uppercase">
              {CATEGORY_LABELS[category as OrderCategory] ?? category}
            </div>
            <div className="space-y-1">
              {items.map((item) => (
                <OrderItemRow
                  key={item.id}
                  item={item}
                  isExpanded={Boolean(expandedItems[item.id])}
                  onToggleExpand={() =>
                    setExpandedItems(prev => ({
                      ...prev,
                      [item.id]: !prev[item.id],
                    }))
                  }
                  onCycleStatus={() => onItemStatusCycle(order.id, item.id)}
                  onUnitClick={(unit, status) => handleUnitClick(item, unit, status)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
