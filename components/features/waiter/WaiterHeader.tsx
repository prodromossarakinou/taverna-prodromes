'use client';

import React from 'react';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';

interface WaiterHeaderProps {
  tableNumber: string;
  setTableNumber: (val: string) => void;
  waiterName: string;
  setWaiterName: (val: string) => void;
  extraNotes: string | null;
  setExtraNotes: (val: string) => void;
}

export function WaiterHeader({
  tableNumber,
  setTableNumber,
  waiterName,
  setWaiterName,
  extraNotes,
  setExtraNotes,
}: WaiterHeaderProps) {
  return (
    <div className="bg-linear-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white p-4 shadow-lg">
      <h1 className="text-xl font-bold mb-3">Λήψη Παραγγελίας</h1>
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
            className="bg-white/10 border-white/20 h-12 text-lg text-white placeholder:text-white/50 focus-visible:ring-white/30"
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
            className="bg-white/10 border-white/20 h-12 text-white placeholder:text-white/50 focus-visible:ring-white/30"
          />
        </div>
      </div>
      <div className="mt-3">
        <Label htmlFor="notes" className="text-white text-xs mb-1">Σημειώσεις Παραγγελίας</Label>
        <Input
          id="notes"
          type="text"
          value={extraNotes || ''}
          onChange={(e) => setExtraNotes(e.target.value)}
          placeholder="π.χ. Όλα μαζί, όχι κρεμμύδι κλπ."
          className="bg-white/10 border-white/20 h-10 text-white placeholder:text-white/50 focus-visible:ring-white/30"
        />
      </div>
    </div>
  );
}
