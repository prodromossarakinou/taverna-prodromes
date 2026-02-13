'use client';

import React, { useState } from 'react';
import { WaiterView } from '@/components/features/waiter/WaiterView';
import { KitchenDisplay } from '@/components/features/kitchen/KitchenDisplay';
import { Button } from '@/components/ui/Button';
import { LayoutDashboard, UtensilsCrossed } from 'lucide-react';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

export default function Home() {
  const [view, setView] = useState<'waiter' | 'kitchen'>('waiter');

  return (
    <main className="relative min-h-screen">
      {/* View Switcher & Theme Toggle - Floating Controls */}
      <div className="fixed top-4 right-4 z-50 flex gap-2 items-center bg-background/80 backdrop-blur-sm p-1 rounded-lg border shadow-sm">
        <ThemeToggle />
        <div className="w-px h-4 bg-border mx-1" />
        <Button
          variant={view === 'waiter' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setView('waiter')}
          className="gap-2"
        >
          <UtensilsCrossed className="size-4" />
          <span className="hidden sm:inline">Waiter</span>
        </Button>
        <Button
          variant={view === 'kitchen' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setView('kitchen')}
          className="gap-2"
        >
          <LayoutDashboard className="size-4" />
          <span className="hidden sm:inline">Kitchen</span>
        </Button>
      </div>

      {/* Main View Content */}
      {view === 'waiter' ? <WaiterView /> : <KitchenDisplay />}
    </main>
  );
}
