import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Trash2, 
  Printer, 
  RotateCcw, 
  Plus, 
  Minus, 
  CreditCard, 
  DollarSign, 
  Smartphone, 
  Building, 
  FileText, 
  CheckCircle2,
  AlertCircle,
  Receipt
} from 'lucide-react';
import { CartItem, PaymentMethod } from '../types';
import { formatPKR, formatDatePK } from '../utils/formatters';

interface CartBillingProps {
  billNumber: string;
  cart: CartItem[];
  taxRate: number; // 0.05 for 5%
  onUpdateQty: (code: string, delta: number) => void;
  onRemoveItem: (code: string) => void;
  onClearCart: () => void;
  onNewBill: () => void;
  onCheckoutAndPrint: (paymentDetails: {
    paymentMethod: PaymentMethod;
    amountTendered: number;
    changeDue: number;
    discount: number;
    taxRate: number;
    taxAmount: number;
    customerName: string;
    customerPhone: string;
  }) => void;
}

export const CartBilling: React.FC<CartBillingProps> = ({
  billNumber,
  cart,
  taxRate,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onNewBill,
  onCheckoutAndPrint,
}) => {
  const [selectedItemCode, setSelectedItemCode] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Manual Tax State
  const [taxMode, setTaxMode] = useState<'percent' | 'fixed'>('percent');
  const [manualTaxPercent, setManualTaxPercent] = useState<string>((taxRate * 100).toString());
  const [manualTaxFixed, setManualTaxFixed] = useState<string>('');

  // Totals calculations with manual tax
  const subtotal = cart.reduce((acc, item) => acc + item.total, 0);
  const taxableBase = Math.max(0, subtotal - discount);

  let taxAmount = 0;
  let effectiveTaxRate = 0;

  if (taxMode === 'percent') {
    const pct = Math.max(0, parseFloat(manualTaxPercent) || 0);
    effectiveTaxRate = pct / 100;
    taxAmount = taxableBase * effectiveTaxRate;
  } else {
    taxAmount = Math.max(0, parseFloat(manualTaxFixed) || 0);
    effectiveTaxRate = taxableBase > 0 ? taxAmount / taxableBase : 0;
  }

  const grandTotal = Math.max(0, taxableBase + taxAmount);

  const tenderedNumber = parseFloat(cashTendered) || 0;
  const changeDue = Math.max(0, tenderedNumber - grandTotal);

  const handleRemoveSelected = () => {
    if (!selectedItemCode) {
      alert('Please select an item from the cart table to remove.');
      return;
    }
    onRemoveItem(selectedItemCode);
    setSelectedItemCode(null);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Cart is empty! Please add products before printing or generating an invoice.');
      return;
    }

    if (paymentMethod === 'Cash' && tenderedNumber > 0 && tenderedNumber < grandTotal) {
      const confirmUnderpaid = window.confirm(
        `Cash received (${formatPKR(tenderedNumber)}) is less than total bill (${formatPKR(grandTotal)}). Proceed anyway?`
      );
      if (!confirmUnderpaid) return;
    }

    setIsProcessing(true);
    try {
      onCheckoutAndPrint({
        paymentMethod,
        amountTendered: tenderedNumber || grandTotal,
        changeDue,
        discount,
        taxRate: effectiveTaxRate,
        taxAmount,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
      });
      // reset checkout fields
      setCashTendered('');
      setCustomerName('');
      setCustomerPhone('');
      setDiscount(0);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-slate-100 rounded-xl border border-slate-300 shadow-sm flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShoppingCart className="w-5 h-5 text-emerald-400" />
          <h2 className="font-bold text-base tracking-wide">Cart & Billing Checkout</h2>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold border border-emerald-500/30">
            {billNumber}
          </span>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col space-y-3 overflow-y-auto">
        {/* Bill Metadata Bar */}
        <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-700">Bill No:</span>
            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
              {billNumber}
            </span>
          </div>
          <div className="text-slate-500 font-mono">
            Date: {formatDatePK(new Date())}
          </div>
        </div>

        {/* Cart Table matching Python Treeview */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-2xs flex-1 flex flex-col overflow-hidden min-h-[220px]">
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 text-slate-600 font-semibold uppercase tracking-wider sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Item Name</th>
                  <th className="py-2.5 px-2 text-center w-28">Qty</th>
                  <th className="py-2.5 px-3 text-right w-24">Unit Price</th>
                  <th className="py-2.5 px-3 text-right w-28">Total (PKR)</th>
                  <th className="py-2.5 px-2 text-center w-12">Del</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cart.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-slate-300 opacity-60" />
                      <p className="font-medium">Cart is currently empty</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Scan or enter product codes on the left panel to begin billing
                      </p>
                    </td>
                  </tr>
                ) : (
                  cart.map((item) => {
                    const isSelected = selectedItemCode === item.code;
                    return (
                      <tr
                        key={item.code}
                        onClick={() => setSelectedItemCode(item.code)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-amber-50/80 font-medium' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-2 px-3 text-slate-900 font-medium">
                          <div className="font-semibold">{item.name}</div>
                          <span className="text-[10px] font-mono text-slate-400">
                            Code: {item.code}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-center">
                          <div className="inline-flex items-center space-x-1 border border-slate-200 rounded px-1 py-0.5 bg-slate-50">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateQty(item.code, -1);
                              }}
                              className="w-5 h-5 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded"
                              title="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-7 text-center font-mono font-bold text-slate-800">
                              {item.qty}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateQty(item.code, 1);
                              }}
                              className="w-5 h-5 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded"
                              title="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-slate-700">
                          {formatPKR(item.price)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                          {formatPKR(item.total)}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveItem(item.code);
                            }}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Quick Cart Summary Ribbon */}
          {cart.length > 0 && (
            <div className="bg-slate-50 px-3 py-1.5 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
              <span>
                Items in Cart: <strong>{cart.length}</strong> (
                {cart.reduce((a, b) => a + b.qty, 0)} units)
              </span>
              <button
                type="button"
                onClick={onClearCart}
                className="text-[11px] text-rose-600 hover:underline"
              >
                Clear Cart
              </button>
            </div>
          )}
        </div>

        {/* Customer & Payment Method Selector */}
        <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-2xs space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 uppercase">
                Customer Name (Optional)
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Walk-in Customer"
                className="w-full mt-0.5 px-2.5 py-1 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 uppercase">
                Customer Phone (Optional)
              </label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="0300-XXXXXXX"
                className="w-full mt-0.5 px-2.5 py-1 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Payment Method Tabs */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-1">
              Payment Method:
            </label>
            <div className="grid grid-cols-5 gap-1 text-center">
              {(['Cash', 'EasyPaisa', 'JazzCash', 'Card', 'Bank Transfer'] as PaymentMethod[]).map(
                (method) => {
                  const isSelected = paymentMethod === method;
                  return (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-1.5 px-1 rounded text-[11px] font-semibold transition border ${
                        isSelected
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {method}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* If Cash, tender amount calculator */}
          {paymentMethod === 'Cash' && (
            <div className="bg-slate-50 p-2 rounded border border-slate-200 flex items-center justify-between text-xs gap-3">
              <div className="flex-1">
                <label className="block text-[10px] font-semibold text-slate-600">
                  Cash Received (PKR):
                </label>
                <input
                  type="number"
                  placeholder="e.g. 2000"
                  value={cashTendered}
                  onChange={(e) => setCashTendered(e.target.value)}
                  className="w-full mt-0.5 px-2 py-1 text-xs font-mono font-bold bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div className="flex-1 text-right">
                <span className="block text-[10px] text-slate-500 font-semibold">Change to Return:</span>
                <span className="font-mono font-bold text-sm text-emerald-700">
                  {formatPKR(changeDue)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Manual Tax & Discount Controller */}
        <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center">
              <Receipt className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
              Manual Tax / ٹیکس ایڈجسٹمنٹ
            </span>
            {/* Mode switch */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded text-[10px]">
              <button
                type="button"
                onClick={() => setTaxMode('percent')}
                className={`px-2 py-0.5 rounded font-medium transition cursor-pointer ${
                  taxMode === 'percent'
                    ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                % Percentage
              </button>
              <button
                type="button"
                onClick={() => setTaxMode('fixed')}
                className={`px-2 py-0.5 rounded font-medium transition cursor-pointer ${
                  taxMode === 'fixed'
                    ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Rs. Fixed Amount
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Manual Tax input & presets */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-semibold text-slate-600 uppercase">
                  {taxMode === 'percent' ? 'Tax Rate (%)' : 'Tax Amount (PKR)'}
                </label>
                <span className="text-[10px] font-mono text-emerald-700 font-bold">
                  = {formatPKR(taxAmount)}
                </span>
              </div>
              <div className="flex items-center space-x-1.5">
                <input
                  type="number"
                  min="0"
                  step={taxMode === 'percent' ? '0.5' : '1'}
                  value={taxMode === 'percent' ? manualTaxPercent : manualTaxFixed}
                  onChange={(e) => {
                    if (taxMode === 'percent') {
                      setManualTaxPercent(e.target.value);
                    } else {
                      setManualTaxFixed(e.target.value);
                    }
                  }}
                  placeholder={taxMode === 'percent' ? 'e.g. 5 or 17' : 'e.g. 100'}
                  className="w-full px-2.5 py-1 text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <span className="text-xs font-bold text-slate-500 font-mono px-1">
                  {taxMode === 'percent' ? '%' : 'Rs.'}
                </span>
              </div>

              {/* Quick Presets */}
              {taxMode === 'percent' ? (
                <div className="flex items-center space-x-1 mt-1.5">
                  <span className="text-[9px] text-slate-400 font-medium">Quick:</span>
                  {[
                    { label: '0% (Exempt)', val: '0' },
                    { label: '5%', val: '5' },
                    { label: '17% (GST)', val: '17' },
                    { label: '18%', val: '18' },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setManualTaxPercent(preset.val)}
                      className={`text-[10px] px-1.5 py-0.5 rounded border transition cursor-pointer ${
                        manualTaxPercent === preset.val
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center space-x-1 mt-1.5">
                  <span className="text-[9px] text-slate-400 font-medium">Quick:</span>
                  {[
                    { label: 'Rs. 0', val: '0' },
                    { label: 'Rs. 50', val: '50' },
                    { label: 'Rs. 100', val: '100' },
                    { label: 'Rs. 200', val: '200' },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setManualTaxFixed(preset.val)}
                      className={`text-[10px] px-1.5 py-0.5 rounded border transition cursor-pointer ${
                        manualTaxFixed === preset.val
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Discount field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-semibold text-slate-600 uppercase">
                  Discount / رعایت (PKR)
                </label>
                {discount > 0 && (
                  <span className="text-[10px] font-mono text-rose-600 font-bold">
                    - {formatPKR(discount)}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-1.5">
                <input
                  type="number"
                  min="0"
                  value={discount || ''}
                  onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="0.00"
                  className="w-full px-2.5 py-1 text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <span className="text-xs font-bold text-slate-500 font-mono px-1">
                  PKR
                </span>
              </div>
              <div className="flex items-center space-x-1 mt-1.5">
                <span className="text-[9px] text-slate-400 font-medium">Quick:</span>
                {[0, 20, 50, 100, 200].map((dVal) => (
                  <button
                    key={dVal}
                    type="button"
                    onClick={() => setDiscount(dVal)}
                    className={`text-[10px] px-1.5 py-0.5 rounded border transition cursor-pointer ${
                      discount === dVal
                        ? 'bg-purple-100 text-purple-800 border-purple-300 font-bold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Rs. {dVal}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Totals Frame matching Python Tkinter */}
        <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-2xs space-y-1.5">
          <div className="flex justify-between items-center text-xs text-slate-600">
            <span>Subtotal:</span>
            <span className="font-mono font-semibold text-slate-800 text-sm">
              {formatPKR(subtotal)}
            </span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between items-center text-xs text-rose-600">
              <span>Discount:</span>
              <span className="font-mono font-semibold text-sm">
                - {formatPKR(discount)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center text-xs text-slate-600">
            <span className="flex items-center">
              <span>Sales Tax ({taxMode === 'percent' ? `${manualTaxPercent || 0}%` : 'Manual Amount'}):</span>
              <span className="ml-1.5 text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-bold">
                Manual
              </span>
            </span>
            <span className="font-mono font-semibold text-slate-800 text-sm">
              {formatPKR(taxAmount)}
            </span>
          </div>

          <div className="h-px bg-slate-200 my-1" />

          <div className="flex justify-between items-center py-1">
            <span className="text-base font-extrabold text-slate-900 tracking-tight uppercase">
              TOTAL (PKR):
            </span>
            <span className="font-mono font-black text-2xl text-rose-600 tracking-tight">
              {formatPKR(grandTotal)}
            </span>
          </div>

          <div className="pt-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 flex items-center justify-between">
            <span className="flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              Auto Stock Deduction on Checkout
            </span>
            <span className="font-semibold text-emerald-800">Auto PDF Invoice</span>
          </div>
        </div>

        {/* Action Buttons matching Python Tkinter: REMOVE ITEM, PRINT BILL, NEW BILL */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          {/* REMOVE ITEM (yellow/orange) */}
          <button
            id="btn-remove-item"
            type="button"
            onClick={handleRemoveSelected}
            className="bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold py-2.5 px-3 rounded-md shadow-sm transition flex items-center justify-center space-x-1.5 text-xs uppercase tracking-wide cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Remove Item</span>
          </button>

          {/* CHECKOUT & PRINT BILL / PDF (primary blue/emerald) */}
          <button
            id="btn-print-bill"
            type="button"
            onClick={handleCheckout}
            disabled={cart.length === 0 || isProcessing}
            className={`font-extrabold py-2.5 px-3 rounded-md shadow-sm transition flex items-center justify-center space-x-1.5 text-xs uppercase tracking-wide cursor-pointer text-white ${
              cart.length === 0
                ? 'bg-slate-400 cursor-not-allowed opacity-70'
                : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-emerald-700/20'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>{isProcessing ? 'Processing...' : 'Checkout & PDF Bill'}</span>
          </button>

          {/* NEW BILL (purple) */}
          <button
            id="btn-new-bill"
            type="button"
            onClick={onNewBill}
            className="bg-purple-700 hover:bg-purple-800 active:bg-purple-900 text-white font-bold py-2.5 px-3 rounded-md shadow-sm transition flex items-center justify-center space-x-1.5 text-xs uppercase tracking-wide cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>New Bill</span>
          </button>
        </div>
      </div>
    </div>
  );
};
