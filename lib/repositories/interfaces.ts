import { MenuItem, Order, OrderStatus, ItemStatus } from '@/types/order';
import { Bill, CreateBillInput, UpdateBillInput } from '@/types/bill';

export interface IMenuRepository {
  getMenuItems(): Promise<MenuItem[]>;
  createMenuItem(item: Omit<MenuItem, 'id'>): Promise<MenuItem>;
  updateMenuItem(id: string, item: Omit<MenuItem, 'id'>): Promise<MenuItem>;
  deleteMenuItem(id: string): Promise<void>;
}

export interface IOrderRepository {
  getOrders(): Promise<Order[]>;
  createOrder(order: Omit<Order, 'id' | 'timestamp' | 'status'>): Promise<Order>;
  deleteOrder(orderId: string): Promise<void>;
  updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order>;
  updateOrderItemStatus(orderId: string, itemId: string, status: ItemStatus): Promise<Order>;
  updateOrderItemUnitStatus(orderId: string, unitId: string, status: ItemStatus): Promise<Order>;
  updateOrderItemUnitsStatus(orderId: string, itemId: string, status: ItemStatus): Promise<Order>;
  updateOrderTableNumber(orderId: string, tableNumber: string): Promise<Order>;
  updateOrderWaiterName(orderId: string, waiterName: string): Promise<Order>;
  removeOrderItem(orderId: string, itemId: string): Promise<Order>;
}

export interface IBillRepository {
  createBill(input: CreateBillInput): Promise<Bill>;
  getBill(id: string): Promise<Bill>;
  updateBill(id: string, input: UpdateBillInput): Promise<Bill>;
  listBills(params?: { table?: string; status?: string }): Promise<Bill[]>;
}
