import { Product, StoreProfile } from '../types';

export const DEFAULT_PRODUCTS: Record<string, Product> = {
  P001: { code: 'P001', name: 'Basmati Rice 1kg', price: 340, stock: 45, category: 'Grains' },
  P002: { code: 'P002', name: 'Refined Sugar 1kg', price: 160, stock: 60, category: 'Pantry' },
  P003: { code: 'P003', name: 'Full Cream Milk 1L', price: 280, stock: 35, category: 'Dairy' },
  P004: { code: 'P004', name: 'Fresh Plain Bread', price: 140, stock: 25, category: 'Bakery' },
  P005: { code: 'P005', name: 'Farm Fresh Eggs (12)', price: 320, stock: 40, category: 'Dairy & Poultry' },
  P006: { code: 'P006', name: 'Cooking Oil 1L Pouch', price: 540, stock: 30, category: 'Oils' },
  P007: { code: 'P007', name: 'Danedar Tea 250g', price: 420, stock: 50, category: 'Beverages' },
  P008: { code: 'P008', name: 'Iodized Salt 1kg', price: 60, stock: 80, category: 'Pantry' },
  P009: { code: 'P009', name: 'Daal Chana 1kg', price: 290, stock: 30, category: 'Pulses' },
  P010: { code: 'P010', name: 'Chakki Atta (Flour) 10kg', price: 1250, stock: 20, category: 'Flour & Grains' },
  P011: { code: 'P011', name: 'Mineral Water 1.5L', price: 100, stock: 75, category: 'Beverages' },
  P012: { code: 'P012', name: 'Dishwash Bar 250g', price: 110, stock: 45, category: 'Household' },
};

export const DEFAULT_STORE_PROFILE: StoreProfile = {
  storeName: 'AL-MADINA SUPER MARKET',
  tagline: 'Quality Grocery & General Store',
  address: 'Main Commercial Market, Sector G-9, Islamabad, Pakistan',
  phone: '+92 51 2894100 / 0300-1234567',
  strn: 'STRN: 3277876123456',
  ntn: 'NTN: 8943120-7',
};
