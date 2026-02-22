'use client';

import React, { useMemo, useState } from 'react';
import { cn } from '@/components/ui/utils';

interface BillTotalsProps {
  baseTotal: number;
  extrasTotal: number;
  className?: string;
  onTotalChange?: (total: number, context: { base: number; extras: number; subtotal: number; discount: number; type: 'percent' | 'amount' }) => void;
}

type DiscountType = 'percent' | 'amount';

export function BillTotals({ baseTotal, extrasTotal, className, onTotalChange }: BillTotalsProps) {
  const [discountType, setDiscountType] = useState<DiscountType>('percent');
  const [discountInput, setDiscountInput] = useState<string>('0');

  const { subtotal, discountValue, grandTotal } = useMemo(() => {
    const subtotalNum = (Number(baseTotal) || 0) + (Number(extrasTotal) || 0);
    // Normalize input (allow comma or dot). If empty, treat as 0.
    const normalized = (discountInput ?? '').trim();
    const raw = normalized === '' ? 0 : Number(normalized.replace(',', '.'));
    const safe = Number.isFinite(raw) && raw > 0 ? raw : 0;
    const discount = discountType === 'percent'
      ? Math.min(subtotalNum, (subtotalNum * safe) / 100)
      : Math.min(subtotalNum, safe);
    const total = Math.max(0, subtotalNum - discount);
    return { subtotal: subtotalNum, discountValue: discount, grandTotal: total };
  }, [baseTotal, extrasTotal, discountInput, discountType]);

  // Πέτα το ενημερωμένο σύνολο στον γονέα (αν δόθηκε handler)
  React.useEffect(() => {
    if (!onTotalChange) return;
    onTotalChange(grandTotal, {
      base: baseTotal,
      extras: extrasTotal,
      subtotal,
      discount: discountValue,
      type: discountType,
    });
  }, [grandTotal, subtotal, discountValue, discountType, baseTotal, extrasTotal, onTotalChange]);

  return (
    <div className={cn('rounded-md border bg-card p-3 shadow-inner', className)}>
      {/* Discount controls */}
      <div className="mt-3">
        <div className="text-xs font-semibold opacity-80 mb-1">Έκπτωση καταστήματος</div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-md border overflow-hidden">
            <button
              type="button"
              onClick={() => setDiscountType('percent')}
              className={cn(
                'px-2 py-1 text-xs font-semibold',
                discountType === 'percent'
                  ? 'bg-blue-600 text-white dark:bg-blue-500'
                  : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
              )}
            >
              %
            </button>
            <button
              type="button"
              onClick={() => setDiscountType('amount')}
              className={cn(
                'px-2 py-1 text-xs font-semibold border-l',
                discountType === 'amount'
                  ? 'bg-blue-600 text-white dark:bg-blue-500'
                  : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
              )}
            >
              €
            </button>
          </div>
          <input
            type="number"
            inputMode="decimal"
            step={discountType === 'percent' ? 1 : 0.5}
            min={0}
            className="h-8 w-28 rounded-md border bg-background px-2 text-sm focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:border-ring hover:border-blue-500"
            placeholder={discountType === 'percent' ? 'π.χ. 10' : 'π.χ. 5'}
            value={discountInput}
            onChange={(e) => setDiscountInput(e.target.value)}
          />
        </div>
      </div>

      {/* Visual spacing (reduced as requested) */}
      <br />
      {/* Subtotal / Discount / Grand total */}
      <div className="h-px bg-border my-2" />
      <div className="flex items-center justify-between text-sm">
        <span className="opacity-80">Base</span>
        <span className="font-semibold">€{baseTotal.toFixed(2)}</span>
      </div>
      <div className="flex items-center justify-between text-sm mt-1">
        <span className="opacity-80">+ Extras</span>
        <span className="font-semibold">€{extrasTotal.toFixed(2)}</span>
      </div>
      <div className="h-px bg-border my-2" />
      <div className="flex items-center justify-between text-sm">
        <span className="opacity-80">Σύνολο (Base + Extras)</span>
        <span className="font-semibold">€{subtotal.toFixed(2)}</span>
      </div>
      <div className="flex items-center justify-between text-sm mt-1">
        <span className="opacity-80">- Έκπτωση</span>
        <span className="font-semibold">€{discountValue.toFixed(2)}</span>
      </div>
      <div className="h-px bg-border my-2" />
      <div className="flex items-center justify-between text-base font-bold">
        <span>Σύνολο</span>
        <span>€{grandTotal.toFixed(2)}</span>
      </div>
    </div>
  );
}
