export type DiscountType = 'percent' | 'amount';

export interface BillItem {
  id: string;
  billId: string;
  menuItemId?: string | null;
  name: string;
  category: string;
  quantity: number;
  unitPrice?: number | null;
  lineTotal: number;
  orderId?: string | null;
  isExtra: boolean;
}

export interface Bill {
  id: string;
  tableNumber: string;
  createdAt: number;
  closedAt?: number | null;
  status: 'open' | 'closed' | 'cancelled' | string;
  waiterName?: string | null;
  baseOrderIds: string[];
  extraOrderIds: string[];
  subtotalBase: number;
  subtotalExtras: number;
  discountType?: DiscountType | null;
  discountValue?: number | null;
  grandTotal: number;
  items: BillItem[];
}

export interface CreateBillInput {
  tableNumber: string;
  waiterName?: string | null;
  baseOrderIds: string[];
  extraOrderIds: string[];
  discount?: { type: DiscountType; value: number } | null;
}

export interface UpdateBillInput {
  status?: 'open' | 'closed' | 'cancelled' | string;
  discount?: { type: DiscountType; value: number } | null;
  // Προαιρετικά: ενημέρωση παραγγελιών που ανήκουν στο bill (ανα-υπολογισμός items/συνόλων)
  baseOrderIds?: string[];
  extraOrderIds?: string[];
}
