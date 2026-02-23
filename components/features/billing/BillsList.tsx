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

  const filteredBills = useMemo(() => {
    if (filter === 'all') return bills;
    return bills.filter((b) => b.status === filter);
  }, [bills, filter]);

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h1 className="text-xl font-bold">Bills</h1>
        <div className="flex items-center gap-1">
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
