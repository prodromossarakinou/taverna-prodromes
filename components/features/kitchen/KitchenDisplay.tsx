'use client';

import React, { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { useOrders } from '@/contexts/OrderContext';
import { OrderCategory, OrderItem } from '@/types/order';

const CATEGORY_LABELS: Record<OrderCategory, string> = {
  'Κρύα': 'ΚΡΥΑ ΚΟΥΖΙΝΑ',
  'Ζεστές': 'ΖΕΣΤΕΣ ΣΑΛΑΤΕΣ',
  'Ψησταριά': 'ΨΗΣΤΑΡΙΑ',
  'Μαγειρευτό': 'ΜΑΓΕΙΡΕΥΤΟ',
  'Ποτά': 'ΠΟΤΑ',
};

export function KitchenDisplay() {
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

  const groupItemsByCategory = (items: OrderItem[]) => {
    const grouped: Record<string, OrderItem[]> = {};
    items.forEach(item => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });
    return grouped;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-slate-800 text-white p-4 shadow-lg">
        <div className="max-w-full mx-auto">
          <h1 className="text-2xl font-bold mb-3">ΠΑΣΟ - {pendingOrders.length} Παραγγελίες</h1>
          
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-2">
              <Button
                variant={selectedFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedFilter('all')}
                size="sm"
                className="whitespace-nowrap"
              >
                ΟΛA ({pendingOrders.length})
              </Button>
              {(Object.keys(CATEGORY_LABELS) as OrderCategory[]).map((cat) => {
                const count = pendingOrders.filter(order =>
                  order.items.some(item => item.category === cat)
                ).length;
                return (
                  <Button
                    key={cat}
                    variant={selectedFilter === cat ? 'default' : 'outline'}
                    onClick={() => setSelectedFilter(cat)}
                    size="sm"
                    className="whitespace-nowrap"
                  >
                    {CATEGORY_LABELS[cat]} ({count})
                  </Button>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>

      <div className="p-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">Δεν υπάρχουν εκκρεμείς παραγγελίες</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredOrders.map((order, index) => {
              const displayedItems = selectedFilter === 'all' 
                ? order.items 
                : order.items.filter(item => item.category === selectedFilter);
              
              const groupedItems = groupItemsByCategory(displayedItems);

              return (
                <div
                  key={order.id}
                  className="bg-card rounded-lg shadow-md border-2 border-border"
                >
                  <div className="bg-muted/50 p-3 flex items-center justify-between border-b-2 border-border">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-1 rounded bg-blue-600 text-white">
                        #{index + 1}
                      </span>
                      <h3 className="text-xl font-bold text-foreground">
                        Τραπέζι {order.tableNumber}
                      </h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteOrder(order.id)}
                      className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>

                  <div className="p-3 space-y-3">
                    {Object.entries(groupedItems).map(([category, items]) => (
                      <div key={category}>
                        <div className="text-xs font-bold text-muted-foreground mb-1 uppercase">
                          {CATEGORY_LABELS[category as OrderCategory]}
                        </div>
                        <div className="space-y-1">
                          {items.map((item) => {
                            const status = item.itemStatus || 'pending';
                            const bgColor = 
                              status === 'delivered' ? 'bg-green-500 text-white border-transparent' :
                              status === 'ready' ? 'bg-blue-500 text-white border-transparent' : 
                              'bg-card border-border';
                            
                            return (
                              <button
                                key={item.id}
                                onClick={() => handleItemClick(order.id, item.id)}
                                className={`w-full text-left p-2 rounded border-2 transition-all ${bgColor} ${
                                  status === 'pending' ? 'hover:border-primary' : ''
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className={`text-sm font-medium ${status === 'pending' ? 'text-foreground' : 'text-white'}`}>{item.name}</span>
                                  <span className={`text-lg font-bold ${status === 'pending' ? 'text-foreground' : 'text-white'}`}>×{item.quantity}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
