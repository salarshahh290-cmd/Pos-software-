import React, { useState } from 'react';
import { 
  X, 
  History, 
  Search, 
  Download, 
  Eye, 
  FileText, 
  Calendar,
  CreditCard,
  CheckCircle2
} from 'lucide-react';
import { Invoice, StoreProfile } from '../types';
import { formatPKR, formatDatePK } from '../utils/formatters';
import { generateInvoicePDF } from '../utils/pdfGenerator';

interface InvoiceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: Invoice[];
  storeProfile: StoreProfile;
  onViewInvoice: (inv: Invoice) => void;
}

export const InvoiceHistoryModal: React.FC<InvoiceHistoryModalProps> = ({
  isOpen,
  onClose,
  invoices,
  storeProfile,
  onViewInvoice,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filtered = invoices.filter((inv) => {
    const q = searchTerm.toLowerCase();
    if (!q) return true;
    return (
      inv.billNumber.toLowerCase().includes(q) ||
      (inv.customerName && inv.customerName.toLowerCase().includes(q)) ||
      inv.paymentMethod.toLowerCase().includes(q) ||
      inv.items.some((item) => item.name.toLowerCase().includes(q))
    );
  });

  const totalSales = invoices.reduce((sum, inv) => sum + inv.total, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-slate-50 w-full max-w-4xl rounded-xl shadow-2xl border border-slate-300 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">Invoices & Billing Sales Log</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Analytics Ribbon */}
        <div className="bg-white p-4 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-50 p-3 rounded border border-slate-200">
            <span className="text-slate-500 font-semibold block uppercase">Total Invoices</span>
            <span className="text-lg font-bold font-mono text-slate-900">{invoices.length}</span>
          </div>
          <div className="bg-emerald-50 p-3 rounded border border-emerald-200">
            <span className="text-emerald-700 font-semibold block uppercase">Total Revenue (PKR)</span>
            <span className="text-lg font-bold font-mono text-emerald-900">{formatPKR(totalSales)}</span>
          </div>
          <div className="bg-blue-50 p-3 rounded border border-blue-200">
            <span className="text-blue-700 font-semibold block uppercase">Stock Deductions</span>
            <span className="text-lg font-bold font-mono text-blue-900">
              {invoices.reduce((cnt, inv) => cnt + inv.items.reduce((c, it) => c + it.qty, 0), 0)} units
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Bill No, Customer, or Product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Showing {filtered.length} of {invoices.length} records
          </span>
        </div>

        {/* Table of Invoices */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-200 text-slate-700 sticky top-0 border-b border-slate-300 font-semibold uppercase text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Bill Number</th>
                <th className="py-2.5 px-3">Date & Time</th>
                <th className="py-2.5 px-3">Customer / Items</th>
                <th className="py-2.5 px-3">Payment</th>
                <th className="py-2.5 px-3 text-right">Total (PKR)</th>
                <th className="py-2.5 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No invoices found. Generate your first invoice using the checkout panel!
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => (
                  <tr key={inv.billNumber} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {inv.billNumber}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                      {formatDatePK(inv.date)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-800">
                      <span className="font-semibold block">
                        {inv.customerName || 'Counter Customer'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {inv.items.map((it) => `${it.qty}x ${it.name}`).join(', ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {inv.paymentMethod}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      {formatPKR(inv.total)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="inline-flex space-x-1">
                        <button
                          type="button"
                          onClick={() => onViewInvoice(inv)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium transition flex items-center space-x-1"
                          title="View Receipt"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => generateInvoicePDF(inv, storeProfile, { autoDownload: true })}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-[11px] font-medium transition flex items-center space-x-1"
                          title="Re-download PDF"
                        >
                          <Download className="w-3 h-3" />
                          <span>PDF</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
