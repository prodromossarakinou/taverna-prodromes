import { NextResponse } from 'next/server';
import { billRepository } from '@/lib/repositories';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bill = await billRepository.getBill(id);
    return NextResponse.json(bill);
  } catch (error: any) {
    console.error('Error fetching bill:', error);
    if (error?.message === 'Bill not found') {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to fetch bill' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const input: any = {};
    if (body?.status) input.status = body.status;
    if (body?.discount && body.discount.type && typeof body.discount.value === 'number') {
      input.discount = { type: body.discount.type, value: body.discount.value };
    }
    if (Array.isArray(body?.baseOrderIds)) input.baseOrderIds = body.baseOrderIds;
    if (Array.isArray(body?.extraOrderIds)) input.extraOrderIds = body.extraOrderIds;
    const updated = await billRepository.updateBill(id, input);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating bill:', error);
    if (error?.message === 'Bill not found') {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update bill' }, { status: 500 });
  }
}
