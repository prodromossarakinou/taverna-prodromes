'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useOrders } from '@/contexts/OrderContext';
import { OrderCategory } from '@/types/order';
import { KitchenHeader } from './KitchenHeader';
import { OrderCard } from './OrderCard';
import { Button } from '@/components/ui/Button';
import { Popup } from '@/components/ui/Popup';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { cn } from '@/components/ui/utils';
import { BillTotals } from '@/components/features/billing/BillTotals';
import type { Bill } from '@/types/bill';
import {
  DEFAULT_KITCHEN_FILTERS,
  KITCHEN_FILTER_KEYS,
  KITCHEN_FILTER_LABELS,
  KitchenOrderFilterKey,
  resolveOrderStatus,
} from './orderStatus';

const FILTER_STORAGE_KEY = 'kitchen-status-filters';

// Κατηγορίες: παράγονται δυναμικά από τα Menu Items

interface KitchenDisplayProps {
  onSwitchView: (view: 'waiter' | 'kitchen' | 'admin') => void;
  ThemeToggle: React.ReactNode;
}

export function KitchenDisplay({ onSwitchView, ThemeToggle }: KitchenDisplayProps) {
  const {
    orders,
    menuItems,
    deleteOrder,
    updateItemStatus,
    updateItemUnitStatus,
    setItemStatus,
    setItemUnitStatus,
    setOrderStatus,
    refreshOrders,
  } = useOrders();
  // Bill popup state (Kitchen)
  const [billOpen, setBillOpen] = useState(false);
  const [selectedBillTable, setSelectedBillTable] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [billLoading, setBillLoading] = useState(false);
  const [billError, setBillError] = useState<string | null>(null);
  const [billSearch, setBillSearch] = useState<string>('');
  const [billData, setBillData] = useState<{
    baseOrders: typeof orders;
    extraOrders: typeof orders;
    totals: { baseTotal: number; extrasTotal: number; grandTotal: number };
    missingPriceItemIds: string[];
  } | null>(null);
  // Τελικό σύνολο όπως προκύπτει μετά την έκπτωση (ενημερώνεται από BillTotals)
  const [billComputedTotal, setBillComputedTotal] = useState<number | null>(null);
  const [billDiscount, setBillDiscount] = useState<{ type: 'percent' | 'amount'; value: number } | null>(null);
  // Υπάρχον λογαριασμός (αν υπάρχει για το τραπέζι)
  const [existingBill, setExistingBill] = useState<Bill | null>(null);
  // Panel για αφαίρεση items από τον υπολογισμό (UI-only προς το παρόν)
  const [removePanelOpen, setRemovePanelOpen] = useState(false);
  const [removedKeys, setRemovedKeys] = useState<Set<string>>(new Set());
  const [statusFilters, setStatusFilters] = useState<Record<KitchenOrderFilterKey, boolean>>({
    ...DEFAULT_KITCHEN_FILTERS,
  });
  const [selectedCategory, setSelectedCategory] = useState<OrderCategory | 'all'>('all');
  // High-level view filter: Active | Closed | Deleted | All (default: Active)
  const [viewFilter, setViewFilter] = useState<'active' | 'closed' | 'deleted' | 'all'>('active');
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const m of menuItems) {
      if (m.active !== false && m.category) set.add(m.category);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'el')) as OrderCategory[];
  }, [menuItems]);
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
    // Compose high-level view filter with existing granular/category filters
    const byView = (() => {
      if (viewFilter === 'all') return categoryFilteredOrders;
      if (viewFilter === 'active') {
        return categoryFilteredOrders.filter(o => o.status !== 'closed' && o.status !== 'deleted');
      }
      if (viewFilter === 'closed') {
        return categoryFilteredOrders.filter(o => o.status === 'closed');
      }
      // deleted
      return categoryFilteredOrders.filter(o => o.status === 'deleted');
    })();
    // If performance becomes an issue with very large lists, consider list virtualization.
    return byView;
  }, [categoryFilteredOrders, viewFilter]);

  // Build bill from a selected BASE order (non-extra). Aggregation rule: base + its extras via parentId.
  const buildBillFromBase = (baseOrderId: string) => {
    try {
      setBillError(null);
      setBillLoading(true);

      const base = orders.find(o => o.id === baseOrderId && !o.isExtra && !o.parentId);
      if (!base) {
        throw new Error('Base order not found');
      }
      const baseOrders = [base];
      const extraOrders = orders.filter((o) => o.isExtra === true && o.parentId === baseOrderId);
      const missing: string[] = [];

      const calcSection = (sectionOrders: typeof orders) => {
        let total = 0;
        for (const o of sectionOrders) {
          for (const it of o.items) {
            // Resolve price by name+category (fallback to name) — order items don't carry menu.id
            const match =
              menuItems.find((m) => m.name === it.name && m.category === it.category) ||
              menuItems.find((m) => m.name === it.name);
            const p = match?.price;
            if (typeof p !== 'number' || !Number.isFinite(p as number)) {
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
      // reset τυχόν αφαιρέσεις όταν αλλάζει τραπέζι
      setRemovedKeys(new Set());
    } catch (error: any) {
      setBillError(error?.message ?? 'Σφάλμα υπολογισμού');
    } finally {
      setBillLoading(false);
    }
  };

  // Αναζητά υπάρχον ανοιχτό bill για το επιλεγμένο base order (per root)
  const fetchExistingBillForBase = async (baseId: string | null, table: string | null) => {
    try {
      if (!table) { setExistingBill(null); return; }
      const res = await fetch(`/api/bills?table=${encodeURIComponent(table)}&status=open`);
      if (!res.ok) { setExistingBill(null); return; }
      const bills: Bill[] = await res.json();
      // Find the bill that includes this base id specifically
      const match = bills.find(b => Array.isArray(b.baseOrderIds) && b.baseOrderIds.includes(baseId ?? '')) ?? null;
      setExistingBill(match);
    } catch {
      setExistingBill(null);
    }
  };

  const handleFilterToggle = (key: KitchenOrderFilterKey) => {
    setStatusFilters(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleFilterReset = () => {
    setStatusFilters({ ...DEFAULT_KITCHEN_FILTERS });
  };

  const handleItemClick = async (orderId: string, itemId: string): Promise<void> => {
    await updateItemStatus(orderId, itemId);
  };

  // Όταν αλλάζει το billData, ορίσε αρχικό computed total = grandTotal (χωρίς έκπτωση)
  useEffect(() => {
    if (billData) {
      setBillComputedTotal(billData.totals.grandTotal);
    } else {
      setBillComputedTotal(null);
    }
  }, [billData]);

  // Όποτε αλλάζει το επιλεγμένο base order/τραπέζι, έλεγξε εάν υπάρχει ήδη λογαριασμός
  useEffect(() => {
    void fetchExistingBillForBase(selectedOrderId, selectedBillTable);
  }, [selectedOrderId, selectedBillTable]);

  // Προσαρμοσμένα σύνολα με βάση τα items που έχουν επιλεγεί για αφαίρεση (UI only)
  const adjustedTotals = useMemo(() => {
    if (!billData) return null as null | { baseTotal: number; extrasTotal: number };
    let removedBase = 0;
    let removedExtras = 0;
    const priceOf = (name: string, category?: string | null) => {
      const match =
        menuItems.find(m => m.name === name && m.category === (category ?? m.category)) ||
        menuItems.find(m => m.name === name);
      return typeof match?.price === 'number' && Number.isFinite(match.price) ? (match.price as number) : 0;
    };
    for (const o of billData.baseOrders) {
      for (const it of o.items) {
        const key = `${o.id}:${it.id}`;
        if (removedKeys.has(key)) {
          removedBase += (it.quantity ?? 0) * priceOf(it.name, it.category);
        }
      }
    }
    for (const o of billData.extraOrders) {
      for (const it of o.items) {
        const key = `${o.id}:${it.id}`;
        if (removedKeys.has(key)) {
          removedExtras += (it.quantity ?? 0) * priceOf(it.name, it.category);
        }
      }
    }
    return {
      baseTotal: Math.max(0, billData.totals.baseTotal - removedBase),
      extrasTotal: Math.max(0, billData.totals.extrasTotal - removedExtras),
    };
  }, [billData, removedKeys, menuItems]);

  // Δημιουργία ή ενημέρωση λογαριασμού, ανάλογα με το εάν υπάρχει
  const handleCreateOrUpdateBill = async () => {
    if (!selectedBillTable || !billData) return;
    try {
      const baseOrderIds = billData.baseOrders.map(o => o.id); // exactly one base
      const extraOrderIds = billData.extraOrders.map(o => o.id); // derived via parentId
      const waiterName = billData.baseOrders[0]?.waiterName ?? billData.extraOrders[0]?.waiterName ?? null;

      if (existingBill) {
        // Ενημέρωση (PATCH) έκπτωσης/συνόλων στο υπάρχον bill
        const payload: any = {};
        // Αντιστοίχιση root base + derive extras (server θα το επιβάλει ξανά)
        payload.baseOrderIds = baseOrderIds;
        payload.extraOrderIds = extraOrderIds;
        if (billDiscount && billDiscount.value > 0) {
          payload.discount = { type: billDiscount.type, value: billDiscount.value };
        } else {
          // Μηδενισμός έκπτωσης αν είχε πριν
          payload.discount = { type: 'amount', value: 0 };
        }
        const res = await fetch(`/api/bills/${existingBill.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to update bill');
        const updated: Bill = await res.json();
        setExistingBill(updated);
        // Προαιρετικό feedback
        console.log('Bill updated:', updated);
        return;
      }

      // Δημιουργία νέου (POST)
      const payload: any = {
        tableNumber: selectedBillTable,
        waiterName,
        baseOrderIds,
        extraOrderIds,
      };
      if (billDiscount && billDiscount.value > 0) {
        payload.discount = { type: billDiscount.type, value: billDiscount.value };
      }
      const res = await fetch('/api/bills', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) {
        if (res.status === 409) {
          const data = await res.json().catch(() => ({}));
          const id = data?.billId ? ` (ID: ${data.billId})` : '';
          if (typeof window !== 'undefined') {
            window.alert(`Υπάρχει ήδη λογαριασμός για αυτό το τραπέζι/παραγγελίες${id}. Επιτρέπεται μόνο επεξεργασία.`);
          }
          // Refresh existing bill scoped to the currently selected base order (root) and table
          await fetchExistingBillForBase(selectedOrderId, selectedBillTable);
          return;
        }
        throw new Error('Failed to create bill');
      }
      const created: Bill = await res.json();
      setExistingBill(created);
      console.log('Bill created:', created);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePrintBill = async () => {
    if (!existingBill) return;
    try {
      const url = `/api/bills/${existingBill.id}/print`;
      // Άνοιγμα νέου tab κατευθείαν στο PDF endpoint
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      console.error('Print failed:', e);
    }
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
        categories={categories}
        onSwitchView={onSwitchView}
        ThemeToggle={ThemeToggle}
        onOpenBill={() => setBillOpen(true)}
        onOpenMenu={() => {
          try {
            window.open('/api/menu/print', '_blank', 'noopener,noreferrer');
          } catch (e) {
            console.error('Open live menu failed:', e);
          }
        }}
      />

      <div className="p-4">
        {/* High-level status filter: Active | Closed | Deleted | All */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {([
            { key: 'active', label: 'Active' },
            { key: 'closed', label: 'Closed' },
            { key: 'deleted', label: 'Deleted' },
            { key: 'all', label: 'All' },
          ] as Array<{ key: 'active'|'closed'|'deleted'|'all'; label: string }>).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setViewFilter(key)}
              className={cn(
                'px-3 py-1.5 rounded text-xs font-semibold border',
                viewFilter === key
                  ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 border-transparent'
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              )}
            >
              {label}
            </button>
          ))}
        </div>
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
                onSetUnitStatus={setItemUnitStatus}
                onSetOrderStatus={setOrderStatus}
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

      {/* Bill Calculation Popup (Kitchen) */}
      <Popup
        open={billOpen}
        title="Λογαριασμός"
        onClose={() => { setBillOpen(false); setSelectedBillTable(null); setBillData(null); setBillError(null); setBillComputedTotal(null); setBillDiscount(null); }}
        onConfirm={() => setBillOpen(false)}
        confirmText={billData ? `Κλείσιμο • €${(billComputedTotal ?? billData.totals.grandTotal).toFixed(2)}` : 'Κλείσιμο'}
      >
        <div className="flex flex-col gap-3 text-sm max-h-[70vh]">
          {/* Header / Instructions */}
          <div className="text-muted-foreground">
            Επιλέξτε τραπέζι για υπολογισμό λογαριασμού. Θα εμφανιστεί αναλυτική ανάλυση (βάση + extras) και σύνολα.
          </div>

          {/* Table/Orders Picker */}
          <div className="rounded-lg border bg-card text-card-foreground">
            <div className="px-3 py-2 border-b text-xs font-semibold opacity-80 flex items-center justify-between">
              <span>{selectedOrderId ? 'Επιλεγμένη Παραγγελία' : 'Ενεργά Τραπέζια'}</span>
              <button
                type="button"
                onClick={() => { setSelectedOrderId(null); setSelectedBillTable(null); setBillData(null); }}
                className={cn(
                  'text-xs underline opacity-80 hover:opacity-100 transition-colors',
                  selectedOrderId ? 'visible' : 'opacity-60'
                )}
                title="Επιστροφή στα τραπέζια"
              >
                Ενεργά τραπέζια
              </button>
            </div>
            {/* Search input (filters base orders by tableNumber/waiterName) */}
            {!selectedOrderId && (
              <div className="px-3 py-2 border-b">
                <input
                  type="text"
                  value={billSearch}
                  onChange={(e) => setBillSearch(e.target.value)}
                  placeholder="Search table or waiter…"
                  className="w-full px-2 py-1.5 rounded border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-sm"
                />
              </div>
            )}
            <ScrollArea className="max-h-40">
              <div className="p-2 space-y-1">
                {(() => {
                  // Exclude only cancelled; allow completed to appear for billing
                  ///DO NOT TOUCH, ONLY CANCELLED SHOULD BE EXCLUDED
                  const OPEN_STATUSES_EXCLUDE = new Set(['cancelled',]);
                  const openOrders = orders.filter((o) => !OPEN_STATUSES_EXCLUDE.has((o.status as string) ?? ''));

                  if (!orders.length) {
                    return <div className="text-center py-4 text-muted-foreground">Φόρτωση...</div>;
                  }

                  if (selectedOrderId) {
                    const order = orders.find(o => o.id === selectedOrderId);
                    if (!order) {
                      return <div className="text-center py-4 text-muted-foreground">Η παραγγελία δεν βρέθηκε</div>;
                    }
                    return (
                      <div className="space-y-1">
                        <div className="px-3 py-2 text-sm">
                          <div className="font-semibold">Τραπέζι {order.tableNumber}</div>
                          <div className="text-xs opacity-80">{order.waiterName}</div>
                        </div>
                      </div>
                    );
                  }

                  // Λίστα τραπεζιών και παραγγελιών: κλικ σε ΤΡΑΠΕΖΙ -> βλέπεις τις παραγγελίες του, κλικ σε ΠΑΡΑΓΓΕΛΙΑ -> δείχνει λογαριασμό για αυτό το τραπέζι
                  // Apply client-side search ONLY on BASE orders: match by tableNumber or waiterName (case-insensitive, partial)
                  const lc = billSearch.trim().toLowerCase();
                  const baseOrders = openOrders.filter(o => !o.isExtra && !o.parentId);
                  const filteredBase = lc.length === 0
                    ? baseOrders
                    : baseOrders.filter(o => {
                        const t = String(o.tableNumber ?? '').toLowerCase();
                        const w = String(o.waiterName ?? '').toLowerCase();
                        return t.includes(lc) || w.includes(lc);
                      });

                  const byTable = new Map<string, { orders: typeof orders }>();
                  for (const o of filteredBase) {
                    const key = o.tableNumber;
                    const prev = byTable.get(key) ?? { orders: [] as typeof orders };
                    prev.orders.push(o);
                    byTable.set(key, prev);
                  }
                  const entries = Array.from(byTable.entries()).sort((a, b) => {
                    const an = parseInt(a[0], 10);
                    const bn = parseInt(b[0], 10);
                    if (!Number.isNaN(an) && !Number.isNaN(bn)) return an - bn;
                    return a[0].localeCompare(b[0], 'el');
                  });

                  if (entries.length === 0) {
                    return <div className="text-center py-4 text-muted-foreground">Δεν υπάρχουν ενεργά τραπέζια</div>;
                  }

                  return entries.map(([table, data]) => (
                    <div key={table} className="rounded-md border p-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <button
                        type="button"
                        onClick={() => { setSelectedOrderId(null); setSelectedBillTable(table); /* selecting table no longer triggers build */ }}
                        className={cn(
                          'w-full text-left px-2 py-1 rounded-md transition-colors font-semibold select-none hover:bg-accent/50 cursor-pointer',
                          selectedBillTable === table ? 'text-blue-700 dark:text-blue-300' : 'text-foreground'
                        )}
                        title={`Επιλογή τραπεζιού ${table}`}
                      >
                        Τραπέζι {table}
                      </button>
                      <div className="mt-1 grid grid-cols-2 gap-1">
                        {data.orders
                          .filter(o => !o.isExtra && !o.parentId) // only base orders selectable for billing root
                          .map((o) => {
                          const time = new Date(o.timestamp).toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit', hour12: false });
                          const isExtra = o.isExtra === true;
                          return (
                            <button
                              key={o.id}
                              type="button"
                              onClick={() => { setSelectedOrderId(o.id); setSelectedBillTable(o.tableNumber); buildBillFromBase(o.id); }}
                              className={cn(
                                'text-left text-xs px-2 py-1 rounded-md border bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-1',
                                isExtra && 'ring-1 ring-orange-400/60 dark:ring-orange-400/40'
                              )}
                              title={isExtra ? 'EXTRA' : 'BASE ORDER'}
                            >
                              <span className={cn('font-semibold truncate max-w-[90px]', isExtra ? 'text-orange-600 dark:text-orange-300' : 'text-foreground')}>
                                {o.waiterName || '—'}
                              </span>
                              <span className="opacity-70">• {time}</span>
                              {isExtra && (
                                <span className="ml-auto text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300">extra</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </ScrollArea>
          </div>

          {/* Content area: Bill breakdown and totals */}
          <div className="flex flex-col gap-3 min-h-[200px]">
            {billLoading && (
              <div className="text-center py-6 text-muted-foreground">Φόρτωση λογαριασμού...</div>
            )}
            {billError && (
              <div className="text-center py-6 text-destructive">Σφάλμα: {billError}</div>
            )}
            {!billLoading && !billError && selectedBillTable && billData && (
              <>
                <div className="p-3 pb-0">
                  {/* ΒΑΣΗ: Λίστα αντικειμένων */}
                  <div className="text-xs font-bold uppercase opacity-80">Βάση</div>
                  {[...billData.baseOrders].flatMap((o) =>
                      o.items.map((it) => {
                        const menu =
                            menuItems.find((m) => m.name === it.name && m.category === it.category) ||
                            menuItems.find((m) => m.name === it.name);
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

                  {/* EXTRA ανά παραγγελία: Header με ID/Ώρα/Waiter και λίστα προϊόντων */}
                  {billData.extraOrders.length > 0 && (
                      <div className="space-y-3">
                        <div className="text-xs font-bold uppercase opacity-80">Extras ({billData.extraOrders.length})</div>
                        {billData.extraOrders.map((extra) => {
                          const extraTime = new Intl.DateTimeFormat('el-GR', {
                            hour: '2-digit', minute: '2-digit', hour12: false,
                          }).format(new Date(extra.timestamp));
                          // Υπολογισμός συνόλου για το συγκεκριμένο EXTRA
                          const extraTotal = extra.items.reduce((sum, it) => {
                            const match =
                              menuItems.find((m) => m.name === it.name && m.category === it.category) ||
                              menuItems.find((m) => m.name === it.name);
                            const p = match?.price;
                            const has = typeof p === 'number' && Number.isFinite(p as number);
                            return sum + (it.quantity ?? 0) * (has ? (p as number) : 0);
                          }, 0);
                          return (
                            <div key={extra.id} className="rounded-md border bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                              <div className="px-2 py-1 text-[11px] font-semibold uppercase opacity-80 flex items-center justify-between">
                                <span>EXTRA • ID: {extra.id}</span>
                                <span className="opacity-70 normal-case">{extra.waiterName} • {extraTime}</span>
                              </div>
                              <div className="p-1">
                                {extra.items.map((it) => {
                                  const menu =
                                    menuItems.find((m) => m.name === it.name && m.category === it.category) ||
                                    menuItems.find((m) => m.name === it.name);
                                  const price = menu?.price;
                                  const hasPrice = typeof price === 'number' && Number.isFinite(price);
                                  const lineTotal = (it.quantity ?? 0) * (hasPrice ? (price as number) : 0);
                                  return (
                                    <div key={`${extra.id}-${it.id}`} className="flex items-center justify-between text-sm px-2 py-1 rounded hover:bg-accent/50">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">{it.quantity}× {it.name}</span>
                                        {!hasPrice && (
                                          <span className="text-amber-600 dark:text-amber-300 text-[10px] font-bold uppercase">NO PRICE</span>
                                        )}
                                      </div>
                                      <div className="font-semibold">€{lineTotal.toFixed(2)}</div>
                                    </div>
                                  );
                                })}
                                {/* Σύνολο για το συγκεκριμένο EXTRA */}
                                <div className="h-px bg-border my-1" />
                                <div className="flex items-center justify-between text-xs font-bold px-2 py-1">
                                  <span className="opacity-80">Σύνολο EXTRA</span>
                                  <span>€{extraTotal.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                </div>
                {/* Totals + Discount */}
                <div className="relative z-10 mt-2 pointer-events-auto space-y-2">
                  <BillTotals
                    baseTotal={adjustedTotals?.baseTotal ?? billData.totals.baseTotal}
                    extrasTotal={adjustedTotals?.extrasTotal ?? billData.totals.extrasTotal}
                    onTotalChange={(total, ctx) => {
                      // Αποφυγή infinite re-render: ενημερώνουμε state μόνο όταν αλλάζει πραγματικά η τιμή
                      setBillComputedTotal((prev) => (prev === total ? prev : total));

                      setBillDiscount((prev) => {
                        const next = ctx.type ? { type: ctx.type as 'percent' | 'amount', value: ctx.discount } : null;
                        if (
                          (prev === null && next === null) ||
                          (prev !== null && next !== null && prev.type === next.type && prev.value === next.value)
                        ) {
                          return prev; // καμία ουσιαστική αλλαγή
                        }
                        return next;
                      });
                    }}
                  />
                  <div className="flex items-center justify-between gap-2">
                    {existingBill ? (
                      <Button onClick={handlePrintBill} variant="secondary" className="h-9 px-4">
                        Εκτύπωση
                      </Button>
                    ) : <span />}
                    <Button onClick={handleCreateOrUpdateBill} className="h-9 px-4">
                      {existingBill ? 'Ενημέρωση' : 'Δημιουργία Λογαριασμού'}
                    </Button>
                    <Button onClick={() => setRemovePanelOpen((v) => !v)} variant="outline" className="h-9 px-4">
                      Αφαίρεση
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </Popup>
      {/* Panel αφαίρεσης items */}
      {billOpen && selectedBillTable && billData && removePanelOpen && (
        <div className="fixed right-4 bottom-20 z-50 w-[320px] max-h-[60vh] overflow-auto rounded-lg border bg-white dark:bg-gray-900 shadow-xl">
          <div className="px-3 py-2 border-b text-sm font-bold flex items-center justify-between">
            <span>Αφαίρεση από λογαριασμό</span>
            <button type="button" className="text-xs underline" onClick={() => setRemovePanelOpen(false)}>Κλείσιμο</button>
          </div>
          <div className="p-2 text-xs text-muted-foreground">Επίλεξε γραμμές που δεν θα χρεωθούν (μόνο στο UI προς το παρόν).</div>
          <div className="p-2 space-y-2">
            {/* Βάση */}
            <div>
              <div className="text-[11px] font-semibold uppercase opacity-80 mb-1">Βάση</div>
              {[...billData.baseOrders].flatMap((o) =>
                o.items.map((it) => {
                  const key = `${o.id}:${it.id}`;
                  const checked = removedKeys.has(key);
                  return (
                    <label key={key} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-accent/50">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          setRemovedKeys(prev => {
                            const next = new Set(prev);
                            if (e.target.checked) next.add(key); else next.delete(key);
                            return next;
                          });
                        }}
                      />
                      <span className="flex-1">{it.quantity}× {it.name}</span>
                    </label>
                  );
                })
              )}
            </div>
            {/* Extras */}
            {billData.extraOrders.length > 0 && (
              <div>
                <div className="text-[11px] font-semibold uppercase opacity-80 mb-1">Extras</div>
                {billData.extraOrders.flatMap((o) =>
                  o.items.map((it) => {
                    const key = `${o.id}:${it.id}`;
                    const checked = removedKeys.has(key);
                    return (
                      <label key={key} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-accent/50">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            setRemovedKeys(prev => {
                              const next = new Set(prev);
                              if (e.target.checked) next.add(key); else next.delete(key);
                              return next;
                            });
                          }}
                        />
                        <span className="flex-1">{it.quantity}× {it.name}</span>
                      </label>
                    );
                  })
                )}
              </div>
            )}
            <div className="pt-2 text-xs text-muted-foreground">Σημείωση: Η αφαίρεση εφαρμόζεται στα εμφανιζόμενα σύνολα. Αν θες μόνιμη εξαίρεση στα snapshots του Bill, ενημέρωσέ με να προσθέσω server-side υποστήριξη.</div>
          </div>
        </div>
      )}
      </div>
    );
    }
