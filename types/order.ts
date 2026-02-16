export type OrderCategory = 'Κρύα' | 'Ζεστές' | 'Ψησταριά' | 'Μαγειρευτό' | 'Ποτά';

export type ItemStatus = 'pending' | 'ready' | 'delivered';
export type OrderStatus = 'pending' | 'completed' | 'cancelled';

export interface MenuItem {
  id: string;
  name: string;
  category: OrderCategory;
  price?: number; // Optional for MVP
  extraNotes?: string | null;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  category: OrderCategory;
  itemStatus: ItemStatus;
  extraNotes?: string | null;
}

export interface Order {
  id: string;
  tableNumber: string;
  waiterName: string;
  items: OrderItem[];
  timestamp: number;
  status: OrderStatus;
  extraNotes?: string | null;
}
