'use client';

import React, { useState, useMemo } from 'react';
import { useOrders } from '@/contexts/OrderContext';
import { OrderCategory } from '@/types/order';
import { KitchenHeader } from './KitchenHeader';
import { OrderCard } from './OrderCard';

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
  const { orders, deleteOrder, updateItemStatus } = useOrders();
  const [selectedFilter, setSelectedFilter] = useState<OrderCategory | 'all'>('all');

  const pendingOrders = useMemo(() => {
    return orders
      .filter(order => order.status === 'pending')
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [orders]);

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
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
    </div>
  );
}
