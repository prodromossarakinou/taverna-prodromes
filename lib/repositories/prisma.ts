import { MenuItem, Order, OrderStatus, ItemStatus, OrderCategory } from '@/types/order';
import { IMenuRepository, IOrderRepository } from './interfaces';
import { prisma } from '../prisma';

export class PrismaMenuRepository implements IMenuRepository {
  async getMenuItems(): Promise<MenuItem[]> {
    const items = await prisma.menuItem.findMany();
    return items.map(item => ({
      ...item,
      category: item.category as OrderCategory,
    }));
  }
}

export class PrismaOrderRepository implements IOrderRepository {
  async getOrders(): Promise<Order[]> {
    const orders = await prisma.order.findMany({
      include: {
        items: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    return orders.map(order => ({
      ...order,
      timestamp: order.timestamp.getTime(),
      status: order.status as OrderStatus,
      items: order.items.map(item => ({
        ...item,
        category: item.category as OrderCategory,
        itemStatus: item.itemStatus as ItemStatus,
      })),
    }));
  }

  async createOrder(orderData: Omit<Order, 'id' | 'timestamp' | 'status'>): Promise<Order> {
    const order = await prisma.order.create({
      data: {
        tableNumber: orderData.tableNumber,
        waiterName: orderData.waiterName,
        status: 'pending',
        extraNotes: orderData.extraNotes,
        items: {
          create: orderData.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            category: item.category,
            itemStatus: 'pending',
            extraNotes: item.extraNotes,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return {
      ...order,
      timestamp: order.timestamp.getTime(),
      status: order.status as OrderStatus,
      items: order.items.map(item => ({
        ...item,
        category: item.category as OrderCategory,
        itemStatus: item.itemStatus as ItemStatus,
      })),
    };
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { items: true },
    });

    return {
      ...order,
      timestamp: order.timestamp.getTime(),
      status: order.status as OrderStatus,
      items: order.items.map(item => ({
        ...item,
        category: item.category as OrderCategory,
        itemStatus: item.itemStatus as ItemStatus,
      })),
    };
  }

  async updateOrderItemStatus(orderId: string, itemId: string, status: ItemStatus): Promise<Order> {
    await prisma.orderItem.update({
      where: { id: itemId },
      data: { itemStatus: status },
    });

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) throw new Error('Order not found');

    return {
      ...order,
      timestamp: order.timestamp.getTime(),
      status: order.status as OrderStatus,
      items: order.items.map(item => ({
        ...item,
        category: item.category as OrderCategory,
        itemStatus: item.itemStatus as ItemStatus,
      })),
    };
  }
}
