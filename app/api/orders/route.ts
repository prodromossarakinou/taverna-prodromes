import { NextResponse } from 'next/server';
import { orderRepository } from '@/lib/repositories/mock';

export async function GET() {
  try {
    const orders = await orderRepository.getOrders();
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Basic validation
    if (!body.tableNumber || !body.items || !Array.isArray(body.items)) {
      return NextResponse.json({ error: 'Invalid order payload' }, { status: 400 });
    }

    const newOrder = await orderRepository.createOrder({
      tableNumber: body.tableNumber,
      waiterName: body.waiterName || 'Σερβιτόρος',
      items: body.items,
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
