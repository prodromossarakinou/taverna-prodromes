'use client';

import React, { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ItemStatus, Order, OrderCategory, OrderItem, OrderItemUnit } from '@/types/order';
import { OrderItemRow } from './OrderItemRow';
import { cn } from '@/components/ui/utils';
import { getOrderAccent, KitchenOrderStatus, normalizeOrderStatus } from './orderStatus';

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
  onSetUnitStatus: (orderId: string, unitId: string, status: ItemStatus) => Promise<void>;
  onSetOrderStatus: (orderId: string, status: KitchenOrderStatus) => Promise<void>;
}

const ORDER_STATUSES: KitchenOrderStatus[] = ['new', 'started', 'completed', 'delivered', 'closed'];

const ORDER_STATUS_LABELS: Record<KitchenOrderStatus, string> = {
  new: 'NEW',
  started: 'STARTED',
  completed: 'COMPLETED',
  delivered: 'DELIVERED',
  closed: 'CLOSED',
};

export function OrderCard({
  order,
  index,
  onDelete,
  onItemStatusCycle,
  onUnitStatusCycle,
  onSetItemStatus,
  onSetUnitStatus,
  onSetOrderStatus,
}: OrderCardProps) {
  const accentClass = getOrderAccent(order);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draftOrderStatus, setDraftOrderStatus] = useState<KitchenOrderStatus>(
    normalizeOrderStatus(order.status)
  );
  const [draftItemStatuses, setDraftItemStatuses] = useState<Record<string, ItemStatus>>({});
  const [draftUnitStatuses, setDraftUnitStatuses] = useState<Record<string, ItemStatus>>({});

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

  const startEdit = () => {
    const itemStatuses: Record<string, ItemStatus> = {};
    const unitStatuses: Record<string, ItemStatus> = {};
    order.items.forEach(item => {
      itemStatuses[item.id] = item.itemStatus ?? 'pending';
      buildUnitList(item).forEach(unit => {
        unitStatuses[unit.id] = unit.status;
      });
    });
    setDraftOrderStatus(normalizeOrderStatus(order.status));
    setDraftItemStatuses(itemStatuses);
    setDraftUnitStatuses(unitStatuses);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setDraftItemStatuses({});
    setDraftUnitStatuses({});
    setDraftOrderStatus(normalizeOrderStatus(order.status));
  };

  const saveEdit = async () => {
    if (isSaving) return;
    setIsSaving(true);
    const updates: Promise<void>[] = [];

    const normalizedOrderStatus = normalizeOrderStatus(order.status);
    if (draftOrderStatus !== normalizedOrderStatus) {
      updates.push(onSetOrderStatus(order.id, draftOrderStatus));
    }

    order.items.forEach(item => {
      const nextItemStatus = draftItemStatuses[item.id];
      if (nextItemStatus && nextItemStatus !== (item.itemStatus ?? 'pending')) {
        updates.push(onSetItemStatus(order.id, item.id, nextItemStatus));
      }
      buildUnitList(item).forEach(unit => {
        const nextUnitStatus = draftUnitStatuses[unit.id];
        if (nextUnitStatus && nextUnitStatus !== unit.status) {
          updates.push(onSetUnitStatus(order.id, unit.id, nextUnitStatus));
        }
      });
    });

    if (updates.length > 0) {
      await Promise.all(updates);
    }

    setIsSaving(false);
    setIsEditing(false);
  };

  const handleUnitClick = async (item: OrderItem, unit: OrderItemUnit, status: ItemStatus) => {
    if (isEditing) return;
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
      <div className="kitchen-order-card-header p-3 flex items-start justify-between gap-3 border-b-2">
        <div className="flex items-start gap-2 min-w-0">
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
            {isEditing && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] font-semibold text-muted-foreground">Status</span>
                <select
                  value={draftOrderStatus}
                  onChange={(event) => setDraftOrderStatus(event.target.value as KitchenOrderStatus)}
                  className="h-7 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 text-[10px] font-semibold"
                >
                  {ORDER_STATUSES.map(option => (
                    <option key={option} value={option}>
                      {ORDER_STATUS_LABELS[option]}
                    </option>
                  ))}
                </select>
              </div>
            )}
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
        <div className="flex flex-wrap items-center justify-end gap-2">
          {isEditing ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={saveEdit}
                disabled={isSaving}
                className="h-7 px-3"
              >
                Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelEdit}
                disabled={isSaving}
                className="h-7 px-3"
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={startEdit}
              className="h-7 px-3"
            >
              Edit
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(order.id)}
            className="h-7 w-7 shrink-0 p-0 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
          >
            <X className="size-4" />
          </Button>
        </div>
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
                  isEditing={isEditing}
                  onToggleExpand={() =>
                    setExpandedItems(prev => ({
                      ...prev,
                      [item.id]: !prev[item.id],
                    }))
                  }
                  onCycleStatus={() => onItemStatusCycle(order.id, item.id)}
                  onUnitClick={(unit, status) => handleUnitClick(item, unit, status)}
                  onItemStatusChange={
                    isEditing
                      ? (status) =>
                          setDraftItemStatuses(prev => ({
                            ...prev,
                            [item.id]: status,
                          }))
                      : undefined
                  }
                  onUnitStatusChange={
                    isEditing
                      ? (unit, status) =>
                          setDraftUnitStatuses(prev => ({
                            ...prev,
                            [unit.id]: status,
                          }))
                      : undefined
                  }
                  itemStatusOverride={isEditing ? draftItemStatuses[item.id] : undefined}
                  unitStatusOverrides={isEditing ? draftUnitStatuses : undefined}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
