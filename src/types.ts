export interface Product {
  code: string;
  name: string;
  price: number; // in PKR
  stock: number;
  category?: string;
}

export interface CartItem {
  code: string;
  name: string;
  qty: number;
  price: number;
  total: number;
}

export type PaymentMethod = 'Cash' | 'Card' | 'EasyPaisa' | 'JazzCash' | 'Bank Transfer';

export interface Invoice {
  billNumber: string;
  date: string; // ISO string
  items: CartItem[];
  subtotal: number;
  taxRate: number; // e.g. 0.05
  taxAmount: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountTendered?: number;
  changeDue?: number;
  customerName?: string;
  customerPhone?: string;
}

export interface StoreProfile {
  storeName: string;
  tagline: string;
  address: string;
  phone: string;
  strn: string; // Sales Tax Registration Number (Pakistan)
  ntn: string;  // National Tax Number (Pakistan)
}
