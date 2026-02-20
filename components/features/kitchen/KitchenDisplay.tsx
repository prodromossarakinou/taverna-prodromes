'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useOrders } from '@/contexts/OrderContext';
import { OrderCategory } from '@/types/order';
import { KitchenHeader } from './KitchenHeader';
import { OrderCard } from './OrderCard';
import { Button } from '@/components/ui/Button';
import {
  DEFAULT_KITCHEN_FILTERS,
  KITCHEN_FILTER_KEYS,
  KITCHEN_FILTER_LABELS,
  KitchenOrderFilterKey,
  resolveOrderStatus,
} from './orderStatus';

const FILTER_STORAGE_KEY = 'kitchen-status-filters';

const CATEGORY_LABELS: Record<OrderCategory, string> = {
  'Κρύα': 'ΚΡΥΑ ΚΟΥΖΙΝΑ',
  'Ζεστές': 'ΖΕΣΤΕΣ ΣΑΛΑΤΕΣ',
  'Ψησταριά': 'ΨΗΣΤΑΡΙΑ',
  'Μαγειρευτό': 'ΜΑΓΕΙΡΕΥΤΟ',
  'Ποτά': 'ΠΟΤΑ',
};

interface KitchenDisplayProps {
  onSwitchView: (view: 'waiter' | 'kitchen' | 'admin') => void;
  ThemeToggle: React.ReactNode;
}

