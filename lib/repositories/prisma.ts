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
        items: {
          include: {
            units: true,
          },
        },
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
        units: item.units.map(unit => ({
          ...unit,
          status: unit.status as ItemStatus,
        })),
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
            units: {
              create: Array.from({ length: item.quantity }, (_value, index) => ({
                unitIndex: index,
                status: 'pending',
              })),
            },
          })),
        },
      },
      include: {
        items: {
          include: {
            units: true,
          },
        },
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
        units: item.units.map(unit => ({
          ...unit,
          status: unit.status as ItemStatus,
        })),
      })),
    };
  }

  async deleteOrder(orderId: string): Promise<void> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true },
    });

    if (!order) throw new Error('Order not found');

    const orderItems = await prisma.orderItem.findMany({
      where: { orderId },
      select: { id: true },
    });

    const orderItemIds = orderItems.map(item => item.id);

    await prisma.$transaction([
      prisma.orderItemUnit.deleteMany({
        where: { orderItemId: { in: orderItemIds } },
      }),
      prisma.orderItem.deleteMany({
        where: { orderId },
      }),
      prisma.order.delete({
        where: { id: orderId },
      }),
    ]);
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: {
          include: {
            units: true,
          },
        },
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
        units: item.units.map(unit => ({
          ...unit,
          status: unit.status as ItemStatus,
        })),
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
      include: {
        items: {
          include: {
            units: true,
          },
        },
      },
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
        units: item.units.map(unit => ({
          ...unit,
          status: unit.status as ItemStatus,
        })),
      })),
    };
  }

  async updateOrderItemUnitStatus(orderId: string, unitId: string, status: ItemStatus): Promise<Order> {
    const updateResult = await prisma.orderItemUnit.updateMany({
      where: { id: unitId },
      data: { status },
    });

    if (updateResult.count === 0) {
      const parsed = unitId.match(/^(.*)-unit-(\d+)$/);
      if (!parsed) throw new Error('Order item unit not found');

      const orderItemId = parsed[1];
      const unitIndex = Number.parseInt(parsed[2], 10);

      if (Number.isNaN(unitIndex)) throw new Error('Order item unit not found');

      const item = await prisma.orderItem.findFirst({
        where: { id: orderItemId, orderId },
      });

      if (!item) throw new Error('Order item not found');

      const existingUnit = await prisma.orderItemUnit.findFirst({
        where: { orderItemId, unitIndex },
      });

      if (existingUnit) {
        await prisma.orderItemUnit.update({
          where: { id: existingUnit.id },
          data: { status },
        });
      } else {
        await prisma.orderItemUnit.create({
          data: {
            orderItemId,
            unitIndex,
            status,
          },
        });
      }
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            units: true,
          },
        },
      },
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
        units: item.units.map(unit => ({
          ...unit,
          status: unit.status as ItemStatus,
        })),
      })),
    };
  }

  async updateOrderItemUnitsStatus(orderId: string, itemId: string, status: ItemStatus): Promise<Order> {
    await prisma.orderItemUnit.updateMany({
      where: { orderItemId: itemId },
      data: { status },
    });

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            units: true,
          },
        },
      },
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
        units: item.units.map(unit => ({
          ...unit,
          status: unit.status as ItemStatus,
        })),
      })),
    };
  }
}
