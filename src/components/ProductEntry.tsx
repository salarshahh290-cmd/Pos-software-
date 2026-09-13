import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  RotateCcw, 
  Search, 
  Package, 
  AlertTriangle, 
  Layers,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Product } from '../types';
import { formatPKR } from '../utils/formatters';

interface ProductEntryProps {
  products: Record<string, Product>;
  onAddToCart: (code: string, qty: number) => { success: boolean; message?: string };
  onOpenProductMgmt: () => void;
}

export const ProductEntry: React.FC<ProductEntryProps> = ({
  products,
  onAddToCart,
  onOpenProductMgmt,
}) => {
  const [productCode, setProductCode] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const codeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Keep focus ready for fast barcode / typing input
    codeInputRef.current?.focus();
  }, []);

  const handleAdd = () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedCode = productCode.trim().toUpperCase();

    if (!trimmedCode) {
      setErrorMessage('Please enter a product code!');
      codeInputRef.current?.focus();
      return;
    }

    if (!products[trimmedCode]) {
      setErrorMessage(`Product with code '${trimmedCode}' not found!`);
      return;
    }

    if (isNaN(quantity) || quantity <= 0) {
      setErrorMessage('Please enter a valid quantity (greater than 0)!');
      return;
    }

    const result = onAddToCart(trimmedCode, quantity);

    if (!result.success) {
      setErrorMessage(result.message || 'Unable to add product.');
      return;
    }

    // Success feedback
    const product = products[trimmedCode];
    setSuccessMessage(`Added ${quantity}x ${product.name} to cart.`);
    setTimeout(() => setSuccessMessage(null), 2500);

    // Reset inputs
    setProductCode('');
    setQuantity(1);
    codeInputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleClear = () => {
    setProductCode('');
    setQuantity(1);
    setErrorMessage(null);
    setSuccessMessage(null);
    codeInputRef.current?.focus();
  };

  const handleSelectProduct = (code: string) => {
    setProductCode(code);
    setErrorMessage(null);
  };

  // Filter products list
  const filteredProducts = (Object.values(products) as Product[]).filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.code.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      (p.category && p.category.toLowerCase().includes(q))
    );
  });

  return (
    <div className="bg-slate-100 rounded-xl border border-slate-300 shadow-sm flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layers className="w-5 h-5 text-emerald-400" />
          <h2 className="font-bold text-base tracking-wide">Product Entry & Inventory</h2>
        </div>
        <span className="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-300 font-mono">
          PKR Pricing
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col space-y-4 overflow-y-auto">
        {/* Entry Form Card */}
        <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Product Code */}
            <div className="sm:col-span-2">
              <label htmlFor="input-product-code" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Product Code / Barcode:
              </label>
              <div className="relative">
                <input
                  id="input-product-code"
                  ref={codeInputRef}
                  type="text"
                  value={productCode}
                  onChange={(e) => setProductCode(e.target.value.toUpperCase())}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. P001, P002..."
                  className="w-full px-3 py-2 text-base font-mono font-semibold uppercase bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                {productCode && products[productCode] && (
                  <span className="absolute right-3 top-2.5 text-xs text-emerald-600 font-medium flex items-center">
                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                    {products[productCode].name}
                  </span>
                )}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label htmlFor="input-quantity" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Quantity:
              </label>
              <input
                id="input-quantity"
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                onKeyDown={handleKeyDown}
                className="w-full px-3 py-2 text-base font-mono font-semibold text-center bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Active Product Info preview if matched */}
          {productCode && products[productCode] && (
            <div className="bg-emerald-50 border border-emerald-200 rounded p-2 text-xs flex items-center justify-between text-emerald-900">
              <span className="font-semibold">{products[productCode].name}</span>
              <div className="space-x-3">
                <span>
                  Price: <strong className="font-mono">{formatPKR(products[productCode].price)}</strong>
                </span>
                <span>
                  Available Stock:{' '}
                  <strong className={`font-mono ${products[productCode].stock <= 5 ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {products[productCode].stock} units
                  </strong>
                </span>
              </div>
            </div>
          )}

          {/* Messages */}
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs px-3 py-2 rounded flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3 py-2 rounded flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Buttons matching original Tkinter: ADD TO CART & CLEAR */}
          <div className="flex items-center space-x-3 pt-1">
            <button
              id="btn-add-to-cart"
              type="button"
              onClick={handleAdd}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-2.5 px-4 rounded-md shadow-sm transition flex items-center justify-center space-x-2 text-sm uppercase tracking-wide cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Cart (Enter)</span>
            </button>

            <button
              id="btn-clear-entry"
              type="button"
              onClick={handleClear}
              className="bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-semibold py-2.5 px-4 rounded-md shadow-sm transition flex items-center justify-center space-x-1 text-sm uppercase tracking-wide cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Product Catalog / Available Products Table */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs flex-1 flex flex-col overflow-hidden">
          {/* Subheader & Search */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-slate-700" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Available Products ({filteredProducts.length})
              </span>
            </div>

            <div className="relative w-48 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                id="input-search-products"
                type="text"
                placeholder="Search by code or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-y-auto flex-1 max-h-[360px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 text-slate-600 font-semibold uppercase tracking-wider sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3 w-16">Code</th>
                  <th className="py-2 px-3">Product Name</th>
                  <th className="py-2 px-3 text-right w-24">Price (PKR)</th>
                  <th className="py-2 px-3 text-center w-24">Stock</th>
                  <th className="py-2 px-3 text-center w-16">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No products found matching "{searchQuery}"
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const isOutOfStock = product.stock <= 0;
                    const isLowStock = product.stock > 0 && product.stock <= 5;
                    const isSelected = productCode === product.code;

                    return (
                      <tr
                        key={product.code}
                        onClick={() => handleSelectProduct(product.code)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-emerald-50/80 font-medium'
                            : 'hover:bg-slate-50'
                        } ${isOutOfStock ? 'opacity-60 bg-slate-50/50' : ''}`}
                      >
                        <td className="py-2 px-3 font-mono font-bold text-slate-800">
                          {product.code}
                        </td>
                        <td className="py-2 px-3 text-slate-900 font-medium">
                          {product.name}
                          {product.category && (
                            <span className="block text-[10px] text-slate-400 font-normal">
                              {product.category}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-semibold text-slate-800">
                          {formatPKR(product.price)}
                        </td>
                        <td className="py-2 px-3 text-center font-mono">
                          {isOutOfStock ? (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                              Out of stock
                            </span>
                          ) : isLowStock ? (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">
                              {product.stock} left
                            </span>
                          ) : (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800">
                              {product.stock} in stock
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            disabled={isOutOfStock}
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddToCart(product.code, 1);
                              setSuccessMessage(`Added 1x ${product.name}`);
                              setTimeout(() => setSuccessMessage(null), 2000);
                            }}
                            className={`p-1 rounded transition ${
                              isOutOfStock
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-emerald-700 hover:bg-emerald-100'
                            }`}
                            title="Quick add 1 unit to cart"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer of panel: Manage Products button matching Python Tkinter */}
          <div className="p-2.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Double click or select row to autofill code
            </span>
            <button
              id="btn-manage-products-inline"
              type="button"
              onClick={onOpenProductMgmt}
              className="text-xs font-semibold px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-800 text-white transition flex items-center space-x-1 cursor-pointer"
            >
              <Package className="w-3.5 h-3.5" />
              <span>Manage Products & Stock</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
