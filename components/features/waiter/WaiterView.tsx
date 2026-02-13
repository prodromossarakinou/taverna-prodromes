'use client';

import React, { useState } from 'react';
import { Plus, Minus, Send, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import { useOrders } from '@/contexts/OrderContext';
import { OrderCategory, OrderItem } from '@/types/order';
import { toast } from 'sonner';

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
      <div className="bg-blue-600 text-white p-4 shadow-lg">
        <h1 className="text-xl font-bold mb-3 text-white">Λήψη Παραγγελίας</h1>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="table" className="text-white text-xs mb-1">Τραπέζι</Label>
            <Input
              id="table"
              type="text"
              inputMode="numeric"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="π.χ. 12"
              className="bg-white h-12 text-lg text-black"
            />
          </div>
          <div>
            <Label htmlFor="waiter" className="text-white text-xs mb-1">Σερβιτόρος</Label>
            <Input
              id="waiter"
              type="text"
              value={waiterName}
              onChange={(e) => setWaiterName(e.target.value)}
              placeholder="Όνομα"
              className="bg-white h-12 text-black"
            />
          </div>
        </div>
      </div>

      <div className="bg-card border-b overflow-x-auto flex-shrink-0">
        <div className="flex">
          {(Object.keys(MENU_ITEMS) as OrderCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-3 whitespace-nowrap border-b-4 transition-colors text-sm font-medium ${
                selectedCategory === cat
                  ? `${CATEGORY_COLORS[cat]} text-white border-blue-800`
                  : 'border-transparent text-muted-foreground hover:bg-accent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-100 dark:bg-gray-800">
        <div className="grid grid-cols-2 gap-3 mb-4">
          {MENU_ITEMS[selectedCategory].map((item) => (
            <button
              key={item}
              onClick={() => addItemToOrder(item)}
              className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-md border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg dark:hover:shadow-blue-500/20 transition-all active:scale-95 text-left h-20 flex items-center justify-center text-center"
            >
              <span className="font-medium text-foreground leading-tight">{item}</span>
            </button>
          ))}
        </div>
      </div>

      {currentOrder.length > 0 && (
        <div className="bg-white dark:bg-gray-850 border-t-4 border-gray-300 dark:border-gray-600 shadow-2xl max-h-64 overflow-y-auto">
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-foreground">
                Παραγγελία ({currentOrder.reduce((sum, item) => sum + item.quantity, 0)})
              </h3>
              <Button variant="ghost" size="sm" onClick={clearOrder} className="text-destructive">
                <Trash2 className="size-4 mr-1" />
                Καθαρισμός
              </Button>
            </div>
            <div className="space-y-2 mb-4">
              {currentOrder.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-gray-100 dark:bg-gray-700/80 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{item.name}</div>
                    <Badge className={`${CATEGORY_COLORS[item.category]} text-white text-[10px] mt-1`}>
                      {item.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, -1)} className="h-8 w-8 p-0">
                      <Minus className="size-4" />
                    </Button>
                    <span className="w-8 text-center font-bold text-lg">{item.quantity}</span>
                    <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, 1)} className="h-8 w-8 p-0">
                      <Plus className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={submitOrder} className="w-full h-14 text-lg bg-green-600 hover:bg-green-700 text-white">
              <Send className="size-5 mr-2" />
              Αποστολή
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
