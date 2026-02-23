import { NextResponse } from 'next/server';
import { orderRepository } from '@/lib/repositories';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Waiter name update
    if (typeof body.waiterName === 'string') {
      const name = body.waiterName.trim();
      if (name.length === 0) {
        return NextResponse.json({ error: 'Waiter name cannot be empty' }, { status: 400 });
      }
      try {
        const updatedOrder = await orderRepository.updateOrderWaiterName(id, name);
        return NextResponse.json(updatedOrder);
      } catch (e: any) {
        if (e?.code === 'ORDER_READ_ONLY' || e?.message === 'ORDER_READ_ONLY') {
          return NextResponse.json({ error: 'Order is read-only and cannot be edited' }, { status: 400 });
        }
        throw e;
      }
    }

    // Table rename
    if (typeof body.tableNumber === 'string' && body.tableNumber.trim().length > 0) {
      try {
        const updatedOrder = await orderRepository.updateOrderTableNumber(id, body.tableNumber.trim());
        return NextResponse.json(updatedOrder);
      } catch (e: any) {
        if (e?.code === 'ORDER_READ_ONLY' || e?.message === 'ORDER_READ_ONLY') {
          return NextResponse.json({ error: 'Order is read-only and cannot be edited' }, { status: 400 });
        }
        throw e;
      }
    }

    // Remove item
    if (typeof body.removeItemId === 'string' && body.removeItemId.trim().length > 0) {
      try {
        const updatedOrder = await orderRepository.removeOrderItem(id, body.removeItemId.trim());
        return NextResponse.json(updatedOrder);
      } catch (e: any) {
        if (e?.code === 'ORDER_READ_ONLY' || e?.message === 'ORDER_READ_ONLY') {
          return NextResponse.json({ error: 'Order is read-only and cannot be edited' }, { status: 400 });
        }
        if (e?.message === 'Order item not found') {
          return NextResponse.json({ error: 'Order item not found' }, { status: 404 });
        }
        throw e;
      }
    }

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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await orderRepository.deleteOrder(id);
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error('Error deleting order:', error);
    if (error.message === 'Order not found') {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
