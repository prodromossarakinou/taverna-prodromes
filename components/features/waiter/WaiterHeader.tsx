'use client';

import React from 'react';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';

interface WaiterHeaderProps {
  tableNumber: string;
  onEditTable: () => void;
  waiterName: string;
  onEditWaiter: () => void;
  extraNotes: string | null;
  onEditNotes: () => void;
  readOnly?: boolean;
  // View Switcher Props
  onSwitchView: (view: 'waiter' | 'kitchen') => void;
  currentMode: string;
  onStartNew: () => void;
  onRequestPick: (mode: 'view' | 'extras') => void;
  onOpenMobileMenu: () => void;
}

export function WaiterHeader({
  tableNumber,
  onEditTable,
  waiterName,
  onEditWaiter,
  extraNotes,
  onEditNotes,
  readOnly = false,
  onSwitchView,
  currentMode,
  onStartNew,
  onRequestPick,
  onOpenMobileMenu,
  ThemeToggle,
}: WaiterHeaderProps & { ThemeToggle: React.ReactNode }) {
  return (
    <div className="bg-linear-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white px-6 py-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold">Λήψη Παραγγελίας</h1>
          <div className="flex gap-2 mt-2">
            <Button
              onClick={onEditTable}
              disabled={readOnly}
              variant="secondary"
              className="h-8 px-3 flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/15 text-[10px]"
            >
              <span className="opacity-80 uppercase font-bold">Τραπέζι</span>
              <span className="font-bold">{tableNumber || '?'}</span>
            </Button>
            <Button
              onClick={onEditWaiter}
              disabled={readOnly}
              variant="secondary"
              className="h-8 px-3 flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/15 text-[10px]"
            >
              <span className="opacity-80 uppercase font-bold">Σερβιτόρος</span>
              <span className="font-bold">{waiterName || '?'}</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {ThemeToggle}
          <div className="hidden sm:flex items-center gap-2 bg-black/10 p-1 rounded-lg border border-white/10">
            <Button 
              variant={currentMode === 'new' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={onStartNew}
              className="h-9 px-3 text-xs"
            >
              New
            </Button>
            <Button 
              variant={currentMode === 'view' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => onRequestPick('view')}
              className="h-9 px-3 text-xs"
            >
              View
            </Button>
            <Button 
              variant={currentMode === 'extras' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => onRequestPick('extras')}
              className="h-9 px-3 text-xs"
            >
              Extras
            </Button>
            <div className="w-px h-4 bg-white/20 mx-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSwitchView('kitchen')}
              className="h-9 px-3 text-xs"
            >
              Kitchen
            </Button>
          </div>
          
          <div className="sm:hidden">
            <Button size="sm" variant="secondary" onClick={onOpenMobileMenu} className="h-10 px-4 bg-white text-blue-700 font-bold">
              Menu
            </Button>
          </div>
        </div>
      </div>
      
      <div className="mt-3">
        <Button
          onClick={onEditNotes}
          disabled={readOnly}
          variant="secondary"
          className="w-full h-9 justify-start bg-white/10 border-white/20 text-white hover:bg-white/15 px-4 text-xs"
        >
          <span className="opacity-80 uppercase font-bold mr-2">Σημειώσεις:</span>
          <span className="truncate">{extraNotes?.trim() ? extraNotes : 'Προσθήκη σημειώσεων'}</span>
        </Button>
      </div>
    </div>
  );
}
