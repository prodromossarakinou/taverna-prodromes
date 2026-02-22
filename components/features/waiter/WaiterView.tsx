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
import { ScrollArea } from '@/components/ui/ScrollArea';
import { cn } from '@/components/ui/utils';
import { BillTotals } from '@/components/features/billing/BillTotals';

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
  // Bill popup state
  const [billOpen, setBillOpen] = useState(false);
  // Bill/table picker state
  const [selectedBillTable, setSelectedBillTable] = useState<string | null>(null);
  const [billLoading, setBillLoading] = useState(false);
  const [billError, setBillError] = useState<string | null>(null);
  const [billData, setBillData] = useState<{
    baseOrders: typeof orders;
    extraOrders: typeof orders;
    totals: { baseTotal: number; extrasTotal: number; grandTotal: number };
    missingPriceItemIds: string[];
  } | null>(null);

  // Build bill for a selected table (aggregation + totals)
  const buildBill = (table: string) => {
    try {
      setBillError(null);
      setBillLoading(true);

      const related = orders.filter((o) => o.tableNumber === table);
      const baseOrders = related.filter((o) => !o.isExtra && !o.parentId);
      const extraOrders = related.filter((o) => o.isExtra === true || Boolean(o.parentId));

      const priceById = new Map(menuItems.map((m) => [m.id, m.price]));
      const missing: string[] = [];

      const calcSection = (sectionOrders: typeof orders) => {
        let total = 0;
        for (const o of sectionOrders) {
          for (const it of o.items) {
            const p = priceById.get(it.id);
            if (typeof p !== 'number' || !Number.isFinite(p)) {
              missing.push(`${o.id}:${it.id}`);
              total += 0;
            } else {
              total += (it.quantity ?? 0) * p;
            }
          }
        }
        return total;
      };

      const baseTotal = calcSection(baseOrders);
      const extrasTotal = calcSection(extraOrders);
      const grandTotal = baseTotal + extrasTotal;

      if (missing.length > 0) {
        // eslint-disable-next-line no-console
        console.warn('Bill calculation: missing prices for items', missing);
      }

      setBillData({
        baseOrders,
        extraOrders,
        totals: { baseTotal, extrasTotal, grandTotal },
        missingPriceItemIds: missing,
      });
    } catch (e: any) {
      setBillError(e?.message ?? 'Αποτυχία υπολογισμού λογαριασμού');
    } finally {
      setBillLoading(false);
    }
  };

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
        onOpenBill={() => setBillOpen(true)}
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

      {/* Bill Calculation Popup (skeleton) */}
      <Popup
        open={billOpen}
        title="Λογαριασμός"
        onClose={() => { setBillOpen(false); setSelectedBillTable(null); setBillData(null); setBillError(null); }}
        onConfirm={() => setBillOpen(false)}
        confirmText="Κλείσιμο"
      >
        <div className="flex flex-col gap-3 text-sm max-h-[70vh]">
          {/* Header / Instructions */}
          <div className="text-muted-foreground">
            Επιλέξτε τραπέζι για υπολογισμό λογαριασμού. Θα εμφανιστεί αναλυτική ανάλυση (βάση + extras) και σύνολα.
          </div>

          {/* Table Picker */}
          <div className="rounded-lg border bg-card text-card-foreground">
            <div className="px-3 py-2 border-b text-xs font-semibold opacity-80">Ενεργά Τραπέζια</div>
            <ScrollArea className="max-h-40">
              <div className="p-2 space-y-1">
                {(() => {
                  // Determine open tables: any order with status NOT completed/cancelled
                  const OPEN_STATUSES_EXCLUDE = new Set(['completed', 'cancelled']);
                  const openOrders = orders.filter((o) => !OPEN_STATUSES_EXCLUDE.has((o.status as string) ?? ''));
                  const byTable = new Map<string, { count: number; hasExtras: boolean }>();
                  for (const o of openOrders) {
                    const key = o.tableNumber;
                    const prev = byTable.get(key) ?? { count: 0, hasExtras: false };
                    byTable.set(key, { count: prev.count + 1, hasExtras: prev.hasExtras || Boolean(o.isExtra) });
                  }
                  const entries = Array.from(byTable.entries()).sort((a, b) => {
                    const an = parseInt(a[0], 10);
                    const bn = parseInt(b[0], 10);
                    if (!Number.isNaN(an) && !Number.isNaN(bn)) return an - bn;
                    return a[0].localeCompare(b[0], 'el');
                  });

                  if (!orders.length) {
                    return (
                      <div className="text-center py-4 text-muted-foreground">Φόρτωση...</div>
                    );
                  }

                  if (entries.length === 0) {
                    return (
                      <div className="text-center py-4 text-muted-foreground">Δεν υπάρχουν ενεργά τραπέζια</div>
                    );
                  }

                  return entries.map(([table, info]) => (
                    <button
                      key={table}
                      type="button"
                      onClick={() => {
                        setSelectedBillTable(table);
                        buildBill(table);
                      }}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-md border transition-all',
                        selectedBillTable === table
                          ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/60 dark:text-blue-300'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">Τραπέζι {table}</div>
                        <div className="text-xs opacity-80">
                          {info.count} παραγγ.{info.count !== 1 ? '' : ''} {info.hasExtras ? '• + extras' : ''}
                        </div>
                      </div>
                    </button>
                  ));
                })()}
              </div>
            </ScrollArea>
          </div>

          {/* Content area: Bill breakdown and sticky totals */}
          <div className="flex flex-col gap-3 min-h-[200px]">
            {billLoading && (
              <div className="text-center py-6 text-muted-foreground">Φόρτωση λογαριασμού...</div>
            )}
            {billError && (
              <div className="text-center py-6 text-destructive">Σφάλμα: {billError}</div>
            )}
            {!billLoading && !billError && selectedBillTable && billData && (
              <>
                <ScrollArea className="max-h-[50vh] rounded-md border bg-card">
                  <div className="p-3 space-y-4 pb-40">
                    {/* Λίστα αντικειμένων: Πρώτα BASE, μετά EXTRA, χωρίς επικεφαλίδες */}
                    {[...billData.baseOrders, ...billData.extraOrders].flatMap((o) =>
                      o.items.map((it) => {
                        const menu = menuItems.find((m) => m.id === it.id);
                        const price = menu?.price;
                        const hasPrice = typeof price === 'number' && Number.isFinite(price);
                        const lineTotal = (it.quantity ?? 0) * (hasPrice ? (price as number) : 0);
                        return (
                          <div key={`${o.id}-${it.id}`} className="flex items-center justify-between text-sm px-2 py-1 rounded hover:bg-accent/50">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{it.quantity}× {it.name}</span>
                              {!hasPrice && (
                                <span className="text-amber-600 dark:text-amber-300 text-[10px] font-bold uppercase">NO PRICE</span>
                              )}
                            </div>
                            <div className="font-semibold">€{lineTotal.toFixed(2)}</div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>

                {/* Divider */}
                <div className="h-px bg-border mt-2" />

                {/* Totals + Discount */}
                <BillTotals
                  baseTotal={billData.totals.baseTotal}
                  extrasTotal={billData.totals.extrasTotal}
                />
              </>
            )}
          </div>
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
