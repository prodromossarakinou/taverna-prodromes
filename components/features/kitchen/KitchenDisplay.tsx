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
  const [billLoading, setBillLoading] = useState(false);
  const [billError, setBillError] = useState<string | null>(null);
  const [billData, setBillData] = useState<{
    baseOrders: typeof orders;
    extraOrders: typeof orders;
    totals: { baseTotal: number; extrasTotal: number; grandTotal: number };
    missingPriceItemIds: string[];
  } | null>(null);
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
    } catch (error: any) {
      setBillError(error?.message ?? 'Σφάλμα υπολογισμού');
    } finally {
      setBillLoading(false);
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
        onOpenBill={() => setBillOpen(true)}
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
                      onClick={() => { setSelectedBillTable(table); buildBill(table); }}
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
                          {info.count} παραγγ. {info.hasExtras ? '• + extras' : ''}
                        </div>
                      </div>
                    </button>
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
                <ScrollArea className="max-h-60 rounded-md border bg-card">
                  <div className="p-3 space-y-4 pb-24">
                    {/* Base Orders (πάνω) */}
                    <div>
                      <div className="text-xs font-bold uppercase opacity-80 mb-2">BASE ORDER</div>
                      <div className="space-y-1">
                        {billData.baseOrders.flatMap((o) =>
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
                    </div>

                    {/* Extras (κάτω) */}
                    <div>
                      <div className="text-xs font-bold uppercase opacity-80 mb-2">EXTRA</div>
                      {billData.extraOrders.length === 0 ? (
                        <div className="text-xs text-muted-foreground px-2">—</div>
                      ) : (
                        <div className="space-y-1">
                          {billData.extraOrders.flatMap((o) =>
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
                      )}
                    </div>
                  </div>
                </ScrollArea>

                {/* Divider */}
                <div className="h-px bg-border" />

                {/* Totals */}
                <div className="rounded-md border bg-card p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="opacity-80">Base</span>
                    <span className="font-semibold">€{billData.totals.baseTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="opacity-80">Extras</span>
                    <span className="font-semibold">€{billData.totals.extrasTotal.toFixed(2)}</span>
                  </div>
                  <div className="h-px bg-border my-2" />
                  <div className="flex items-center justify-between text-base font-bold">
                    <span>Σύνολο</span>
                    <span>€{billData.totals.grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </Popup>
    </div>
  );
}
