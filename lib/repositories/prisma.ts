import { MenuItem, Order, OrderStatus, ItemStatus, OrderCategory } from '@/types/order';
import { randomUUID } from 'crypto';
import { Bill as BillType, CreateBillInput, UpdateBillInput } from '@/types/bill';
import { IMenuRepository, IOrderRepository, IBillRepository } from './interfaces';
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
        id: randomUUID(),
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

export class PrismaBillRepository implements IBillRepository {
  async createBill(input: CreateBillInput): Promise<BillType> {
    const { tableNumber, waiterName, baseOrderIds, extraOrderIds, discount } = input;

    // 1) Αποτροπή διπλής δημιουργίας λογαριασμού για τα ίδια orders
    // Ελέγχουμε αν υπάρχει ήδη Bill που περιέχει οποιοδήποτε από τα δοθέντα orderIds
    const existing = await prisma.bill.findFirst({
      where: {
        OR: [
          { baseOrderIds: { hasSome: baseOrderIds } },
          { extraOrderIds: { hasSome: baseOrderIds } },
          { baseOrderIds: { hasSome: extraOrderIds } },
          { extraOrderIds: { hasSome: extraOrderIds } },
        ],
      },
      select: { id: true, status: true },
    });

    if (existing) {
      const err: any = new Error('BILL_ALREADY_EXISTS');
      err.code = 'BILL_ALREADY_EXISTS';
      err.billId = existing.id;
      err.status = existing.status;
      throw err;
    }

    const [orders, menu] = await Promise.all([
      prisma.order.findMany({
        where: { id: { in: [...baseOrderIds, ...extraOrderIds] } },
        include: { items: true },
      }),
      prisma.menuItem.findMany(),
    ]);

    const menuLookupByNameCat = (name: string, category: string | null | undefined) =>
      menu.find(m => m.name === name && m.category === (category ?? m.category)) ||
      menu.find(m => m.name === name) || null;

    const baseSet = new Set(baseOrderIds);
    const extraSet = new Set(extraOrderIds);

    let subtotalBase = 0;
    let subtotalExtras = 0;

    const billItemsData = orders.flatMap(o => {
      const isExtra = extraSet.has(o.id);
      return o.items.map(it => {
        const match = menuLookupByNameCat(it.name, it.category);
        const unitPrice = match?.price ?? null;
        const lineTotal = (it.quantity ?? 0) * (typeof unitPrice === 'number' ? unitPrice : 0);
        if (isExtra) subtotalExtras += lineTotal; else subtotalBase += lineTotal;
        return {
          menuItemId: match?.id ?? null,
          name: it.name,
          category: it.category,
          quantity: it.quantity,
          unitPrice,
          lineTotal,
          orderId: o.id,
          isExtra,
        };
      });
    });

    const discountValue = discount?.value && discount.value > 0 ? discount.value : 0;
    const subtotal = subtotalBase + subtotalExtras;
    const computedDiscount = discount && discount.type === 'percent'
      ? Math.min(subtotal, (subtotal * discountValue) / 100)
      : Math.min(subtotal, discountValue);
    const grandTotal = Math.max(0, subtotal - computedDiscount);

    // Create the bill and, after successful creation, auto-close all participating orders.
    const created = await prisma.bill.create({
      data: {
        tableNumber,
        waiterName: waiterName ?? null,
        baseOrderIds,
        extraOrderIds,
        subtotalBase,
        subtotalExtras,
        discountType: discount?.type ?? null,
        discountValue: discount?.value ?? null,
        grandTotal,
        items: {
          create: billItemsData,
        },
      },
      include: { items: true },
    });

    // Auto-close orders included in this bill. This reflects real workflow: after billing,
    // related orders are no longer editable. Idempotent: skip those already closed.
    try {
      const affectedOrderIds = [...new Set([...(baseOrderIds ?? []), ...(extraOrderIds ?? [])])];
      if (affectedOrderIds.length > 0) {
        await prisma.order.updateMany({
          where: {
            id: { in: affectedOrderIds },
            // Avoid double updates; do not touch already closed orders
            NOT: { status: 'closed' },
          },
          data: { status: 'closed' },
        });
      }
    } catch (e) {
      // Do not fail bill creation if closing orders fails; log and proceed.
      // The UI can still reflect the created bill; follow-up tasks can reconcile statuses if needed.
      // eslint-disable-next-line no-console
      console.error('Auto-close orders after bill creation failed:', e);
    }

    return {
      id: created.id,
      tableNumber: created.tableNumber,
      createdAt: created.createdAt.getTime(),
      closedAt: created.closedAt ? created.closedAt.getTime() : null,
      status: created.status as any,
      waiterName: created.waiterName,
      baseOrderIds: created.baseOrderIds,
      extraOrderIds: created.extraOrderIds,
      subtotalBase: created.subtotalBase,
      subtotalExtras: created.subtotalExtras,
      discountType: created.discountType as any,
      discountValue: created.discountValue ?? null,
      grandTotal: created.grandTotal,
      items: created.items.map(it => ({
        id: it.id,
        billId: it.billId,
        menuItemId: it.menuItemId,
        name: it.name,
        category: it.category,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        lineTotal: it.lineTotal,
        orderId: it.orderId,
        isExtra: it.isExtra,
      })),
    };
  }

