import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ProductEntry } from './components/ProductEntry';
import { CartBilling } from './components/CartBilling';
import { ProductManagementModal } from './components/ProductManagementModal';
import { InvoiceReceiptModal } from './components/InvoiceReceiptModal';
import { InvoiceHistoryModal } from './components/InvoiceHistoryModal';
import { StoreSettingsModal } from './components/StoreSettingsModal';
import { SalesSummaryModal } from './components/SalesSummaryModal';
import { Product, CartItem, Invoice, StoreProfile, PaymentMethod } from './types';
import { DEFAULT_PRODUCTS, DEFAULT_STORE_PROFILE } from './data/defaultProducts';
import { generateInvoicePDF } from './utils/pdfGenerator';
import { formatPKR } from './utils/formatters';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

const STORAGE_KEYS = {
  PRODUCTS: 'pos_pak_products',
  BILL_COUNT: 'pos_pak_bill_counter',
  INVOICES: 'pos_pak_invoices',
  STORE_PROFILE: 'pos_pak_store_profile',
  TAX_RATE: 'pos_pak_tax_rate',
};

export default function App() {
  // 1. Products Inventory State with persistence
  const [products, setProducts] = useState<Record<string, Product>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading products from storage', e);
    }
    return DEFAULT_PRODUCTS;
  });

  // 2. Bill Counter
  const [billCounter, setBillCounter] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BILL_COUNT);
      if (saved) {
        return parseInt(saved, 10) || 1;
      }
    } catch (e) {
      console.error('Error loading bill counter', e);
    }
    return 1;
  });

  // 3. Invoice History
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INVOICES);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading invoices', e);
    }
    return [];
  });

  // 4. Store Profile
  const [storeProfile, setStoreProfile] = useState<StoreProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STORE_PROFILE);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading store profile', e);
    }
    return DEFAULT_STORE_PROFILE;
  });

  // 5. Tax Rate (Default 5% matching Python Tkinter code)
  const [taxRate, setTaxRate] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TAX_RATE);
      if (saved) {
        return parseFloat(saved) || 0.05;
      }
    } catch (e) {
      console.error('Error loading tax rate', e);
    }
    return 0.05;
  });

  // 6. Active Cart
  const [cart, setCart] = useState<CartItem[]>([]);

  // 7. Modals
  const [isProductMgmtOpen, setIsProductMgmtOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isSalesSummaryOpen, setIsSalesSummaryOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);

  // 8. Toast Notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Seed sample invoices for immediate analytics preview
  const handleSeedSampleInvoices = () => {
    const sampleInvoices: Invoice[] = [
      {
        billNumber: 'BILL-000001',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        items: [
          { code: 'P001', name: 'Basmati Rice 1kg', qty: 4, price: 340, total: 1360 },
          { code: 'P006', name: 'Cooking Oil 1L Pouch', qty: 2, price: 540, total: 1080 },
          { code: 'P002', name: 'Refined Sugar 1kg', qty: 3, price: 160, total: 480 },
        ],
        subtotal: 2920,
        taxRate: 0.05,
        taxAmount: 146,
        discount: 0,
        total: 3066,
        paymentMethod: 'Cash',
        amountTendered: 3500,
        changeDue: 434,
        customerName: 'Muhammad Tariq',
      },
      {
        billNumber: 'BILL-000002',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        items: [
          { code: 'P010', name: 'Chakki Atta (Flour) 10kg', qty: 3, price: 1250, total: 3750 },
          { code: 'P007', name: 'Danedar Tea 250g', qty: 4, price: 420, total: 1680 },
          { code: 'P003', name: 'Full Cream Milk 1L', qty: 5, price: 280, total: 1400 },
        ],
        subtotal: 6830,
        taxRate: 0.05,
        taxAmount: 341.5,
        discount: 0,
        total: 7171.5,
        paymentMethod: 'EasyPaisa',
        customerName: 'Ayesha Khan',
      },
      {
        billNumber: 'BILL-000003',
        date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        items: [
          { code: 'P005', name: 'Farm Fresh Eggs (12)', qty: 6, price: 320, total: 1920 },
          { code: 'P004', name: 'Fresh Plain Bread', qty: 4, price: 140, total: 560 },
          { code: 'P003', name: 'Full Cream Milk 1L', qty: 3, price: 280, total: 840 },
          { code: 'P002', name: 'Refined Sugar 1kg', qty: 2, price: 160, total: 320 },
        ],
        subtotal: 3640,
        taxRate: 0.05,
        taxAmount: 182,
        discount: 0,
        total: 3822,
        paymentMethod: 'JazzCash',
        customerName: 'Bilal Ahmed',
      },
      {
        billNumber: 'BILL-000004',
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        items: [
          { code: 'P001', name: 'Basmati Rice 1kg', qty: 8, price: 340, total: 2720 },
          { code: 'P006', name: 'Cooking Oil 1L Pouch', qty: 4, price: 540, total: 2160 },
          { code: 'P009', name: 'Daal Chana 1kg', qty: 3, price: 290, total: 870 },
          { code: 'P008', name: 'Iodized Salt 1kg', qty: 5, price: 60, total: 300 },
        ],
        subtotal: 6050,
        taxRate: 0.05,
        taxAmount: 302.5,
        discount: 0,
        total: 6352.5,
        paymentMethod: 'Card',
        customerName: 'Hamza Farooq',
      },
      {
        billNumber: 'BILL-000005',
        date: new Date().toISOString(),
        items: [
          { code: 'P007', name: 'Danedar Tea 250g', qty: 3, price: 420, total: 1260 },
          { code: 'P003', name: 'Full Cream Milk 1L', qty: 4, price: 280, total: 1120 },
          { code: 'P004', name: 'Fresh Plain Bread', qty: 2, price: 140, total: 280 },
        ],
        subtotal: 2660,
        taxRate: 0.05,
        taxAmount: 133,
        discount: 0,
        total: 2793,
        paymentMethod: 'Cash',
        amountTendered: 3000,
        changeDue: 207,
        customerName: 'Zainab Bibi',
      }
    ];

    setInvoices((prev) => {
      // Deduplicate by billNumber if any
      const existingIds = new Set(prev.map(i => i.billNumber));
      const newItems = sampleInvoices.filter(i => !existingIds.has(i.billNumber));
      return [...newItems, ...prev];
    });
    setBillCounter((prev) => Math.max(prev, 6));
    showToast('Loaded sample historical sales data for chart visualization.', 'success');
  };

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BILL_COUNT, billCounter.toString());
  }, [billCounter]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STORE_PROFILE, JSON.stringify(storeProfile));
  }, [storeProfile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TAX_RATE, taxRate.toString());
  }, [taxRate]);

  // Current Bill Number formatted as BILL-000001
  const currentBillNumber = `BILL-${String(billCounter).padStart(6, '0')}`;

  // Add to cart with stock validation
  const handleAddToCart = (code: string, qty: number): { success: boolean; message?: string } => {
    const product = products[code];
    if (!product) {
      return { success: false, message: `Product '${code}' not found!` };
    }

    const existingIndex = cart.findIndex((item) => item.code === code);
    const currentCartQty = existingIndex > -1 ? cart[existingIndex].qty : 0;
    const totalDesiredQty = currentCartQty + qty;

    // Stock availability check
    if (totalDesiredQty > product.stock) {
      const remainingAvailable = Math.max(0, product.stock - currentCartQty);
      return {
        success: false,
        message: `Insufficient stock for '${product.name}'! Available stock: ${product.stock}, in cart: ${currentCartQty}, additional available: ${remainingAvailable}.`,
      };
    }

    if (existingIndex > -1) {
      const updatedCart = [...cart];
      const newQty = updatedCart[existingIndex].qty + qty;
      updatedCart[existingIndex] = {
        ...updatedCart[existingIndex],
        qty: newQty,
        total: newQty * product.price,
      };
      setCart(updatedCart);
    } else {
      setCart([
        ...cart,
        {
          code: product.code,
          name: product.name,
          qty: qty,
          price: product.price,
          total: qty * product.price,
        },
      ]);
    }

    return { success: true };
  };

  // Adjust Cart Qty
  const handleUpdateQty = (code: string, delta: number) => {
    const product = products[code];
    const existingIndex = cart.findIndex((item) => item.code === code);
    if (existingIndex === -1) return;

    const currentItem = cart[existingIndex];
    const newQty = currentItem.qty + delta;

    if (newQty <= 0) {
      // Remove item if qty is 0 or less
      handleRemoveItem(code);
      return;
    }

    // Check stock if increasing
    if (delta > 0 && product && newQty > product.stock) {
      showToast(`Cannot add more. Only ${product.stock} units available in stock!`, 'warning');
      return;
    }

    const updatedCart = [...cart];
    updatedCart[existingIndex] = {
      ...currentItem,
      qty: newQty,
      total: newQty * currentItem.price,
    };
    setCart(updatedCart);
  };

  // Remove Item
  const handleRemoveItem = (code: string) => {
    setCart(cart.filter((item) => item.code !== code));
  };

  // Clear Cart
  const handleClearCart = () => {
    if (cart.length === 0) return;
    setCart([]);
    showToast('Cart cleared.', 'info');
  };

  // New Bill
  const handleNewBill = () => {
    if (cart.length > 0) {
      const proceed = window.confirm('Discard current cart and start a new bill?');
      if (!proceed) return;
    }
    setCart([]);
    showToast(`Ready for ${currentBillNumber}`, 'info');
  };

  // CHECKOUT & AUTO STOCK DEDUCTION & AUTO PDF INVOICE GENERATION
  const handleCheckoutAndPrint = (paymentDetails: {
    paymentMethod: PaymentMethod;
    amountTendered: number;
    changeDue: number;
    discount: number;
    taxRate?: number;
    taxAmount?: number;
    customerName: string;
    customerPhone: string;
  }) => {
    if (cart.length === 0) return;

    // 1. Final verification of stock for all items
    for (const item of cart) {
      const prod = products[item.code];
      if (!prod || prod.stock < item.qty) {
        showToast(
          `Cannot complete invoice! Stock for '${item.name}' is insufficient (Available: ${
            prod ? prod.stock : 0
          }, Requested: ${item.qty}).`,
          'warning'
        );
        return;
      }
    }

    // 2. Compute Invoice Totals in Pakistani Rupee (PKR) with Manual Tax
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    const taxableAmount = Math.max(0, subtotal - paymentDetails.discount);
    
    // Apply manual tax provided from checkout
    const appliedTaxAmount = typeof paymentDetails.taxAmount === 'number'
      ? paymentDetails.taxAmount
      : taxableAmount * (paymentDetails.taxRate ?? taxRate);

    const appliedTaxRate = typeof paymentDetails.taxRate === 'number'
      ? paymentDetails.taxRate
      : taxRate;

    const finalTotal = Math.max(0, taxableAmount + appliedTaxAmount);

    const billId = currentBillNumber;

    const newInvoice: Invoice = {
      billNumber: billId,
      date: new Date().toISOString(),
      items: [...cart],
      subtotal,
      taxRate: appliedTaxRate,
      taxAmount: appliedTaxAmount,
      discount: paymentDetails.discount,
      total: finalTotal,
      paymentMethod: paymentDetails.paymentMethod,
      amountTendered: paymentDetails.amountTendered,
      changeDue: paymentDetails.changeDue,
      customerName: paymentDetails.customerName,
      customerPhone: paymentDetails.customerPhone,
    };

    // 3. AUTOMATIC STOCK DEDUCTION (invoice banne ke bad stock se deduction auto ho)
    const updatedProducts = { ...products };
    cart.forEach((item) => {
      if (updatedProducts[item.code]) {
        const remaining = Math.max(0, updatedProducts[item.code].stock - item.qty);
        updatedProducts[item.code] = {
          ...updatedProducts[item.code],
          stock: remaining,
        };
      }
    });
    setProducts(updatedProducts);

    // 4. Record invoice into sales history
    setInvoices([newInvoice, ...invoices]);

    // 5. AUTOMATIC PDF GENERATION (add a feature to generate PDF invoices automatically)
    try {
      generateInvoicePDF(newInvoice, storeProfile, { autoDownload: true });
    } catch (pdfErr) {
      console.error('Error generating PDF invoice:', pdfErr);
    }

    // 6. Open Receipt / Print Modal for user inspection
    setActiveInvoice(newInvoice);
    setIsReceiptOpen(true);

    // 7. Advance sequential bill counter
    setBillCounter((prev) => prev + 1);

    // 8. Clear the active cart for the next customer
    setCart([]);

    // 9. Informative Toast
    showToast(
      `Invoice ${billId} created! Stock automatically deducted for ${newInvoice.items.length} items. PDF downloaded.`,
      'success'
    );
  };

  // Product management actions
  const handleSaveProduct = (newOrUpdated: Product) => {
    setProducts((prev) => ({
      ...prev,
      [newOrUpdated.code]: newOrUpdated,
    }));
    showToast(`Product ${newOrUpdated.code} saved successfully.`, 'success');
  };

  const handleDeleteProduct = (code: string) => {
    setProducts((prev) => {
      const updated = { ...prev };
      delete updated[code];
      return updated;
    });
    showToast(`Product ${code} removed from catalog.`, 'info');
  };

  const handleQuickRestock = (code: string, addQty: number) => {
    setProducts((prev) => {
      const prod = prev[code];
      if (!prod) return prev;
      return {
        ...prev,
        [code]: {
          ...prod,
          stock: prod.stock + addQty,
        },
      };
    });
    showToast(`Added ${addQty} units to ${code}.`, 'success');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-800 flex flex-col font-sans select-none">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top duration-200">
          <div
            className={`px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center space-x-2 border ${
              toast.type === 'success'
                ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
                : toast.type === 'warning'
                ? 'bg-amber-900 text-amber-100 border-amber-700'
                : 'bg-blue-900 text-blue-100 border-blue-700'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : toast.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-blue-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Top Header */}
      <Header
        storeProfile={storeProfile}
        currentBillNumber={currentBillNumber}
        products={products}
        invoices={invoices}
        onOpenProductMgmt={() => setIsProductMgmtOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenSalesSummary={() => setIsSalesSummaryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Workspace (Split Grid matching Tkinter Left & Right Panels) */}
      <main className="flex-1 p-3 sm:p-4 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left Panel: Product Entry & Catalog (5 cols on lg) */}
        <div className="lg:col-span-6 flex flex-col h-[calc(100vh-135px)] min-h-[580px]">
          <ProductEntry
            products={products}
            onAddToCart={handleAddToCart}
            onOpenProductMgmt={() => setIsProductMgmtOpen(true)}
          />
        </div>

        {/* Right Panel: Cart & Billing Checkout (7 cols on lg) */}
        <div className="lg:col-span-6 flex flex-col h-[calc(100vh-135px)] min-h-[580px]">
          <CartBilling
            billNumber={currentBillNumber}
            cart={cart}
            taxRate={taxRate}
            onUpdateQty={handleUpdateQty}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onNewBill={handleNewBill}
            onCheckoutAndPrint={handleCheckoutAndPrint}
          />
        </div>
      </main>

      {/* Modals */}
      <ProductManagementModal
        isOpen={isProductMgmtOpen}
        onClose={() => setIsProductMgmtOpen(false)}
        products={products}
        onSaveProduct={handleSaveProduct}
        onDeleteProduct={handleDeleteProduct}
        onQuickRestock={handleQuickRestock}
      />

      <InvoiceReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        invoice={activeInvoice}
        storeProfile={storeProfile}
        onStartNewBill={handleNewBill}
      />

      <InvoiceHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        invoices={invoices}
        storeProfile={storeProfile}
        onViewInvoice={(inv) => {
          setActiveInvoice(inv);
          setIsReceiptOpen(true);
        }}
      />

      <StoreSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        storeProfile={storeProfile}
        taxRate={taxRate}
        onSave={(updatedProfile, updatedTaxRate) => {
          setStoreProfile(updatedProfile);
          setTaxRate(updatedTaxRate);
          showToast('Store settings updated successfully.', 'success');
        }}
      />

      <SalesSummaryModal
        isOpen={isSalesSummaryOpen}
        onClose={() => setIsSalesSummaryOpen(false)}
        invoices={invoices}
        onSeedSampleInvoices={handleSeedSampleInvoices}
      />
    </div>
  );
}
