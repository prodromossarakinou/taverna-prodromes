import { NextResponse } from 'next/server';
import { orderRepository } from '@/lib/repositories';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    if (body.orderStatus || body.status) {
      const nextStatus = body.orderStatus ?? body.status;
      const updatedOrder = await orderRepository.updateOrderStatus(id, nextStatus);
      return NextResponse.json(updatedOrder);
    }

    if (body.unitId && body.unitStatus) {
      const updatedOrder = await orderRepository.updateOrderItemUnitStatus(id, body.unitId, body.unitStatus);
      return NextResponse.json(updatedOrder);
    }

    if (body.itemId && body.unitStatus && body.mode === 'bulk') {
      const updatedOrder = await orderRepository.updateOrderItemUnitsStatus(id, body.itemId, body.unitStatus);
      return NextResponse.json(updatedOrder);
    }

    if (body.itemId && body.itemStatus) {
      const updatedOrder = await orderRepository.updateOrderItemStatus(id, body.itemId, body.itemStatus);
      return NextResponse.json(updatedOrder);
    }

    return NextResponse.json({ error: 'Missing status or unit/item update payload' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating order:', error);
    if (error.message === 'Order not found') {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
