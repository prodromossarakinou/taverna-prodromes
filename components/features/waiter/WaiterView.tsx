'use client';

import React, { useState, useEffect } from 'react';
import { useOrders } from '@/contexts/OrderContext';
import { MenuItem as MenuItemType, OrderCategory, OrderItem, WaiterParams } from '@/types/order';
import { toast } from 'sonner';
import { WaiterHeader } from './WaiterHeader';
import { Popup } from '@/components/ui/Popup';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { CategorySelector } from './CategorySelector';
import { MenuGrid } from './MenuGrid';
import { OrderSummary } from './OrderSummary';

interface WaiterViewProps {
  params: WaiterParams;
  onBack?: () => void;
  // View switcher props passed from page
  onSwitchView: (view: 'waiter' | 'kitchen' | 'admin') => void;
  onStartNew: () => void;
  onRequestPick: (mode: 'view' | 'extras') => void;
  onOpenMobileMenu: () => void;
  ThemeToggle: React.ReactNode;
}

const CATEGORY_COLORS: Record<OrderCategory, string> = {
  'Κρύα': 'bg-green-500',
  'Ζεστές': 'bg-orange-500',
  'Ψησταριά': 'bg-red-500',
  'Μαγειρευτό': 'bg-purple-500',
  'Ποτά': 'bg-blue-500',
};

