import React from 'react';
import { 
  X, 
  Printer, 
  Download, 
  CheckCircle, 
  ArrowRight, 
  Store, 
  Receipt,
  FileCheck2,
  PackageCheck
} from 'lucide-react';
import { Invoice, StoreProfile } from '../types';
import { formatPKR, formatDatePK } from '../utils/formatters';
import { generateInvoicePDF } from '../utils/pdfGenerator';

interface InvoiceReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  storeProfile: StoreProfile;
  onStartNewBill: () => void;
}

export const InvoiceReceiptModal: React.FC<InvoiceReceiptModalProps> = ({
  isOpen,
  onClose,
  invoice,
  storeProfile,
  onStartNewBill,
}) => {
  if (!isOpen || !invoice) return null;

  const handleDownloadPDF = () => {
    generateInvoicePDF(invoice, storeProfile, { autoDownload: true });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-slate-50 w-full max-w-lg rounded-xl shadow-2xl border border-slate-300 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Receipt className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">Invoice Finalized & Stock Deducted</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Receipt Preview */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          {/* Success Alerts */}
          <div className="space-y-2">
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-2.5 rounded-lg flex items-center space-x-2.5 text-xs shadow-2xs">
              <PackageCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">Stock Deduction Completed Auto!</p>
                <p className="text-[11px] text-emerald-700">
                  {invoice.items.length} item(s) deducted from current store inventory.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 text-blue-900 p-2.5 rounded-lg flex items-center space-x-2.5 text-xs shadow-2xs">
              <FileCheck2 className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <p className="font-bold">PDF Invoice Generated</p>
                <p className="text-[11px] text-blue-700">
                  Receipt saved as <span className="font-mono font-semibold">{invoice.billNumber}.pdf</span>
                </p>
              </div>
            </div>
          </div>

          {/* Printable Receipt Card */}
          <div 
            id="thermal-receipt"
            className="bg-white p-5 rounded-lg border border-slate-300 shadow-inner font-mono text-xs text-slate-800 max-w-sm mx-auto select-all"
          >
            {/* Store Header */}
            <div className="text-center border-b border-dashed border-slate-300 pb-3 mb-3">
              <h2 className="text-base font-bold tracking-tight text-slate-900 uppercase">
                {storeProfile.storeName}
              </h2>
              <p className="text-[10px] text-slate-500">{storeProfile.tagline}</p>
              <p className="text-[10px] text-slate-500 mt-1">{storeProfile.address}</p>
              <p className="text-[10px] text-slate-500">Ph: {storeProfile.phone}</p>
              {storeProfile.strn && (
                <p className="text-[9px] text-slate-400 mt-0.5">{storeProfile.strn} | {storeProfile.ntn}</p>
              )}
            </div>

            {/* Bill Details */}
            <div className="border-b border-dashed border-slate-300 pb-2 mb-2 text-[11px]">
              <div className="flex justify-between font-bold">
                <span>INVOICE:</span>
                <span className="text-emerald-700">{invoice.billNumber}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Date:</span>
                <span>{formatDatePK(invoice.date)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Payment:</span>
                <span className="font-semibold text-slate-700">{invoice.paymentMethod}</span>
              </div>
              {invoice.customerName && (
                <div className="flex justify-between text-slate-500">
                  <span>Customer:</span>
                  <span>{invoice.customerName}</span>
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="border-b border-dashed border-slate-300 pb-2 mb-2">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] uppercase text-slate-500">
                    <th className="py-1">Item</th>
                    <th className="py-1 text-center">Qty</th>
                    <th className="py-1 text-right">Price</th>
                    <th className="py-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {invoice.items.map((item) => (
                    <tr key={item.code}>
                      <td className="py-1 pr-1 font-medium">{item.name}</td>
                      <td className="py-1 text-center">{item.qty}</td>
                      <td className="py-1 text-right text-slate-600">{formatPKR(item.price)}</td>
                      <td className="py-1 text-right font-semibold">{formatPKR(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Breakdown in Pakistani Rupee */}
            <div className="space-y-1 text-[11px] border-b border-dashed border-slate-300 pb-2 mb-2">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>{formatPKR(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>
                  {invoice.taxRate > 0
                    ? `Sales Tax (${(invoice.taxRate * 100).toFixed(1).replace(/\.0$/, '')}%):`
                    : invoice.taxAmount > 0
                    ? 'Sales Tax (Manual):'
                    : 'Sales Tax (0% / Exempt):'}
                </span>
                <span>{formatPKR(invoice.taxAmount)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Discount:</span>
                  <span>- {formatPKR(invoice.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-200">
                <span>NET TOTAL:</span>
                <span className="text-emerald-700">{formatPKR(invoice.total)}</span>
              </div>
              {invoice.amountTendered && invoice.amountTendered > 0 ? (
                <>
                  <div className="flex justify-between text-slate-500 text-[10px] pt-1">
                    <span>Amount Paid:</span>
                    <span>{formatPKR(invoice.amountTendered)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[10px]">
                    <span>Change Returned:</span>
                    <span>{formatPKR(invoice.changeDue || 0)}</span>
                  </div>
                </>
              ) : null}
            </div>

            {/* Footer Notice */}
            <div className="text-center text-[10px] text-slate-500 space-y-1">
              <p className="font-bold text-slate-700">Thank You! Visit Again!</p>
              <p>شکریہ! دوبارہ تشریف لائیں</p>
              <p className="text-[9px] text-slate-400">
                Computer-Generated Tax Invoice (Pakistani Standards)
              </p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold py-2 px-3.5 rounded shadow-sm flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold py-2 px-3.5 rounded shadow-sm flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>

          <div className="flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold py-2 px-3.5 rounded transition cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onStartNewBill();
                onClose();
              }}
              className="bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold py-2 px-4 rounded shadow-sm flex items-center space-x-1 transition cursor-pointer"
            >
              <span>Start Next Bill</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
