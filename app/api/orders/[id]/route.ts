import { NextResponse } from 'next/server';
import { orderRepository } from '@/lib/repositories';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    if (body.status) {
      const updatedOrder = await orderRepository.updateOrderStatus(id, body.status);
      return NextResponse.json(updatedOrder);
    }
    
    if (body.itemId && body.itemStatus) {
      const updatedOrder = await orderRepository.updateOrderItemStatus(id, body.itemId, body.itemStatus);
      return NextResponse.json(updatedOrder);
    }

    return NextResponse.json({ error: 'Missing status or itemId/itemStatus' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating order:', error);
    if (error.message === 'Order not found') {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
