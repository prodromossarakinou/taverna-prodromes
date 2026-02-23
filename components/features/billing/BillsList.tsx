'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { Bill } from '@/types/bill';
import { cn } from '@/components/ui/utils';

type BillStatusFilter = 'all' | 'open' | 'closed';

export function BillsList() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<BillStatusFilter>('all');
  const [closing, setClosing] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState('');
  const [waiterOptions, setWaiterOptions] = useState<string[]>([]);
  const [waiterFilter, setWaiterFilter] = useState<string>('all');

  useEffect(() => {
    const fetchBills = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/bills');
        if (!res.ok) throw new Error('Failed to fetch bills');
        const data = (await res.json()) as Bill[];
        // Keep a stable sort by createdAt desc initially
        const sorted = data.slice().sort((a, b) => b.createdAt - a.createdAt);
        setBills(sorted);
      } catch (e: any) {
        setError(e?.message ?? 'Failed to fetch bills');
      } finally {
        setLoading(false);
      }
    };
    void fetchBills();
  }, []);

  // Fetch waiter names from orders to populate the waiter dropdown (small, distinct set)
  useEffect(() => {
    const fetchWaiters = async () => {
      try {
        const res = await fetch('/api/orders');
        if (!res.ok) return;
        const data = (await res.json()) as Array<{ waiterName?: string | null }>;
        const names = Array.from(
          new Set(
            data
              .map(o => (o.waiterName ?? '').trim())
              .filter(name => name.length > 0)
          )
        ).sort((a, b) => a.localeCompare(b, 'el'));
        setWaiterOptions(names);
      } catch (e) {
        // non-blocking
      }
    };
    void fetchWaiters();
  }, []);

  const filteredBills = useMemo(() => {
    const byStatus = filter === 'all' ? bills : bills.filter((b) => b.status === filter);
    const byTable = search.trim().length
      ? byStatus.filter(b => String(b.tableNumber).toLowerCase().includes(search.trim().toLowerCase()))
      : byStatus;
    const byWaiter = waiterFilter !== 'all'
      ? byTable.filter(b => (b.waiterName ?? '').trim() === waiterFilter)
      : byTable;
    return byWaiter;
  }, [bills, filter, search, waiterFilter]);

  const closeBill = async (billId: string) => {
    if (closing[billId]) return;
    try {
      setClosing(prev => ({ ...prev, [billId]: true }));
      const res = await fetch(`/api/bills/${billId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'closed' }),
      });
      if (!res.ok) throw new Error('Failed to close bill');
      // Update local state optimistically to reflect the change immediately
      setBills(prev => prev.map(b => (b.id === billId ? { ...b, status: 'closed' } : b)));
    } catch (e: any) {
      setError(e?.message ?? 'Failed to close bill');
    } finally {
      setClosing(prev => ({ ...prev, [billId]: false }));
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h1 className="text-xl font-bold">Bills</h1>
        <div className="flex flex-1 items-center gap-2 sm:justify-end flex-wrap">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search table…"
            className="px-3 py-1.5 rounded text-sm border bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 min-w-[160px]"
          />
          <select
            value={waiterFilter}
            onChange={(e) => setWaiterFilter(e.target.value)}
            className="px-3 py-1.5 rounded text-sm border bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 min-w-[160px]"
          >
            <option value="all">All waiters</option>
            {waiterOptions.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          {(['all', 'open', 'closed'] as BillStatusFilter[]).map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                'px-3 py-1.5 rounded text-sm font-semibold border',
                filter === key
                  ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 border-transparent'
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              )}
            >
              {key === 'all' ? 'All' : key === 'open' ? 'Open' : 'Closed'}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="py-10 text-center">Loading…</div>}
      {error && (
        <div className="py-10 text-center text-destructive">{error}</div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 gap-3 overflow-y-auto">
          {filteredBills.map((bill) => (
            <div
              key={bill.id}
              className={cn(
                'rounded border-2 p-3 bg-white dark:bg-gray-800',
                bill.status === 'open'
                  ? 'border-blue-400/70'
                  : bill.status === 'closed'
                  ? 'border-green-400/70'
                  : 'border-gray-300 dark:border-gray-600'
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-bold truncate">Table {bill.tableNumber}</div>
                  <div className="text-xs opacity-80">
                    {new Date(bill.createdAt).toLocaleString('el-GR', {
                      hour12: false,
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700">
                    {bill.status}
                  </span>
                  <span className="text-sm font-bold">€{bill.grandTotal.toFixed(2)}</span>
                  {bill.status !== 'closed' && (
                    <button
                      onClick={() => void closeBill(bill.id)}
                      disabled={Boolean(closing[bill.id])}
                      className={cn(
                        'px-2 py-1 rounded text-xs font-semibold border transition-colors',
                        closing[bill.id]
                          ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-green-600 text-white border-transparent hover:bg-green-700'
                      )}
                    >
                      {closing[bill.id] ? 'Closing…' : 'Close bill'}
                    </button>
                  )}
                </div>
              </div>
              {bill.waiterName && (
                <div className="mt-1 text-xs opacity-80">Waiter: {bill.waiterName}</div>
              )}
              <div className="mt-2 text-xs opacity-80">
                Orders: {bill.baseOrderIds.length} base, {bill.extraOrderIds.length} extras
              </div>
            </div>
          ))}
          {!filteredBills.length && (
            <div className="py-12 text-center text-sm opacity-75">No bills</div>
          )}
        </div>
      )}
    </div>
  );
}

export default BillsList;
