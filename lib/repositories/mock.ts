import { MenuItem, Order, OrderStatus, ItemStatus } from '@/types/order';
import { IMenuRepository, IOrderRepository } from './interfaces';

// For MVP, we use a mock implementation that can be easily swapped with a real DB later.
// We'll keep it as a singleton to simulate a persistent store in local dev,
// although it will reset on server restart until the DB is wired.

const MOCK_MENU: MenuItem[] = [
  { id: '1', name: 'Χωριάτικη Σαλάτα', category: 'Κρύα' },
  { id: '2', name: 'Πράσινη Σαλάτα', category: 'Κρύα' },
  { id: '3', name: 'Ρόκα με Παρμεζάνα', category: 'Κρύα' },
  { id: '4', name: 'Καίσαρ', category: 'Κρύα' },
  { id: '5', name: 'Ντοματοσαλάτα', category: 'Κρύα' },
  { id: '6', name: 'Ζεστή Σαλάτα με Κοτόπουλο', category: 'Ζεστές' },
  { id: '7', name: 'Σαλάτα με Γαρίδες', category: 'Ζεστές' },
  { id: '8', name: 'Μπριζόλα Χοιρινή', category: 'Ψησταριά' },
  { id: '9', name: 'Μπριζόλα Μοσχαρίσια', category: 'Ψησταριά' },
  { id: '10', name: 'Κοτόπουλο Φιλέτο', category: 'Ψησταριά' },
  { id: '11', name: 'Μπιφτέκι', category: 'Ψησταριά' },
  { id: '12', name: 'Σουβλάκι Χοιρινό', category: 'Ψησταριά' },
  { id: '13', name: 'Σουβλάκι Κοτόπουλο', category: 'Ψησταριά' },
  { id: '14', name: 'Μουσακάς', category: 'Μαγειρευτό' },
  { id: '15', name: 'Παστίτσιο', category: 'Μαγειρευτό' },
  { id: '16', name: 'Παπουτσάκια', category: 'Μαγειρευτό' },
  { id: '17', name: 'Γιουβέτσι', category: 'Μαγειρευτό' },
  { id: '18', name: 'Κοκκινιστό', category: 'Μαγειρευτό' },
  { id: '19', name: 'Κόκα Κόλα', category: 'Ποτά' },
  { id: '20', name: 'Σπράιτ', category: 'Ποτά' },
  { id: '21', name: 'Φάντα', category: 'Ποτά' },
  { id: '22', name: 'Νερό', category: 'Ποτά' },
  { id: '23', name: 'Μπύρα', category: 'Ποτά' },
  { id: '24', name: 'Κρασί Λευκό', category: 'Ποτά' },
  { id: '25', name: 'Κρασί Κόκκινο', category: 'Ποτά' },
  { id: '26', name: 'Καφές', category: 'Ποτά' },
];

let mockOrders: Order[] = [
  {
    id: 'order-1',
    tableNumber: '5',
    waiterName: 'Γιώργος',
    timestamp: Date.now() - 18 * 60000,
    status: 'pending',
    items: [
      { id: 'item-1', name: 'Μπριζόλα Χοιρινή', quantity: 2, category: 'Ψησταριά', itemStatus: 'pending' },
      { id: 'item-2', name: 'Χωριάτικη Σαλάτα', quantity: 1, category: 'Κρύα', itemStatus: 'ready' },
    ],
  }
];

export class MockMenuRepository implements IMenuRepository {
  async getMenuItems(): Promise<MenuItem[]> {
    return MOCK_MENU;
  }
}

export class MockOrderRepository implements IOrderRepository {
  async getOrders(): Promise<Order[]> {
    return [...mockOrders].sort((a, b) => b.timestamp - a.timestamp);
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

// Export instances to be used by API routes
export const menuRepository = new MockMenuRepository();
export const orderRepository = new MockOrderRepository();
