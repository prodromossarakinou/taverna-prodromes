import React from 'react';
import { BillsList } from '@/components/features/billing/BillsList';

export default function BillsPage() {
  return (
    <div className="min-h-[calc(100vh-2rem)]">
      <BillsList />
    </div>
  );
}