export function WaiterView({ 
  params, 
  onBack,
  onSwitchView,
  onStartNew,
  onRequestPick,
  onOpenMobileMenu,
  ThemeToggle,
}: WaiterViewProps) {
  const { mode, orderId } = params;
  const { addOrder, orders, menuItems } = useOrders();
  const [tableNumber, setTableNumber] = useState('');
  const [waiterName, setWaiterName] = useState('');
  const [extraNotes, setExtraNotes] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<OrderCategory>('Κρύα');
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [originalItems, setOriginalItems] = useState<OrderItem[]>([]);
  // Popup states for header fields and item notes
  const [tableOpen, setTableOpen] = useState(false);
  const [waiterOpen, setWaiterOpen] = useState(false);
  const [orderNotesOpen, setOrderNotesOpen] = useState(false);
  const [itemNoteOpen, setItemNoteOpen] = useState(false);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  const [tempTable, setTempTable] = useState('');
  const [tempWaiter, setTempWaiter] = useState('');
  const [tempOrderNotes, setTempOrderNotes] = useState('');
  const [tempItemNote, setTempItemNote] = useState('');

  // Confirmation popups for submit & clear
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  const activeMenuItems: MenuItemType[] = menuItems.filter((item) => item.active);
  const menuCategories = Array.from(
    new Set(activeMenuItems.map((item) => item.category))
  ) as OrderCategory[];
  const menuItemsForCategory: MenuItemType[] = activeMenuItems.filter(
    (item) => item.category === selectedCategory
  );

  // Validate params and load order data if in view or extras mode
  useEffect(() => {
    // Enforce explicit params contract
    if ((mode === 'view' || mode === 'extras') && !orderId) {
      toast.error('Λείπει το orderId για τη λειτουργία προβολής/εκδόσεων');
      onBack?.();
      return;
    }

    if ((mode === 'view' || mode === 'extras') && orderId) {
      const existingOrder = orders.find(o => o.id === orderId);
      if (existingOrder) {
        setTableNumber(existingOrder.tableNumber);
        setWaiterName(existingOrder.waiterName);
        setExtraNotes(existingOrder.extraNotes || '');
        if (mode === 'view') {
          setCurrentOrder(existingOrder.items);
          setOriginalItems([]);
        } else {
          // In extras mode, currentOrder starts empty for new extras,
          // while originalItems stores the base order for reference.
          setCurrentOrder([]);
          setOriginalItems(existingOrder.items);
        }
      }
    } else if (mode === 'new') {
      // Reset state for new order
      setTableNumber('');
      setWaiterName('');
      setExtraNotes('');
      setCurrentOrder([]);
    }
  }, [mode, orderId, orders, onBack]);


  useEffect(() => {
    if (menuCategories.length > 0 && !menuCategories.includes(selectedCategory)) {
      setSelectedCategory(menuCategories[0]);
    }
  }, [menuCategories, selectedCategory]);

  const addItemToOrder = (menuItem: MenuItemType) => {
    if (mode === 'view') return;

    const existingItem = currentOrder.find(
      item => item.name === menuItem.name && item.category === menuItem.category
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
        name: menuItem.name,
        quantity: 1,
        category: menuItem.category,
        itemStatus: 'pending',
      };
      setCurrentOrder(prev => [...prev, newItem]);
    }
  };

  const updateQuantity = (itemId: string, delta: number) => {
    if (mode === 'view' || mode === 'extras') return; // Quantity locked for extras too as per spec

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

  const applyItemNote = (itemId: string, value: string | null) => {
    if (mode === 'view') return;
    setCurrentOrder(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, extraNotes: value }
          : item
      )
    );
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

    if (mode === 'new') {
      addOrder({
        tableNumber: tableNumber.trim(),
        items: currentOrder,
        waiterName: waiterName.trim() || 'Σερβιτόρος',
        extraNotes: extraNotes.trim() || null,
      });
      toast.success(`Παραγγελία για τραπέζι ${tableNumber} στάλθηκε!`);
    } else if (mode === 'extras') {
      // Extras must be created as a new kitchen order containing ONLY newly added items.
      if (currentOrder.length > 0) {
        addOrder({
          tableNumber: tableNumber.trim(),
          items: currentOrder, // currentOrder already contains only the new extras in this revised logic
          waiterName: waiterName.trim() || 'Σερβιτόρος',
          extraNotes: null, // Original order-level notes NOT included in extras order per spec
          isExtra: true,
          parentId: orderId,
        } as any);
        toast.success(`Extras για τραπέζι ${tableNumber} στάλθηκαν!`);
      } else {
        toast.info('Δεν προστέθηκαν νέα extras');
      }
    }

    if (onBack) onBack();
    else {
      // Reset for next order if no navigation back
      setCurrentOrder([]);
      setTableNumber('');
      setExtraNotes('');
    }
  };

  const clearOrder = () => {
    if (mode === 'view' || mode === 'extras') {
      if (onBack) onBack();
      return;
    }
    setCurrentOrder([]);
    toast.info('Η παραγγελία καθαρίστηκε');
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <WaiterHeader
        tableNumber={tableNumber}
        onEditTable={() => { setTempTable(tableNumber); setTableOpen(true); }}
        waiterName={waiterName}
        onEditWaiter={() => { setTempWaiter(waiterName); setWaiterOpen(true); }}
        extraNotes={extraNotes}
        onEditNotes={() => { setTempOrderNotes(extraNotes ?? ''); setOrderNotesOpen(true); }}
        readOnly={mode === 'view'}
        onSwitchView={onSwitchView}
        currentMode={mode}
        onStartNew={onStartNew}
        onRequestPick={onRequestPick}
        onOpenMobileMenu={onOpenMobileMenu}
        ThemeToggle={ThemeToggle}
      />

      {mode !== 'view' && menuCategories.length > 0 && (
        <CategorySelector
          categories={menuCategories}
          selectedCategory={selectedCategory}
          onSelect={setSelectedCategory}
          categoryColors={CATEGORY_COLORS}
        />
      )}

      {mode !== 'view' && menuCategories.length === 0 && (
        <div className="flex-1 overflow-y-auto p-4 bg-gray-100 dark:bg-gray-800 text-sm text-muted-foreground">
          Δεν υπάρχουν διαθέσιμα προϊόντα.
        </div>
      )}

      {mode !== 'view' && menuCategories.length > 0 && (
        <MenuGrid
          items={menuItemsForCategory}
          onAddItem={addItemToOrder}
        />
      )}

      <OrderSummary
        currentOrder={currentOrder}
        originalItems={originalItems}
        onUpdateQuantity={updateQuantity}
        onEditNote={(id, currentValue) => { if (mode === 'view') return; setActiveItemId(id); setTempItemNote(currentValue ?? ''); setItemNoteOpen(true); }}
        onClearOrder={() => setClearConfirmOpen(true)}
        onSubmitOrder={() => setSubmitConfirmOpen(true)}
        categoryColors={CATEGORY_COLORS}
        mode={mode}
        onBack={onBack}
      />

      {/* Popups */}
      <Popup open={tableOpen} title="Ορισμός τραπεζιού" onClose={() => setTableOpen(false)} onConfirm={() => { setTableNumber(tempTable.trim()); setTableOpen(false); }} confirmText="Επιβεβαίωση">
        <div className="space-y-2">
          <Label htmlFor="table-popup">Τραπέζι</Label>
          <Input id="table-popup" inputMode="numeric" value={tempTable} onChange={(e) => setTempTable(e.target.value)} className="h-12 text-lg" />
        </div>
      </Popup>

      <Popup open={waiterOpen} title="Ορισμός σερβιτόρου" onClose={() => setWaiterOpen(false)} onConfirm={() => { setWaiterName(tempWaiter.trim()); setWaiterOpen(false); }} confirmText="Επιβεβαίωση">
        <div className="space-y-2">
          <Label htmlFor="waiter-popup">Σερβιτόρος</Label>
          <Input id="waiter-popup" value={tempWaiter} onChange={(e) => setTempWaiter(e.target.value)} className="h-12" />
        </div>
      </Popup>

      <Popup open={orderNotesOpen} title="Σημειώσεις Παραγγελίας" onClose={() => setOrderNotesOpen(false)} onConfirm={() => { setExtraNotes(tempOrderNotes.trim()); setOrderNotesOpen(false); }} confirmText="Αποθήκευση">
        <div className="space-y-2">
          <Label htmlFor="order-notes-popup">Σημειώσεις</Label>
          <Input id="order-notes-popup" value={tempOrderNotes} onChange={(e) => setTempOrderNotes(e.target.value)} className="h-12" />
        </div>
      </Popup>

      <Popup open={itemNoteOpen} title="Σημείωση Προϊόντος" onClose={() => { setItemNoteOpen(false); setActiveItemId(null); }} onConfirm={() => { if (activeItemId) { const v = tempItemNote.trim(); applyItemNote(activeItemId, v ? v : null); } setItemNoteOpen(false); setActiveItemId(null); }} confirmText="Αποθήκευση">
        <div className="space-y-2">
          <Label htmlFor="item-note-popup">Σημείωση</Label>
          <Input id="item-note-popup" value={tempItemNote} onChange={(e) => setTempItemNote(e.target.value)} className="h-12" />
        </div>
      </Popup>

      {/* Confirm Submit */}
      <Popup
        open={submitConfirmOpen}
        title={mode === 'extras' ? 'Επιβεβαίωση αποθήκευσης Extras' : 'Επιβεβαίωση αποστολής παραγγελίας'}
        onClose={() => setSubmitConfirmOpen(false)}
        onConfirm={() => { setSubmitConfirmOpen(false); submitOrder(); }}
        confirmText={mode === 'extras' ? 'Αποθήκευση' : 'Αποστολή'}
      >
        <div className="text-sm text-muted-foreground">
          {mode === 'extras'
            ? 'Θέλετε σίγουρα να αποθηκεύσετε τα νέα extras ως ξεχωριστή παραγγελία;'
            : 'Θέλετε σίγουρα να αποστείλετε την παραγγελία;'}
        </div>
      </Popup>

      {/* Confirm Clear / Cancel */}
      <Popup
        open={clearConfirmOpen}
        title={mode === 'extras' ? 'Ακύρωση Extras' : 'Καθαρισμός Παραγγελίας'}
        onClose={() => setClearConfirmOpen(false)}
        onConfirm={() => { setClearConfirmOpen(false); clearOrder(); }}
        confirmText={mode === 'extras' ? 'Ακύρωση' : 'Καθαρισμός'}
      >
        <div className="text-sm text-muted-foreground">
          {mode === 'extras'
            ? 'Να ακυρωθούν οι αλλαγές extras και να επιστρέψετε;'
            : 'Να καθαριστεί η τρέχουσα παραγγελία;'}
        </div>
      </Popup>
    </div>
  );
}
