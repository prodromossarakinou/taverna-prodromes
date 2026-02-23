// Dynamic categories: allow any string so categories come from live menu items
export type OrderCategory = string;

export type ItemStatus = 'pending' | 'ready' | 'delivered';
export type OrderStatus =
  | 'new'
  | 'started'
  | 'completed'
  | 'delivered'
  | 'closed'
  | 'pending'
  | 'cancelled'
  | 'deleted';
export type WaiterMode = 'new' | 'view' | 'extras';

export interface WaiterParams {
  orderId?: string;
  mode: WaiterMode;
}

export interface MenuItem {
  id: string;
  name: string;
  category: OrderCategory;
  price: number | null;
  active: boolean;
  extraNotes?: string | null;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  category: OrderCategory;
  itemStatus: ItemStatus;
  extraNotes?: string | null;
  units?: OrderItemUnit[];
}

export interface OrderItemUnit {
  id: string;
  status: ItemStatus;
  unitIndex: number;
}

export interface Order {
  id: string;
  tableNumber: string;
  waiterName: string;
  items: OrderItem[];
  timestamp: number;
  status: OrderStatus;
  extraNotes?: string | null;
  isExtra?: boolean;
  parentId?: string;
}
