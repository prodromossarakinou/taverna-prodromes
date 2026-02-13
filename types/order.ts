export type OrderCategory = 'Κρύα' | 'Ζεστές' | 'Ψησταριά' | 'Μαγειρευτό' | 'Ποτά';

export type ItemStatus = 'pending' | 'ready' | 'delivered';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  category: OrderCategory;
  itemStatus: ItemStatus;
}

export interface Order {
  id: string;
  tableNumber: string;
  waiterName: string;
  items: OrderItem[];
  timestamp: number;
  status: 'pending' | 'completed';
}
