import { MenuItem, Order, OrderStatus, ItemStatus } from '@/types/order';

export interface IMenuRepository {
  getMenuItems(): Promise<MenuItem[]>;
}

export interface IOrderRepository {
  getOrders(): Promise<Order[]>;
  createOrder(order: Omit<Order, 'id' | 'timestamp' | 'status'>): Promise<Order>;
  updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order>;
  updateOrderItemStatus(orderId: string, itemId: string, status: ItemStatus): Promise<Order>;
}
