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

  async createMenuItem(item: Omit<MenuItem, 'id'>): Promise<MenuItem> {
    const created = await prisma.menuItem.create({
      data: {
        name: item.name,
        category: item.category,
        price: item.price ?? null,
        extraNotes: item.extraNotes ?? null,
        active: item.active ?? true,
      },
    });

    return {
      ...created,
      category: created.category as OrderCategory,
    };
  }

  async updateMenuItem(id: string, item: Omit<MenuItem, 'id'>): Promise<MenuItem> {
    const updated = await prisma.menuItem.update({
      where: { id },
      data: {
        name: item.name,
        category: item.category,
        price: item.price ?? null,
        extraNotes: item.extraNotes ?? null,
        active: item.active ?? true,
      },
    });

    return {
      ...updated,
      category: updated.category as OrderCategory,
    };
  }

  async deleteMenuItem(id: string): Promise<void> {
    await prisma.menuItem.delete({ where: { id } });
  }
}

export class PrismaOrderRepository implements IOrderRepository {
  async getOrders(): Promise<Order[]> {
    const orders = await prisma.order.findMany({
      include: {
        items: true,
      },
      orderBy: [
        { timestamp: 'asc' },
        { id: 'asc' },
      ],
    });

    return orders.map(order => ({
      ...order,
      timestamp: order.timestamp.getTime(),
      status: order.status as OrderStatus,
      isExtra: order.isExtra,
      parentId: order.parentId ?? undefined,
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
        isExtra: orderData.isExtra ?? false,
        parentId: orderData.parentId ?? null,
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
      isExtra: order.isExtra,
      parentId: order.parentId ?? undefined,
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
      isExtra: order.isExtra,
      parentId: order.parentId ?? undefined,
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
      isExtra: order.isExtra,
      parentId: order.parentId ?? undefined,
      items: order.items.map(item => ({
        ...item,
        category: item.category as OrderCategory,
        itemStatus: item.itemStatus as ItemStatus,
      })),
    };
  }
}
