'use client';

import React from 'react';
import { Trash2, Minus, Plus, Send, MessageSquare, ArrowLeft, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { OrderItem, OrderCategory, WaiterMode } from '@/types/order';
import { cn } from '@/components/ui/utils';

interface OrderSummaryProps {
  currentOrder: OrderItem[];
  originalItems?: OrderItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onEditNote: (id: string, currentValue: string | null) => void;
  onClearOrder: () => void;
  onSubmitOrder: () => void;
  categoryColors: Record<OrderCategory, string>;
  mode: WaiterMode;
  onBack?: () => void;
}

export function OrderSummary({
  currentOrder,
  originalItems = [],
  onUpdateQuantity,
  onEditNote,
  onClearOrder,
  onSubmitOrder,
  categoryColors,
  mode,
  onBack,
}: OrderSummaryProps) {
  const isView = mode === 'view';
  const isExtras = mode === 'extras';
  const totalQuantity = currentOrder.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-white dark:bg-gray-900 border-t-2 border-gray-300 dark:border-gray-700 shadow-2xl h-[30vh] flex overflow-hidden">
      {/* Mode Badge */}
      <div className="flex items-center gap-2 px-4 py-1 absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none">
        {isView && <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 uppercase text-[10px] font-bold">View Mode</Badge>}
        {isExtras && <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200 uppercase text-[10px] font-bold">Extras Mode</Badge>}
      </div>

      {/* Items List - 75% */}
      <div className="flex-[3] flex flex-col overflow-y-auto p-4 pt-8">
        <div className="space-y-2">
          {currentOrder.length === 0 && originalItems.length === 0 && mode === 'new' && (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              Η παραγγελία είναι κενή — προσθέστε προϊόντα για να συνεχίσετε.
            </div>
          )}
          
          {/* Original Items (Read-only reference in Extras mode) */}
          {isExtras && originalItems.length > 0 && (
            <div className="mb-4">
              <div className="text-[10px] font-bold text-gray-400 uppercase mb-2 px-1">Αρχική Παραγγελία (Μόνο προβολή)</div>
              <div className="space-y-2 opacity-60">
                {originalItems.map((item) => (
                  <div key={`orig-${item.id}`} className="flex flex-col bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="flex items-center justify-between p-2">
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.name}</span>
                        {item.extraNotes && (
                          <div className="text-[9px] italic text-gray-400 mt-0.5">{item.extraNotes}</div>
                        )}
                      </div>
                      <span className="w-8 text-center font-bold text-gray-700 dark:text-gray-300">{item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isExtras && currentOrder.length > 0 && (
            <div className="text-[10px] font-bold text-purple-500 uppercase mb-2 px-1">Νέα Extras</div>
          )}

          {currentOrder.map((item) => (
            <div key={item.id} className="flex flex-col bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex items-center justify-between p-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
                    <div className="flex gap-1">
                      {item.extraNotes && <MessageSquare className="size-3 text-blue-500" />}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {!isView && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditNote(item.id, item.extraNotes ?? null)}
                        className="h-8 px-2 text-gray-600 hover:text-gray-800 dark:hover:text-gray-200"
                      >
                        <MessageSquare className="size-4" />
                        <span className="text-xs">Σημείωση</span>
                      </Button>
                    )}
                  </div>
                  {item.extraNotes && (
                    <div className="text-[10px] italic text-gray-500 dark:text-gray-400 mt-1">
                      {item.extraNotes}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!isView && !isExtras && (
                    <Button size="sm" variant="outline" onClick={() => onUpdateQuantity(item.id, -1)} className="h-8 w-8 p-0 border-gray-200 dark:border-gray-600">
                      <Minus className="size-4" />
                    </Button>
                  )}
                  <span className="w-8 text-center font-bold text-lg text-gray-900 dark:text-white">{item.quantity}</span>
                  {!isView && !isExtras && (
                    <Button size="sm" variant="outline" onClick={() => onUpdateQuantity(item.id, 1)} className="h-8 w-8 p-0 border-gray-200 dark:border-gray-600">
                      <Plus className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons - 25% */}
      <div className="flex-1 flex flex-col border-l border-gray-200 dark:border-gray-700">
        {isView ? (
          <Button 
            onClick={onBack} 
            className="flex-1 h-full rounded-none bg-gray-600 hover:bg-gray-700 text-white"
          >
            <ArrowLeft className="size-8" />
          </Button>
        ) : (
          <>
            <Button 
              onClick={onSubmitOrder} 
              disabled={mode === 'new' && currentOrder.length === 0}
              className={cn(
                "flex-[7] h-full rounded-none text-white border-b border-gray-200 dark:border-gray-700 transition-all",
                isExtras ? "bg-purple-600 hover:bg-purple-700" : "bg-green-600 hover:bg-green-700"
              )}
            >
              {isExtras ? <Save className="size-8" /> : <Send className="size-8" />}
            </Button>
            <Button 
              onClick={onClearOrder} 
              className={cn(
                "flex-[3] h-full rounded-none text-white",
                isExtras ? "bg-gray-500 hover:bg-gray-600" : "bg-red-600 hover:bg-red-700"
              )}
            >
              {isExtras ? <X className="size-6" /> : <Trash2 className="size-6" />}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
