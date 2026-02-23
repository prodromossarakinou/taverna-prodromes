'use client';

import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ItemStatus, Order, OrderCategory, OrderItem, OrderItemUnit } from '@/types/order';
import { OrderItemRow } from './OrderItemRow';
import { cn } from '@/components/ui/utils';
import { getOrderAccent, KitchenOrderStatus, normalizeOrderStatus } from './orderStatus';
import { Popup } from '@/components/ui/Popup';
import { useOrders } from '@/contexts/OrderContext';

// Δυναμικές κατηγορίες: εμφανίζουμε την κατηγορία όπως έρχεται από τα Menu Items

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
  const { renameOrderTable, removeOrderItem } = useOrders();
  // Locale-aware collator (Greek + English) for stable A–Z / Α–Ω sorting
  const collator = useMemo(
    () => new Intl.Collator(['el', 'en'], { sensitivity: 'base', numeric: true }),
    []
  );
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editPopupOpen, setEditPopupOpen] = useState(false);
  const [edited, setEdited] = useState(false);
  const [draftTable, setDraftTable] = useState(order.tableNumber);
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

  // Sorted category keys (Α–Ω / A–Z)
  const sortedCategoryKeys = useMemo(() => {
    return Object.keys(groupedItems).sort((a, b) => collator.compare(String(a), String(b)));
  }, [groupedItems, collator]);
  const normalizedStatus = normalizeOrderStatus(order.status);
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
    setDraftTable(order.tableNumber);
    setDraftOrderStatus(normalizeOrderStatus(order.status));
    setDraftItemStatuses(itemStatuses);
    setDraftUnitStatuses(unitStatuses);
    setIsEditing(true);
    setEditPopupOpen(true);
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

  const canEdit = normalizedStatus !== 'closed' && order.status !== 'deleted';

  const handleRenameTable = async () => {
    const next = (draftTable ?? '').toString().trim();
    if (!next || next === order.tableNumber) return;
    await renameOrderTable(order.id, next);
    setEdited(true);
  };

  const handleRemoveItem = async (itemId: string) => {
    await removeOrderItem(order.id, itemId);
    setEdited(true);
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
        accentClass,
        order.status === 'deleted' && 'opacity-60 grayscale'
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
            {edited && (
              <span className="mt-1 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-200 w-fit">
                EDITED
              </span>
            )}
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
                onClick={startEdit}
                className="h-7 px-3"
                disabled={!canEdit}
                title={!canEdit ? 'Order is read-only' : 'Edit statuses'}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditPopupOpen(true)}
                className="h-7 px-3"
                disabled={!canEdit}
                title={!canEdit ? 'Order is read-only' : 'Edit table / remove items'}
              >
                Edit order…
              </Button>
            </>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={startEdit}
              className="h-7 px-3"
              disabled={!canEdit}
              title={!canEdit ? 'Order is read-only' : 'Edit order'}
            >
              Edit
            </Button>
          )}
          {normalizedStatus === 'closed' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(order.id)}
              className="h-7 px-3"
            >
              Οριστική διαγραφή
            </Button>
          )}
        </div>
      </div>

      <div className="p-3 space-y-3 overflow-y-auto">
        {sortedCategoryKeys.map((category) => {
          const items = (groupedItems[category] ?? []).slice().sort((a, b) =>
            collator.compare(a.name ?? '', b.name ?? '')
          );
          return (
          <div key={category}>
            <div className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 uppercase">
              {String(category)}
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
          );
        })}
      </div>

      {/* Edit popup: table rename + remove items */}
      <Popup
        open={editPopupOpen}
        title="Edit order"
        onClose={() => { setEditPopupOpen(false); setIsEditing(false); }}
        onConfirm={() => { setEditPopupOpen(false); setIsEditing(false); }}
        confirmText="Done"
      >
        <div className="flex flex-col gap-3 text-sm max-h-[70vh]">
          <div className="space-y-1">
            <div className="text-xs font-semibold opacity-80">Table name/number</div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={draftTable}
                onChange={(e) => setDraftTable(e.target.value)}
                className="flex-1 px-2 py-1.5 rounded border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                disabled={!canEdit}
              />
              <Button size="sm" onClick={handleRenameTable} disabled={!canEdit}>
                Save
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-semibold opacity-80">Order status</div>
            <div className="flex items-center gap-2">
              <select
                value={draftOrderStatus}
                onChange={(event) => setDraftOrderStatus(event.target.value as KitchenOrderStatus)}
                className="h-8 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 text-xs font-semibold"
                disabled={!canEdit}
              >
                {ORDER_STATUSES.map(option => (
                  <option key={option} value={option}>
                    {ORDER_STATUS_LABELS[option]}
                  </option>
                ))}
              </select>
              <Button size="sm" onClick={async () => { await onSetOrderStatus(order.id, draftOrderStatus); setEdited(true); }} disabled={!canEdit}>
                Save
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-semibold opacity-80">Items</div>
            <div className="space-y-1">
              {order.items.length === 0 && (
                <div className="text-xs opacity-70">No items</div>
              )}
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-2 rounded border px-2 py-1 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                  <div className="text-sm font-medium truncate">
                    {item.name} ×{item.quantity}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void handleRemoveItem(item.id)}
                    disabled={!canEdit}
                    className="h-7 px-2 text-xs"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Popup>
    </div>
  );
}
