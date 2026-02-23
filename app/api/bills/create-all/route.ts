import { NextResponse } from 'next/server';
import { billRepository, orderRepository } from '@/lib/repositories';

// Δημιουργεί λογαριασμούς για όλες τις παραγγελίες που δεν έχουν ήδη τιμολογηθεί
// Ομαδοποίηση ανά τραπέζι. Τα base/extra orders χωρίζονται με βάση το πεδίο isExtra.
export async function POST() {
  try {
    const [orders, bills] = await Promise.all([
      orderRepository.getOrders(),
      billRepository.listBills(),
    ]);

    // Συγκεντρώνουμε όλα τα orderIds που είναι ήδη συνδεδεμένα με κάποιο bill
    const billedOrderIds = new Set<string>();
    for (const b of bills) {
      for (const id of b.baseOrderIds ?? []) billedOrderIds.add(id);
      for (const id of b.extraOrderIds ?? []) billedOrderIds.add(id);
    }

    // Φιλτράρουμε όσες παραγγελίες δεν έχουν ακόμα τιμολογηθεί
    const pending = orders.filter((o) => !billedOrderIds.has(o.id));

    if (pending.length === 0) {
      return NextResponse.json(
        { created: 0, skipped: 0, message: 'Δεν υπάρχουν παραγγελίες για τιμολόγηση.' },
        { status: 200 }
      );
    }

    // Ομαδοποίηση ανά τραπέζι
    const byTable = new Map<string, typeof pending>();
    for (const o of pending) {
      const key = o.tableNumber;
      const arr = byTable.get(key) ?? [];
      arr.push(o);
      byTable.set(key, arr);
    }

    const results: { table: string; billId?: string; status: 'created' | 'skipped' | 'error'; reason?: string }[] = [];
    let created = 0;
    let skipped = 0;

    for (const [table, group] of byTable.entries()) {
      // Διαχωρισμός base/extra orders
      const baseOrderIds = group.filter((o) => !o.isExtra).map((o) => o.id);
      const extraOrderIds = group.filter((o) => !!o.isExtra).map((o) => o.id);

      if (baseOrderIds.length === 0 && extraOrderIds.length === 0) {
        results.push({ table, status: 'skipped', reason: 'Καμία διαθέσιμη παραγγελία' });
        skipped += 1;
        continue;
      }

      const waiterName = group[0]?.waiterName ?? null;

      try {
        const bill = await billRepository.createBill({
          tableNumber: table,
          waiterName,
          baseOrderIds,
          extraOrderIds,
          discount: null,
        });
        created += 1;
        results.push({ table, billId: bill.id, status: 'created' });
      } catch (error: any) {
        if (error?.code === 'BILL_ALREADY_EXISTS' || error?.message === 'BILL_ALREADY_EXISTS') {
          skipped += 1;
          results.push({ table, status: 'skipped', reason: 'Υπάρχει ήδη λογαριασμός' });
        } else {
          results.push({ table, status: 'error', reason: 'Αποτυχία δημιουργίας' });
        }
      }
    }

    return NextResponse.json(
      {
        created,
        skipped,
        totalTablesProcessed: byTable.size,
        totalOrdersConsidered: pending.length,
        results,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Error bulk-creating bills:', error);
    return NextResponse.json({ error: 'Failed to create bills' }, { status: 500 });
  }
}