  async getBill(id: string): Promise<BillType> {
    const bill = await prisma.bill.findUnique({ where: { id }, include: { items: true } });
    if (!bill) throw new Error('Bill not found');
    return {
      id: bill.id,
      tableNumber: bill.tableNumber,
      createdAt: bill.createdAt.getTime(),
      closedAt: bill.closedAt ? bill.closedAt.getTime() : null,
      status: bill.status as any,
      waiterName: bill.waiterName,
      baseOrderIds: bill.baseOrderIds,
      extraOrderIds: bill.extraOrderIds,
      subtotalBase: bill.subtotalBase,
      subtotalExtras: bill.subtotalExtras,
      discountType: bill.discountType as any,
      discountValue: bill.discountValue ?? null,
      grandTotal: bill.grandTotal,
      items: bill.items.map(it => ({
        id: it.id,
        billId: it.billId,
        menuItemId: it.menuItemId,
        name: it.name,
        category: it.category,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        lineTotal: it.lineTotal,
        orderId: it.orderId,
        isExtra: it.isExtra,
      })),
    };
  }

  async updateBill(id: string, input: UpdateBillInput): Promise<BillType> {
    // Update bill:
    // - status and/or discount
    // - optionally refresh included orders (base/extra) and fully recalc items/subtotals
    const bill = await prisma.bill.findUnique({ where: { id }, include: { items: true } });
    if (!bill) throw new Error('Bill not found');

    const patch: any = {};
    if (input.status) patch.status = input.status;

    // Determine if we need to refresh orders snapshot
    const shouldRefreshOrders = Array.isArray(input.baseOrderIds) || Array.isArray(input.extraOrderIds);

    let nextBaseOrderIds = bill.baseOrderIds;
    let nextExtraOrderIds = bill.extraOrderIds;
    if (Array.isArray(input.baseOrderIds)) nextBaseOrderIds = input.baseOrderIds;
    if (Array.isArray(input.extraOrderIds)) nextExtraOrderIds = input.extraOrderIds;

    let subtotalBase = bill.subtotalBase;
    let subtotalExtras = bill.subtotalExtras;
    let itemsData: Array<{
      menuItemId: string | null;
      name: string;
      category: string;
      quantity: number;
      unitPrice: number | null;
      lineTotal: number;
      orderId: string | null;
      isExtra: boolean;
    }> | null = null;

    if (shouldRefreshOrders) {
      const [orders, menu] = await Promise.all([
        prisma.order.findMany({
          where: { id: { in: [...nextBaseOrderIds, ...nextExtraOrderIds] } },
          include: { items: true },
        }),
        prisma.menuItem.findMany(),
      ]);

      const extraSet = new Set(nextExtraOrderIds);
      subtotalBase = 0;
      subtotalExtras = 0;

      const menuLookupByNameCat = (name: string, category: string | null | undefined) =>
        menu.find(m => m.name === name && m.category === (category ?? m.category)) ||
        menu.find(m => m.name === name) || null;

      itemsData = orders.flatMap(o => {
        const isExtra = extraSet.has(o.id);
        return o.items.map(it => {
          const match = menuLookupByNameCat(it.name, it.category);
          const unitPrice = match?.price ?? null;
          const lineTotal = (it.quantity ?? 0) * (typeof unitPrice === 'number' ? unitPrice : 0);
          if (isExtra) subtotalExtras += lineTotal; else subtotalBase += lineTotal;
          return {
            menuItemId: match?.id ?? null,
            name: it.name,
            category: it.category,
            quantity: it.quantity,
            unitPrice,
            lineTotal,
            orderId: o.id,
            isExtra,
          };
        });
      });
      patch.baseOrderIds = nextBaseOrderIds;
      patch.extraOrderIds = nextExtraOrderIds;
      patch.subtotalBase = subtotalBase;
      patch.subtotalExtras = subtotalExtras;
    }

    // Handle discount
    let discountType = bill.discountType as any;
    let discountValue = bill.discountValue ?? 0;
    if (input.discount) {
      discountType = input.discount.type;
      discountValue = input.discount.value > 0 ? input.discount.value : 0;
    }

    // Recompute grandTotal if discount provided or orders refreshed
    if (input.discount || shouldRefreshOrders) {
      const subtotal = (shouldRefreshOrders ? subtotalBase + subtotalExtras : bill.subtotalBase + bill.subtotalExtras);
      const computed = discountType === 'percent'
        ? Math.min(subtotal, (subtotal * (discountValue || 0)) / 100)
        : Math.min(subtotal, (discountValue || 0));
      patch.discountType = discountType ?? null;
      patch.discountValue = discountValue ?? null;
      patch.grandTotal = Math.max(0, subtotal - computed);
    }

    // Apply changes in a transaction if we need to replace items
    const result = await prisma.$transaction(async (tx) => {
      if (itemsData) {
        await tx.billItem.deleteMany({ where: { billId: id } });
      }
      const updated = await tx.bill.update({ where: { id }, data: patch, include: { items: true } });
      if (itemsData) {
        await tx.billItem.createMany({
          data: itemsData.map(d => ({ ...d, billId: id })),
        });
      }
      // fetch final state including new items
      const final = await tx.bill.findUnique({ where: { id }, include: { items: true } });
      if (!final) throw new Error('Bill not found');
      return final;
    });

    return {
      id: result.id,
      tableNumber: result.tableNumber,
      createdAt: result.createdAt.getTime(),
      closedAt: result.closedAt ? result.closedAt.getTime() : null,
      status: result.status as any,
      waiterName: result.waiterName,
      baseOrderIds: result.baseOrderIds,
      extraOrderIds: result.extraOrderIds,
      subtotalBase: result.subtotalBase,
      subtotalExtras: result.subtotalExtras,
      discountType: result.discountType as any,
      discountValue: result.discountValue ?? null,
      grandTotal: result.grandTotal,
      items: result.items.map(it => ({
        id: it.id,
        billId: it.billId,
        menuItemId: it.menuItemId,
        name: it.name,
        category: it.category,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        lineTotal: it.lineTotal,
        orderId: it.orderId,
        isExtra: it.isExtra,
      })),
    };
  }

  async listBills(params?: { table?: string; status?: string }): Promise<BillType[]> {
    const where: any = {};
    if (params?.table) where.tableNumber = params.table;
    if (params?.status) where.status = params.status;
    const bills = await prisma.bill.findMany({ where, orderBy: { createdAt: 'desc' }, include: { items: true } });
    return bills.map(bill => ({
      id: bill.id,
      tableNumber: bill.tableNumber,
      createdAt: bill.createdAt.getTime(),
      closedAt: bill.closedAt ? bill.closedAt.getTime() : null,
      status: bill.status as any,
      waiterName: bill.waiterName,
      baseOrderIds: bill.baseOrderIds,
      extraOrderIds: bill.extraOrderIds,
      subtotalBase: bill.subtotalBase,
      subtotalExtras: bill.subtotalExtras,
      discountType: bill.discountType as any,
      discountValue: bill.discountValue ?? null,
      grandTotal: bill.grandTotal,
      items: bill.items.map(it => ({
        id: it.id,
        billId: it.billId,
        menuItemId: it.menuItemId,
        name: it.name,
        category: it.category,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        lineTotal: it.lineTotal,
        orderId: it.orderId,
        isExtra: it.isExtra,
      })),
    }));
  }
}
