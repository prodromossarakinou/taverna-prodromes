import { Order, OrderStatus, ItemStatus } from '@/types/order';
import { IOrderRepository } from './interfaces';

// For MVP, we use a mock implementation that can be easily swapped with a real DB later.
// We'll keep it as a singleton to simulate a persistent store in local dev,
// although it will reset on server restart until the DB is wired.

let mockOrders: Order[] = [];

export class MockOrderRepository implements IOrderRepository {
  async getOrders(): Promise<Order[]> {
    return [...mockOrders].sort((a, b) => {
      if (a.timestamp !== b.timestamp) {
        return a.timestamp - b.timestamp;
      }
      return a.id.localeCompare(b.id);
    });
  }

  async createOrder(orderData: Omit<Order, 'id' | 'timestamp' | 'status'>): Promise<Order> {
    const newOrder: Order = {
      ...orderData,
      id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      status: 'pending',
    };
    mockOrders.push(newOrder);
    return newOrder;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const index = mockOrders.findIndex(o => o.id === orderId);
    if (index === -1) throw new Error('Order not found');
    
    mockOrders[index] = { ...mockOrders[index], status };
    return mockOrders[index];
  }

  async updateOrderItemStatus(orderId: string, itemId: string, status: ItemStatus): Promise<Order> {
    const orderIndex = mockOrders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) throw new Error('Order not found');
    
    const order = mockOrders[orderIndex];
    const items = order.items.map(item => 
      item.id === itemId ? { ...item, itemStatus: status } : item
    );
    
    mockOrders[orderIndex] = { ...order, items };
    return mockOrders[orderIndex];
  }
}

// Export instance to be used by API routes
export const orderRepository = new MockOrderRepository();
