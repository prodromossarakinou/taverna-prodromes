import { NextResponse } from 'next/server';
import { menuRepository, orderRepository, billRepository } from '@/lib/repositories';

export async function GET() {
  try {
    const [menuItems, orders, bills] = await Promise.all([
      menuRepository.getMenuItems(),
      orderRepository.getOrders(),
      billRepository.listBills(),
    ]);

    const menuTotal = menuItems.length;
    const menuActive = menuItems.filter((m) => m.active).length;

    const ordersTotal = orders.length;
    const ordersByStatus = orders.reduce<Record<string, number>>((acc, o) => {
      acc[o.status] = (acc[o.status] ?? 0) + 1;
      return acc;
    }, {});

    // Χρήματα προκύπτουν αξιόπιστα από τα Bills (grandTotal)
    const billsTotal = bills.length;
    const billsAmount = bills.reduce((sum, b) => sum + (b.grandTotal ?? 0), 0);
    const billsByStatus = bills.reduce<Record<string, { count: number; amount: number }>>((acc, b) => {
      const key = b.status ?? 'unknown';
      const entry = acc[key] ?? { count: 0, amount: 0 };
      entry.count += 1;
      entry.amount += b.grandTotal ?? 0;
      acc[key] = entry;
      return acc;
    }, {});

    const payload = {
      menu: { active: menuActive, total: menuTotal },
      orders: { total: ordersTotal, byStatus: ordersByStatus },
      bills: { total: billsTotal, totalAmount: billsAmount, byStatus: billsByStatus },
      generatedAt: Date.now(),
    };

    return NextResponse.json(payload, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
