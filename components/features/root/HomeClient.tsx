"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { WaiterView } from '@/components/features/waiter/WaiterView';
import { KitchenDisplay } from '@/components/features/kitchen/KitchenDisplay';
import { AdminView } from '@/components/features/admin/AdminView';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Popup } from '@/components/ui/Popup';
import { useOrders } from '@/contexts/OrderContext';
import { WaiterParams, WaiterMode } from '@/types/order';

interface HomeClientProps {
  initialView?: 'waiter' | 'kitchen' | 'admin';
}

export function HomeClient({ initialView }: HomeClientProps) {
  const router = useRouter();
  const [view, setView] = useState<'waiter' | 'kitchen' | 'admin'>(initialView ?? 'waiter');
  const { orders } = useOrders();

  const [waiterParams, setWaiterParams] = useState<WaiterParams>({ mode: 'new' });
  const [orderPickFor, setOrderPickFor] = useState<Extract<WaiterMode, 'view' | 'extras'> | null>(null);
  const [modePopupOpen, setModePopupOpen] = useState(false);

  useEffect(() => {
    if (initialView && initialView !== view) {
      setView(initialView);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialView]);

  const startNew = () => setWaiterParams({ mode: 'new' });
  const requestPick = (mode: Extract<WaiterMode, 'view' | 'extras'>) => setOrderPickFor(mode);
  const pickOrder = (id: string) => {
    if (!orderPickFor) return;
    setWaiterParams({ mode: orderPickFor, orderId: id });
    setOrderPickFor(null);
  };

  const setViewAndPersist = (nextView: 'waiter' | 'kitchen' | 'admin') => {
    setView(nextView);
    try {
      const params = new URLSearchParams(window.location.search);
      params.set('view', nextView);
      router.replace(`/?${params.toString()}`);
    } catch {
      // no-op in environments without window
    }
  };

  return (
    <main className="min-h-screen">
      {/* Main View Content */}
      {view === 'waiter' ? (
        <WaiterView
          params={waiterParams}
          onBack={() => setWaiterParams({ mode: 'new' })}
          onSwitchView={setViewAndPersist}
          onStartNew={startNew}
          onRequestPick={requestPick}
          onOpenMobileMenu={() => setModePopupOpen(true)}
          ThemeToggle={<ThemeToggle />}
        />
      ) : view === 'kitchen' ? (
        <KitchenDisplay onSwitchView={setViewAndPersist} ThemeToggle={<ThemeToggle />} />
      ) : (
        <AdminView onSwitchView={setViewAndPersist} ThemeToggle={<ThemeToggle />} />
      )}

      {/* Mobile Mode Selector Popup */}
      <Popup open={modePopupOpen} title="Επιλογή λειτουργίας" onClose={() => setModePopupOpen(false)}>
        <div className="flex flex-col gap-2">
          <Button size="lg" onClick={() => { startNew(); setModePopupOpen(false); }}>Νέα Παραγγελία</Button>
          <Button size="lg" variant="outline" onClick={() => { setModePopupOpen(false); requestPick('view'); }}>Προβολή Παραγγελίας</Button>
          <Button size="lg" variant="outline" onClick={() => { setModePopupOpen(false); requestPick('extras'); }}>Extras σε Παραγγελία</Button>
          <div className="h-px bg-border my-2" />
          <Button size="lg" variant={view === 'kitchen' ? 'default' : 'outline'} onClick={() => { setViewAndPersist('kitchen'); setModePopupOpen(false); }}>Kitchen View</Button>
          <Button size="lg" variant={view === 'waiter' ? 'default' : 'outline'} onClick={() => { setViewAndPersist('waiter'); setModePopupOpen(false); }}>Waiter View</Button>
          <Button size="lg" variant={view === 'admin' ? 'default' : 'outline'} onClick={() => { setViewAndPersist('admin'); setModePopupOpen(false); }}>Admin View</Button>
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
