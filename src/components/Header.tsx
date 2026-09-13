import React, { useState, useEffect } from 'react';
import { 
  Store, 
  Clock, 
  Package, 
  History, 
  Settings, 
  AlertCircle,
  Receipt,
  BarChart3,
  Download
} from 'lucide-react';
import { StoreProfile, Product, Invoice } from '../types';
import { formatPKR } from '../utils/formatters';

interface HeaderProps {
  storeProfile: StoreProfile;
  currentBillNumber: string;
  products: Record<string, Product>;
  invoices: Invoice[];
  onOpenProductMgmt: () => void;
  onOpenHistory: () => void;
  onOpenSalesSummary: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  storeProfile,
  currentBillNumber,
  products,
  invoices,
  onOpenProductMgmt,
  onOpenHistory,
  onOpenSalesSummary,
  onOpenSettings,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-PK', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Compute metrics
  const productList = Object.values(products) as Product[];
  const lowStockCount = productList.filter((p) => p.stock <= 5).length;
  
  const todayDateStr = new Date().toDateString();
  const todayInvoices = invoices.filter(
    (inv) => new Date(inv.date).toDateString() === todayDateStr
  );
  const todaySales = todayInvoices.reduce((sum, inv) => sum + inv.total, 0);

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 shadow-md">
      {/* Top Main Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Store Name */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center shadow-inner text-white">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-white uppercase">
                {storeProfile.storeName}
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                PKR Edition
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {storeProfile.tagline} • {storeProfile.strn || 'Registered Retailer'}
            </p>
          </div>
        </div>

        {/* Quick Stats Banner */}
        <div className="hidden lg:flex items-center space-x-6 text-xs bg-slate-800/80 px-4 py-1.5 rounded-lg border border-slate-700/60">
          <div className="flex items-center space-x-2">
            <Receipt className="w-4 h-4 text-emerald-400" />
            <span>
              Today's Bills: <strong className="text-white font-mono">{todayInvoices.length}</strong>
            </span>
          </div>
          <div className="h-4 w-px bg-slate-700" />
          <div>
            Sales Today:{' '}
            <strong className="text-emerald-300 font-mono">
              {formatPKR(todaySales)}
            </strong>
          </div>
          <div className="h-4 w-px bg-slate-700" />
          <div className="flex items-center space-x-1.5">
            <Package className="w-4 h-4 text-blue-400" />
            <span>
              Products: <strong className="text-white font-mono">{productList.length}</strong>
            </span>
            {lowStockCount > 0 && (
              <span className="ml-1 inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <AlertCircle className="w-3 h-3 mr-0.5" />
                {lowStockCount} low stock
              </span>
            )}
          </div>
        </div>

        {/* Live Clock & Navigation Actions */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-1.5 text-xs font-mono text-slate-300 bg-slate-800 px-3 py-1.5 rounded border border-slate-700">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{currentTime}</span>
          </div>

          {/* Action Buttons */}
          <button
            id="btn-nav-products"
            onClick={onOpenProductMgmt}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="Manage Products & Stock"
          >
            <Package className="w-3.5 h-3.5 text-blue-400" />
            <span>Inventory & Stock</span>
            {lowStockCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>

          <button
            id="btn-nav-history"
            onClick={onOpenHistory}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
            title="View Past Invoices & PDF Re-prints"
          >
            <History className="w-3.5 h-3.5 text-emerald-400" />
            <span>Invoices Log</span>
          </button>

          <button
            id="btn-nav-sales-summary"
            onClick={onOpenSalesSummary}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition cursor-pointer"
            title="View Sales Analytics, Revenue, Tax & Top-Selling Products"
          >
            <BarChart3 className="w-3.5 h-3.5 text-white" />
            <span>Sales Summary</span>
          </button>

          <a
            id="btn-nav-download-zip"
            href="/pos-billing-system.zip"
            download="pos-billing-system.zip"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer shadow-sm"
            title="Download Complete Source Code as ZIP"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            <span>Download ZIP</span>
          </a>

          <button
            id="btn-nav-settings"
            onClick={onOpenSettings}
            className="p-1.5 rounded text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
            title="Store Settings & Receipt Header"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sub-bar with Active Bill Indicator */}
      <div className="bg-slate-950 px-4 py-1.5 border-t border-slate-800/80 text-xs flex items-center justify-between text-slate-400 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Active Register: <strong className="text-slate-200">Terminal 01</strong></span>
          <span className="text-slate-600">|</span>
          <span>Currency: <strong className="text-emerald-400 font-semibold">Pakistani Rupee (PKR / Rs.)</strong></span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Stock Auto-Deduct: <strong className="text-emerald-400 font-medium">ENABLED</strong></span>
        </div>
        <div className="font-mono text-slate-300">
          Current Invoice:{' '}
          <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
            {currentBillNumber}
          </span>
        </div>
      </div>
    </header>
  );
};