export function KitchenDisplay({ onSwitchView, ThemeToggle }: KitchenDisplayProps) {
  const {
    orders,
    deleteOrder,
    updateItemStatus,
    updateItemUnitStatus,
    setItemStatus,
    refreshOrders,
  } = useOrders();
  const [statusFilters, setStatusFilters] = useState<Record<KitchenOrderFilterKey, boolean>>({
    ...DEFAULT_KITCHEN_FILTERS,
  });
  const [selectedCategory, setSelectedCategory] = useState<OrderCategory | 'all'>('all');
  const [pendingUpdates, setPendingUpdates] = useState(0);
  const [isApplyingUpdates, setIsApplyingUpdates] = useState(false);
  const mappedOrders = useMemo(
    () =>
      orders.map(order => ({
        ...order,
        orderStatus: order.status,
        createdAt: order.timestamp,
      })),
    [orders]
  );
  const lastSeenOrdersRef = useRef(mappedOrders);

  const buildOrderSignature = (order: typeof mappedOrders[number]) => {
    const itemsSignature = [...order.items]
      .sort((a, b) => a.id.localeCompare(b.id))
      .map(item => {
        const unitsSignature = (item.units ?? [])
          .map(unit => `${unit.id}:${unit.status}`)
          .sort()
          .join(',');
        return `${item.id}:${item.itemStatus}:${item.quantity}:${item.extraNotes ?? ''}:${unitsSignature}`;
      })
      .join('|');
    return `${order.orderStatus}:${order.createdAt}:${itemsSignature}`;
  };

  const countOrderUpdates = (nextOrders: typeof mappedOrders, baseOrders: typeof mappedOrders) => {
    const baseMap = new Map(baseOrders.map(order => [order.id, buildOrderSignature(order)]));
    const nextMap = new Map(nextOrders.map(order => [order.id, buildOrderSignature(order)]));
    let updates = 0;

    nextMap.forEach((signature, id) => {
      const prevSignature = baseMap.get(id);
      if (!prevSignature || prevSignature !== signature) {
        updates += 1;
      }
    });

    baseMap.forEach((_signature, id) => {
      if (!nextMap.has(id)) {
        updates += 1;
      }
    });

    return updates;
  };

  const checkForUpdates = async () => {
    try {
      const response = await fetch('/api/orders');
      if (!response.ok) return;
      const data = await response.json();
      const mappedData = (data as typeof orders).map(order => ({
        ...order,
        orderStatus: order.status,
        createdAt: order.timestamp,
      }));
      const updates = countOrderUpdates(mappedData, lastSeenOrdersRef.current);
      setPendingUpdates(prev => (updates > 0 ? updates : prev));
    } catch (error) {
      console.error('Error checking order updates:', error);
    }
  };

  const applyUpdates = async () => {
    if (isApplyingUpdates) return;
    setIsApplyingUpdates(true);
    await refreshOrders();
    setPendingUpdates(0);
    setIsApplyingUpdates(false);
  };

  useEffect(() => {
    void refreshOrders();
    const intervalId = window.setInterval(() => {
      void checkForUpdates();
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, [refreshOrders]);

  useEffect(() => {
    const stored = window.localStorage.getItem(FILTER_STORAGE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as KitchenOrderFilterKey[];
      if (!Array.isArray(parsed)) return;
      const nextFilters = { ...DEFAULT_KITCHEN_FILTERS };
      parsed.forEach((key) => {
        if (key in nextFilters) {
          nextFilters[key] = true;
        }
      });
      setStatusFilters(nextFilters);
    } catch (error) {
      console.error('Failed to parse kitchen filters:', error);
    }
  }, []);

  useEffect(() => {
    const enabled = Object.entries(statusFilters)
      .filter(([, isEnabled]) => isEnabled)
      .map(([key]) => key);
    window.localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(enabled));
  }, [statusFilters]);

  useEffect(() => {
    lastSeenOrdersRef.current = mappedOrders;
    if (pendingUpdates > 0) {
      setPendingUpdates(0);
    }
  }, [mappedOrders]);

  const statusFilteredOrders = useMemo(() => {
    return mappedOrders
      .filter(order => statusFilters[resolveOrderStatus(order)])
      .sort((a, b) => a.createdAt - b.createdAt);
  }, [mappedOrders, statusFilters]);

  const categoryFilteredOrders = useMemo(() => {
    if (selectedCategory === 'all') {
      return statusFilteredOrders;
    }
    return statusFilteredOrders.filter(order =>
      order.items.some(item => item.category === selectedCategory)
    );
  }, [selectedCategory, statusFilteredOrders]);

  const filteredOrders = useMemo(() => {
    return categoryFilteredOrders.slice(0, 10);
  }, [categoryFilteredOrders]);

  const handleFilterToggle = (key: KitchenOrderFilterKey) => {
    setStatusFilters(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleFilterReset = () => {
    setStatusFilters({ ...DEFAULT_KITCHEN_FILTERS });
  };

  const handleItemClick = (orderId: string, itemId: string) => {
    updateItemStatus(orderId, itemId);
  };

  return (
    <div className="min-h-screen bg-background">
      <KitchenHeader
        pendingCount={statusFilteredOrders.length}
        statusFilters={statusFilters}
        filterKeys={KITCHEN_FILTER_KEYS}
        filterLabels={KITCHEN_FILTER_LABELS}
        onFilterToggle={handleFilterToggle}
        onFilterReset={handleFilterReset}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categoryLabels={CATEGORY_LABELS}
        onSwitchView={onSwitchView}
        ThemeToggle={ThemeToggle}
      />

      <div className="p-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">Δεν υπάρχουν εκκρεμείς παραγγελίες</p>
          </div>
        ) : (
          <div className="flex flex-nowrap gap-3 overflow-x-auto pb-4">
            {filteredOrders.map((order, index) => (
              <OrderCard
                key={order.id}
                order={order}
                index={index}
                onDelete={deleteOrder}
                onItemStatusCycle={handleItemClick}
                onUnitStatusCycle={updateItemUnitStatus}
                onSetItemStatus={setItemStatus}
              />
            ))}
          </div>
        )}
      </div>

      {pendingUpdates > 0 && (
        <div className="fixed top-4 left-4 z-50 flex items-center gap-3 rounded-lg bg-blue-600 px-4 py-3 text-white shadow-lg">
          <span className="text-sm font-semibold">
            Υπάρχουν {pendingUpdates} ενημερώσεις
          </span>
          <Button
            size="sm"
            variant="secondary"
            onClick={applyUpdates}
            disabled={isApplyingUpdates}
            className="text-blue-700"
          >
            {isApplyingUpdates ? 'Φόρτωση...' : 'Ανανέωση'}
          </Button>
        </div>
      )}
    </div>
  );
}
