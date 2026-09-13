import React, { useState } from 'react';
import { 
  X, 
  Package, 
  Plus, 
  Save, 
  Trash2, 
  Search, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { Product } from '../types';
import { formatPKR } from '../utils/formatters';

interface ProductManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Record<string, Product>;
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (code: string) => void;
  onQuickRestock: (code: string, addQty: number) => void;
}

export const ProductManagementModal: React.FC<ProductManagementModalProps> = ({
  isOpen,
  onClose,
  products,
  onSaveProduct,
  onDeleteProduct,
  onQuickRestock,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('50');
  const [category, setCategory] = useState('General');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const handleEditSelect = (prod: Product) => {
    setCode(prod.code);
    setName(prod.name);
    setPrice(prod.price.toString());
    setStock(prod.stock.toString());
    setCategory(prod.category || 'General');
    setFeedback({
      type: 'success',
      message: `Loaded '${prod.code}' for editing. Adjust price or stock and click Save Product.`,
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    const cleanName = name.trim();
    const numPrice = parseFloat(price);
    const numStock = parseInt(stock, 10);

    if (!cleanCode || !cleanName || isNaN(numPrice) || isNaN(numStock)) {
      setFeedback({ type: 'error', message: 'All fields (Code, Name, Price, Stock) are required with valid numbers!' });
      return;
    }

    if (numPrice < 0) {
      setFeedback({ type: 'error', message: 'Price cannot be negative!' });
      return;
    }

    if (numStock < 0) {
      setFeedback({ type: 'error', message: 'Stock cannot be negative!' });
      return;
    }

    const isExisting = !!products[cleanCode];

    onSaveProduct({
      code: cleanCode,
      name: cleanName,
      price: numPrice,
      stock: numStock,
      category: category.trim() || 'General',
    });

    setFeedback({
      type: 'success',
      message: `Product '${cleanCode}' ${isExisting ? 'updated' : 'added'} successfully!`,
    });

    // Reset form
    setCode('');
    setName('');
    setPrice('');
    setStock('50');
    setCategory('General');
  };

  const productList = (Object.values(products) as Product[]).filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.code.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      (p.category && p.category.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-slate-50 w-full max-w-3xl rounded-xl shadow-2xl border border-slate-300 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">Product & Inventory Management</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-5">
          {/* Feedback banner */}
          {feedback && (
            <div
              className={`p-3 rounded-md text-xs flex items-center justify-between ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              <div className="flex items-center space-x-2">
                {feedback.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setFeedback(null)}
                className="text-slate-500 hover:text-slate-800"
              >
                &times;
              </button>
            </div>
          )}

          {/* Add/Edit Product Form */}
          <form onSubmit={handleSave} className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center">
              <Plus className="w-4 h-4 text-emerald-600 mr-1" />
              Add or Edit Product
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              {/* Product Code */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Product Code *
                </label>
                <input
                  type="text"
                  placeholder="e.g. P013"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-2.5 py-1.5 text-xs font-mono font-bold uppercase bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* Product Name */}
              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tapal Danedar 400g"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* Price in PKR */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Price (PKR) *
                </label>
                <div className="relative">
                  <span className="absolute left-2 top-1.5 text-[10px] text-slate-400 font-mono">
                    Rs.
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full pl-8 pr-2 py-1.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Stock Quantity */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Stock Units *
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="50"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                To update stock or price of an existing product, enter its code or click it in the list below.
              </span>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold py-2 px-5 rounded shadow-sm flex items-center space-x-1.5 transition cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Product</span>
              </button>
            </div>
          </form>

          {/* Current Products Table */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs flex flex-col">
            <div className="p-3 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Current Products & Inventory ({productList.length})
              </span>
              <div className="relative w-56">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 text-slate-600 sticky top-0 border-b border-slate-200 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="py-2 px-3">Code</th>
                    <th className="py-2 px-3">Name</th>
                    <th className="py-2 px-3 text-right">Price (PKR)</th>
                    <th className="py-2 px-3 text-center">Current Stock</th>
                    <th className="py-2 px-3 text-center">Quick Restock</th>
                    <th className="py-2 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {productList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400">
                        No products found
                      </td>
                    </tr>
                  ) : (
                    productList.map((p) => {
                      const isLow = p.stock <= 5;
                      const isOut = p.stock <= 0;
                      return (
                        <tr key={p.code} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono font-bold text-slate-800">
                            {p.code}
                          </td>
                          <td className="py-2 px-3 text-slate-900 font-medium">
                            {p.name}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-semibold text-slate-800">
                            {formatPKR(p.price)}
                          </td>
                          <td className="py-2 px-3 text-center font-mono">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                isOut
                                  ? 'bg-rose-100 text-rose-700'
                                  : isLow
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {p.stock} units
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center">
                            <div className="inline-flex space-x-1">
                              <button
                                type="button"
                                onClick={() => onQuickRestock(p.code, 10)}
                                className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200"
                                title="Add 10 units to stock"
                              >
                                +10
                              </button>
                              <button
                                type="button"
                                onClick={() => onQuickRestock(p.code, 50)}
                                className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200"
                                title="Add 50 units to stock"
                              >
                                +50
                              </button>
                            </div>
                          </td>
                          <td className="py-2 px-3 text-center">
                            <div className="inline-flex space-x-2">
                              <button
                                type="button"
                                onClick={() => handleEditSelect(p)}
                                className="text-blue-600 hover:text-blue-800 text-[11px] font-medium"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Delete product '${p.name}' (${p.code})?`)) {
                                    onDeleteProduct(p.code);
                                  }
                                }}
                                className="text-rose-500 hover:text-rose-700"
                                title="Delete product"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
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
