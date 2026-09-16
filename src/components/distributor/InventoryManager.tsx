import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { api } from '../../services/api';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  UploadCloud,
  CheckCircle2,
  X,
  Layers,
  ArrowUpDown,
  Sparkles,
} from 'lucide-react';

export const InventoryManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [restockQty, setRestockQty] = useState<number>(50);
  const [restockNotes, setRestockNotes] = useState('Inbound procurement shipment');
  const [isRestocking, setIsRestocking] = useState(false);
  const [restockFeedback, setRestockFeedback] = useState<string | null>(null);

  // Add Product Form State
  const [newSku, setNewSku] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Beverages');
  const [newUnit, setNewUnit] = useState('Carton');
  const [newPrice, setNewPrice] = useState(500);
  const [newTax, setNewTax] = useState(18);
  const [newStock, setNewStock] = useState(60);
  const [newThreshold, setNewThreshold] = useState(20);
  const [newLocation, setNewLocation] = useState('Bay 1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addError, setAddError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockProduct) return;
    setIsRestocking(true);

    try {
      const res = await api.adjustStock(restockProduct.id, {
        quantity: Number(restockQty),
        mode: 'add',
        notes: restockNotes,
      });

      if (res.pendingBackordersFound > 0) {
        setRestockFeedback(
          `Restocked ${res.product.name} (+${restockQty}). ${res.pendingBackordersFound} pending backorders detected and prioritized for warehouse packing!`
        );
      } else {
        setRestockFeedback(`Successfully added ${restockQty} units to ${res.product.name}.`);
      }

      fetchProducts();
      setTimeout(() => {
        setRestockProduct(null);
        setRestockFeedback(null);
      }, 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRestocking(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    setIsSubmitting(true);

    try {
      await api.createProduct({
        sku: newSku,
        name: newName,
        category: newCategory,
        unit: newUnit,
        price: Number(newPrice),
        taxPercent: Number(newTax),
        stockQty: Number(newStock),
        reorderThreshold: Number(newThreshold),
        warehouseLocation: newLocation,
      });
      setShowAddModal(false);
      resetAddForm();
      fetchProducts();
    } catch (err: any) {
      setAddError(err.message || 'Failed to add product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAddForm = () => {
    setNewSku('');
    setNewName('');
    setNewCategory('Beverages');
    setNewUnit('Carton');
    setNewPrice(500);
    setNewTax(18);
    setNewStock(60);
    setNewThreshold(20);
    setNewLocation('Bay 1');
    setAddError('');
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.warehouseLocation.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesStock =
      stockFilter === 'all' ||
      (stockFilter === 'out' && p.stockQty === 0) ||
      (stockFilter === 'low' && p.stockQty > 0 && p.stockQty <= p.reorderThreshold);
    return matchesSearch && matchesCategory && matchesStock;
  });

  const categories = Array.from(new Set(products.map((p) => p.category)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Catalog & Warehouse Inventory
          </h2>
          <p className="text-xs text-slate-500">
            Live stock counts, threshold alerts, warehouse bay mapping, and automated backorder restocking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New SKU</span>
          </button>
        </div>
      </div>

      {/* Stock Health Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => setStockFilter('all')}
          className={`p-3 rounded-xl border text-left text-xs transition-all ${
            stockFilter === 'all'
              ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
          }`}
        >
          <span className="text-slate-400 block text-[11px]">Total Catalog</span>
          <span className="text-base font-bold text-slate-900 dark:text-white">
            {products.length} Products
          </span>
        </button>

        <button
          onClick={() => setStockFilter('low')}
          className={`p-3 rounded-xl border text-left text-xs transition-all ${
            stockFilter === 'low'
              ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
          }`}
        >
          <span className="text-slate-400 block text-[11px]">Low Stock Threshold</span>
          <span className="text-base font-bold text-amber-600 dark:text-amber-400">
            {products.filter((p) => p.stockQty > 0 && p.stockQty <= p.reorderThreshold).length} SKUs Alerting
          </span>
        </button>

        <button
          onClick={() => setStockFilter('out')}
          className={`p-3 rounded-xl border text-left text-xs transition-all ${
            stockFilter === 'out'
              ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
          }`}
        >
          <span className="text-slate-400 block text-[11px]">Zero Stock (Backorder Mode)</span>
          <span className="text-base font-bold text-rose-600 dark:text-rose-400">
            {products.filter((p) => p.stockQty === 0).length} SKUs Out of Stock
          </span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by SKU, product name, or warehouse bay..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors ${
              categoryFilter === 'all'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                categoryFilter === c
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">SKU / Item Name</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Bay Location</th>
                <th className="py-3 px-4 text-right">Wholesale Price</th>
                <th className="py-3 px-3 text-right">GST %</th>
                <th className="py-3 px-4 text-center">Available Stock</th>
                <th className="py-3 px-3 text-center">Stock Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredProducts.map((p) => {
                const isOut = p.stockQty === 0;
                const isLow = p.stockQty > 0 && p.stockQty <= p.reorderThreshold;

                return (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {p.name}
                      </span>
                      <span className="text-[11px] font-mono text-brand-600 dark:text-brand-400">
                        {p.sku} &bull; Unit: {p.unit}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      {p.category}
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                      {p.warehouseLocation}
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                      ₹{p.price.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-slate-500">
                      {p.taxPercent}%
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`font-bold text-sm ${
                          isOut
                            ? 'text-rose-600 dark:text-rose-400'
                            : isLow
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {p.stockQty}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Min: {p.reorderThreshold}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      {isOut ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800">
                          <AlertTriangle className="w-3 h-3" />
                          Backorder Mode
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800">
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
                          Normal
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setRestockProduct(p);
                          setRestockQty(50);
                          setRestockFeedback(null);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[11px] transition-colors"
                      >
                        <ArrowUpDown className="w-3 h-3" />
                        <span>Restock</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Inventory Modal */}
      {restockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <span className="text-[10px] uppercase font-mono text-brand-600 font-semibold">
                  Warehouse Stock Replenishment
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {restockProduct.name}
                </h3>
              </div>
              <button
                onClick={() => setRestockProduct(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {restockFeedback && (
              <div className="p-3 mb-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs border border-emerald-200 dark:border-emerald-800 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{restockFeedback}</span>
              </div>
            )}

            <form onSubmit={handleRestock} className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 flex justify-between">
                <div>
                  <span className="text-slate-400 text-[11px] block">Current Bay Stock</span>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {restockProduct.stockQty} {restockProduct.unit}s
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[11px] block">Bay Location</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {restockProduct.warehouseLocation}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Quantity Received (Units)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={restockQty}
                  onChange={(e) => setRestockQty(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Shipment / PO Reference Notes
                </label>
                <input
                  type="text"
                  value={restockNotes}
                  onChange={(e) => setRestockNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRestockProduct(null)}
                  className="px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRestocking}
                  className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-xs disabled:opacity-50"
                >
                  {isRestocking ? 'Updating Stock...' : 'Confirm Inbound Restock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-brand-600" />
                Add New Catalog Product
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addError && (
              <div className="p-3 mb-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 text-xs border border-rose-200 dark:border-rose-800">
                {addError}
              </div>
            )}

            <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="BEV-109"
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white uppercase outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  >
                    <option value="Beverages">Beverages</option>
                    <option value="Packaged Foods">Packaged Foods</option>
                    <option value="Personal Care">Personal Care</option>
                    <option value="Household Goods">Household Goods</option>
                    <option value="Dairy & Cold">Dairy & Cold</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Product Name & Variant Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cadbury Dairy Milk Silk (150g Bar x 24)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Unit Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    GST Tax %
                  </label>
                  <input
                    type="number"
                    value={newTax}
                    onChange={(e) => setNewTax(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Packaging Unit
                  </label>
                  <input
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Initial Stock
                  </label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Reorder Min
                  </label>
                  <input
                    type="number"
                    value={newThreshold}
                    onChange={(e) => setNewThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Warehouse Bay
                  </label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Add SKU to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
