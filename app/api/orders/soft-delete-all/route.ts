import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Soft delete ALL orders by setting status = 'deleted'.
// This endpoint is intentionally not linked in the UI; use with care.
export async function POST() {
  try {
    const result = await prisma.order.updateMany({
      where: { status: { not: 'deleted' } },
      data: { status: 'deleted' },
    });
    return NextResponse.json({ updated: result.count });
  } catch (error) {
    console.error('Error soft-deleting all orders:', error);
    return NextResponse.json({ error: 'Failed to soft delete all orders' }, { status: 500 });
  }
}
