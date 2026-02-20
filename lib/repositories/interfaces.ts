import { MenuItem, Order, OrderStatus, ItemStatus } from '@/types/order';

export interface IMenuRepository {
  getMenuItems(): Promise<MenuItem[]>;
  createMenuItem(item: Omit<MenuItem, 'id'>): Promise<MenuItem>;
  updateMenuItem(id: string, item: Omit<MenuItem, 'id'>): Promise<MenuItem>;
  deleteMenuItem(id: string): Promise<void>;
}

export interface IOrderRepository {
  getOrders(): Promise<Order[]>;
  createOrder(order: Omit<Order, 'id' | 'timestamp' | 'status'>): Promise<Order>;
  updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order>;
  updateOrderItemStatus(orderId: string, itemId: string, status: ItemStatus): Promise<Order>;
  updateOrderItemUnitStatus(orderId: string, unitId: string, status: ItemStatus): Promise<Order>;
  updateOrderItemUnitsStatus(orderId: string, itemId: string, status: ItemStatus): Promise<Order>;
}
