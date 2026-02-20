'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useOrders } from '@/contexts/OrderContext';
import { OrderCategory } from '@/types/order';
import { KitchenHeader } from './KitchenHeader';
import { OrderCard } from './OrderCard';
import { Button } from '@/components/ui/Button';

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
  const { orders, deleteOrder, updateItemStatus, refreshOrders } = useOrders();
  const [selectedFilter, setSelectedFilter] = useState<OrderCategory | 'all'>('all');
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
      .map(item => `${item.id}:${item.itemStatus}:${item.quantity}:${item.extraNotes ?? ''}`)
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
    lastSeenOrdersRef.current = mappedOrders;
    if (pendingUpdates > 0) {
      setPendingUpdates(0);
    }
  }, [mappedOrders]);

  const pendingOrders = useMemo(() => {
    return mappedOrders
      .filter(order => order.orderStatus === 'pending')
      .sort((a, b) => a.createdAt - b.createdAt);
  }, [mappedOrders]);

  const filteredOrders = useMemo(() => {
    if (selectedFilter === 'all') {
      return pendingOrders.slice(0, 10);
    }
    return pendingOrders
      .filter(order => 
        order.items.some(item => item.category === selectedFilter)
      )
      .slice(0, 10);
  }, [pendingOrders, selectedFilter]);

  const handleItemClick = (orderId: string, itemId: string) => {
    updateItemStatus(orderId, itemId);
  };

  return (
    <div className="min-h-screen bg-background">
      <KitchenHeader
        pendingCount={pendingOrders.length}
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
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
                onItemClick={handleItemClick}
                categoryLabels={CATEGORY_LABELS}
                selectedFilter={selectedFilter}
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
