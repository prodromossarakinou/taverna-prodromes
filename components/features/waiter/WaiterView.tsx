'use client';

import React, { useState } from 'react';
import { useOrders } from '@/contexts/OrderContext';
import { OrderCategory, OrderItem } from '@/types/order';
import { toast } from 'sonner';
import { WaiterHeader } from './WaiterHeader';
import { CategorySelector } from './CategorySelector';
import { MenuGrid } from './MenuGrid';
import { OrderSummary } from './OrderSummary';

const MENU_ITEMS: Record<OrderCategory, string[]> = {
  'Κρύα': [
    'Χωριάτικη Σαλάτα',
    'Πράσινη Σαλάτα',
    'Ρόκα με Παρμεζάνα',
    'Καίσαρ',
    'Ντοματοσαλάτα',
  ],
  'Ζεστές': [
    'Ζεστή Σαλάτα με Κοτόπουλο',
    'Σαλάτα με Γαρίδες',
  ],
  'Ψησταριά': [
    'Μπριζόλα Χοιρινή',
    'Μπριζόλα Μοσχαρίσια',
    'Κοτόπουλο Φιλέτο',
    'Μπιφτέκι',
    'Σουβλάκι Χοιρινό',
    'Σουβλάκι Κοτόπουλο',
  ],
  'Μαγειρευτό': [
    'Μουσακάς',
    'Παστίτσιο',
    'Παπουτσάκια',
    'Γιουβέτσι',
    'Κοκκινιστό',
  ],
  'Ποτά': [
    'Κόκα Κόλα',
    'Σπράιτ',
    'Φάντα',
    'Νερό',
    'Μπύρα',
    'Κρασί Λευκό',
    'Κρασί Κόκκινο',
    'Καφές',
  ],
};

const CATEGORY_COLORS: Record<OrderCategory, string> = {
  'Κρύα': 'bg-green-500',
  'Ζεστές': 'bg-orange-500',
  'Ψησταριά': 'bg-red-500',
  'Μαγειρευτό': 'bg-purple-500',
  'Ποτά': 'bg-blue-500',
};

export function WaiterView() {
  const { addOrder } = useOrders();
  const [tableNumber, setTableNumber] = useState('');
  const [waiterName, setWaiterName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<OrderCategory>('Κρύα');
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);

  const addItemToOrder = (itemName: string) => {
    const existingItem = currentOrder.find(
      item => item.name === itemName && item.category === selectedCategory
    );

    if (existingItem) {
      setCurrentOrder(prev =>
        prev.map(item =>
          item.id === existingItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      const newItem: OrderItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: itemName,
        quantity: 1,
        category: selectedCategory,
        itemStatus: 'pending',
      };
      setCurrentOrder(prev => [...prev, newItem]);
    }
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCurrentOrder(prev =>
      prev
        .map(item =>
          item.id === itemId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  const removeItem = (itemId: string) => {
    setCurrentOrder(prev => prev.filter(item => item.id !== itemId));
  };

  const submitOrder = () => {
    if (!tableNumber.trim()) {
      toast.error('Παρακαλώ εισάγετε αριθμό τραπεζιού');
      return;
    }

    if (currentOrder.length === 0) {
      toast.error('Προσθέστε προϊόντα στην παραγγελία');
      return;
    }

    addOrder({
      tableNumber: tableNumber.trim(),
      items: currentOrder,
      waiterName: waiterName.trim() || 'Σερβιτόρος',
    });

    toast.success(`Παραγγελία για τραπέζι ${tableNumber} στάλθηκε!`);
    setCurrentOrder([]);
    setTableNumber('');
  };

  const clearOrder = () => {
    setCurrentOrder([]);
    toast.info('Η παραγγελία καθαρίστηκε');
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <WaiterHeader
        tableNumber={tableNumber}
        setTableNumber={setTableNumber}
        waiterName={waiterName}
        setWaiterName={setWaiterName}
      />

      <CategorySelector
        categories={Object.keys(MENU_ITEMS) as OrderCategory[]}
        selectedCategory={selectedCategory}
        onSelect={setSelectedCategory}
        categoryColors={CATEGORY_COLORS}
      />

      <MenuGrid
        items={MENU_ITEMS[selectedCategory]}
        onAddItem={addItemToOrder}
      />

      <OrderSummary
        currentOrder={currentOrder}
        onUpdateQuantity={updateQuantity}
        onClearOrder={clearOrder}
        onSubmitOrder={submitOrder}
        categoryColors={CATEGORY_COLORS}
      />
    </div>
  );
}
