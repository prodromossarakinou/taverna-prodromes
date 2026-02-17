'use client';

import React, { useState } from 'react';
import { WaiterView } from '@/components/features/waiter/WaiterView';
import { KitchenDisplay } from '@/components/features/kitchen/KitchenDisplay';
import { Button } from '@/components/ui/Button';
import { LayoutDashboard, UtensilsCrossed, Eye, Sparkles, PlusCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Popup } from '@/components/ui/Popup';
import { useOrders } from '@/contexts/OrderContext';
import { WaiterParams, WaiterMode } from '@/types/order';

export default function Home() {
  const [view, setView] = useState<'waiter' | 'kitchen'>('waiter');
  const { orders } = useOrders();

  const [waiterParams, setWaiterParams] = useState<WaiterParams>({ mode: 'new' });
  const [orderPickFor, setOrderPickFor] = useState<Extract<WaiterMode, 'view' | 'extras'> | null>(null);
  const [modePopupOpen, setModePopupOpen] = useState(false);

  const startNew = () => setWaiterParams({ mode: 'new' });
  const requestPick = (mode: Extract<WaiterMode, 'view' | 'extras'>) => setOrderPickFor(mode);
  const pickOrder = (id: string) => {
    if (!orderPickFor) return;
    setWaiterParams({ mode: orderPickFor, orderId: id });
    setOrderPickFor(null);
  };

  return (
    <main className="min-h-screen">
      {/* Main View Content */}
      {view === 'waiter' ? (
        <WaiterView 
          params={waiterParams}
          onBack={() => setWaiterParams({ mode: 'new' })}
          onSwitchView={setView}
          onStartNew={startNew}
          onRequestPick={requestPick}
          onOpenMobileMenu={() => setModePopupOpen(true)}
          ThemeToggle={<ThemeToggle />}
        />
      ) : (
        <KitchenDisplay 
          onSwitchView={setView}
          ThemeToggle={<ThemeToggle />}
        />
      )}

      {/* Mobile Mode Selector Popup */}
      <Popup open={modePopupOpen} title="Επιλογή λειτουργίας" onClose={() => setModePopupOpen(false)}>
        <div className="flex flex-col gap-2">
          <Button size="lg" onClick={() => { startNew(); setModePopupOpen(false); }}>Νέα Παραγγελία</Button>
          <Button size="lg" variant="outline" onClick={() => { setModePopupOpen(false); requestPick('view'); }}>Προβολή Παραγγελίας</Button>
          <Button size="lg" variant="outline" onClick={() => { setModePopupOpen(false); requestPick('extras'); }}>Extras σε Παραγγελία</Button>
          <div className="h-px bg-border my-2" />
          <Button size="lg" variant={view === 'kitchen' ? 'default' : 'outline'} onClick={() => { setView('kitchen'); setModePopupOpen(false); }}>Kitchen View</Button>
          <Button size="lg" variant={view === 'waiter' ? 'default' : 'outline'} onClick={() => { setView('waiter'); setModePopupOpen(false); }}>Waiter View</Button>
        </div>
      </Popup>

      {/* Order Picker Popup (used for View / Extras) */}
      <Popup open={!!orderPickFor} title={orderPickFor === 'view' ? 'Επιλογή παραγγελίας για προβολή' : 'Επιλογή παραγγελίας για extras'} onClose={() => setOrderPickFor(null)}>
        {orders.length === 0 ? (
          <div className="text-sm text-muted-foreground">No orders available</div>
        ) : (
          <div className="flex flex-col gap-2">
            {orders.map((o) => (
              <Button key={o.id} size="lg" variant="outline" className="justify-between" onClick={() => pickOrder(o.id)}>
                <span>Τραπέζι {o.tableNumber}</span>
                <span className="text-xs text-muted-foreground">{new Date(o.timestamp).toLocaleTimeString()}</span>
              </Button>
            ))}
          </div>
        )}
      </Popup>
    </main>
  );
}
