import { NextResponse } from 'next/server';
import { billRepository } from '@/lib/repositories';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get('table') ?? undefined;
    const status = searchParams.get('status') ?? undefined;
    const bills = await billRepository.listBills({ table, status });
    return NextResponse.json(bills);
  } catch (error) {
    console.error('Error fetching bills:', error);
    return NextResponse.json({ error: 'Failed to fetch bills' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body?.tableNumber || !Array.isArray(body?.baseOrderIds) || !Array.isArray(body?.extraOrderIds)) {
      return NextResponse.json({ error: 'Invalid bill payload' }, { status: 400 });
    }

    const created = await billRepository.createBill({
      tableNumber: body.tableNumber,
      waiterName: body.waiterName ?? null,
      baseOrderIds: body.baseOrderIds,
      extraOrderIds: body.extraOrderIds,
      discount: body.discount ?? null,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error('Error creating bill:', error);
    if (error?.code === 'BILL_ALREADY_EXISTS' || error?.message === 'BILL_ALREADY_EXISTS') {
      return NextResponse.json(
        { error: 'Bill already exists for one or more of the provided orders', billId: error?.billId, status: error?.status },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Failed to create bill' }, { status: 500 });
  }
}
