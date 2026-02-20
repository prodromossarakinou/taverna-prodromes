import { Order } from '@/types/order';

export type KitchenOrderStatus = 'new' | 'started' | 'completed' | 'delivered' | 'closed';
export type KitchenOrderFilterKey = KitchenOrderStatus | 'extra';

export const DEFAULT_KITCHEN_FILTERS: Record<KitchenOrderFilterKey, boolean> = {
  new: true,
  extra: true,
  started: true,
  completed: false,
  delivered: false,
  closed: false,
};

export const KITCHEN_FILTER_LABELS: Record<KitchenOrderFilterKey, string> = {
  new: 'NEW',
  extra: 'EXTRA',
  started: 'STARTED',
  completed: 'COMPLETED',
  delivered: 'DELIVERED',
  closed: 'CLOSED',
};

const LEGACY_STATUS_MAP: Record<string, KitchenOrderStatus> = {
  pending: 'new',
  cancelled: 'closed',
};

const KITCHEN_ORDER_STATUSES: KitchenOrderStatus[] = [
  'new',
  'started',
  'completed',
  'delivered',
  'closed',
];

export const KITCHEN_FILTER_KEYS: KitchenOrderFilterKey[] = [
  'new',
  'extra',
  'started',
  'completed',
  'delivered',
  'closed',
];

export function normalizeOrderStatus(status?: string | null): KitchenOrderStatus {
  if (status && KITCHEN_ORDER_STATUSES.includes(status as KitchenOrderStatus)) {
    return status as KitchenOrderStatus;
  }
  return status && LEGACY_STATUS_MAP[status] ? LEGACY_STATUS_MAP[status] : 'new';
}

export function resolveOrderStatus(order: Order): KitchenOrderFilterKey {
  if (order.isExtra) return 'extra';
  return normalizeOrderStatus(order.status);
}

export function getOrderAccent(order: Order): string {
  return `kitchen-status-${resolveOrderStatus(order)}`;
}