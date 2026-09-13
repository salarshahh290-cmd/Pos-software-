import React, { useState, useMemo } from 'react';
import { 
  X, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Receipt, 
  Package, 
  Download, 
  BarChart3, 
  PieChart as PieIcon,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { Invoice } from '../types';
import { formatPKR, formatNumber, formatDatePK, formatShortDatePK } from '../utils/formatters';

interface SalesSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: Invoice[];
  onSeedSampleInvoices?: () => void;
}

type DatePreset = 'today' | '7days' | 'month' | '30days' | 'all' | 'custom';

const COLORS = ['#059669', '#2563eb', '#d97706', '#9333ea', '#dc2626', '#0891b2', '#4f46e5', '#ea580c'];

export const SalesSummaryModal: React.FC<SalesSummaryModalProps> = ({
  isOpen,
  onClose,
  invoices,
  onSeedSampleInvoices,
}) => {
  const [preset, setPreset] = useState<DatePreset>('30days');
  const [metricView, setMetricView] = useState<'revenue' | 'units'>('revenue');

  // Today's date in YYYY-MM-DD
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Default custom range: last 30 days
  const thirtyDaysAgoStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  }, []);

  const [customStartDate, setCustomStartDate] = useState<string>(thirtyDaysAgoStr);
  const [customEndDate, setCustomEndDate] = useState<string>(todayStr);

  // Compute active date filter boundaries
  const { startBoundary, endBoundary, rangeLabel } = useMemo(() => {
    const now = new Date();
    let start = new Date(0); // Epoch start
    let end = new Date();
    end.setHours(23, 59, 59, 999);

    let label = 'All Recorded Sales';

    if (preset === 'today') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      label = `Today (${formatShortDatePK(start)})`;
    } else if (preset === '7days') {
      start = new Date();
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      label = `Last 7 Days (${formatShortDatePK(start)} to ${formatShortDatePK(end)})`;
    } else if (preset === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      label = `This Month (${formatShortDatePK(start)} to ${formatShortDatePK(end)})`;
    } else if (preset === '30days') {
      start = new Date();
      start.setDate(now.getDate() - 30);
      start.setHours(0, 0, 0, 0);
      label = `Last 30 Days (${formatShortDatePK(start)} to ${formatShortDatePK(end)})`;
    } else if (preset === 'custom') {
      if (customStartDate) {
        start = new Date(customStartDate);
        start.setHours(0, 0, 0, 0);
      }
      if (customEndDate) {
        end = new Date(customEndDate);
        end.setHours(23, 59, 59, 999);
      }
      label = `Custom Range (${formatShortDatePK(start)} to ${formatShortDatePK(end)})`;
    }

    return { startBoundary: start, endBoundary: end, rangeLabel: label };
  }, [preset, customStartDate, customEndDate]);

  // Filter invoices by selected date range
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const invDate = new Date(inv.date);
      return invDate >= startBoundary && invDate <= endBoundary;
    });
  }, [invoices, startBoundary, endBoundary]);

  // Aggregate Metrics
  const summaryMetrics = useMemo(() => {
    let totalRevenue = 0;
    let totalTax = 0;
    let totalDiscount = 0;
    let totalUnits = 0;

    const productSalesMap: Record<
      string,
      { code: string; name: string; units: number; revenue: number }
    > = {};

    const paymentMap: Record<string, number> = {};

    filteredInvoices.forEach((inv) => {
      totalRevenue += inv.total;
      totalTax += inv.taxAmount;
      totalDiscount += inv.discount || 0;

      // Payment distribution
      const method = inv.paymentMethod || 'Cash';
      paymentMap[method] = (paymentMap[method] || 0) + inv.total;

      // Products breakdown
      inv.items.forEach((item) => {
        totalUnits += item.qty;
        if (!productSalesMap[item.code]) {
          productSalesMap[item.code] = {
            code: item.code,
            name: item.name,
            units: 0,
            revenue: 0,
          };
        }
        productSalesMap[item.code].units += item.qty;
        productSalesMap[item.code].revenue += item.total;
      });
    });

    const topProductsList = Object.values(productSalesMap).sort((a, b) =>
      metricView === 'revenue' ? b.revenue - a.revenue : b.units - a.units
    );

    const paymentChartData = Object.entries(paymentMap).map(([name, value]) => ({
      name,
      value,
    }));

    const avgOrderValue = filteredInvoices.length > 0 ? totalRevenue / filteredInvoices.length : 0;

    return {
      totalRevenue,
      totalTax,
      totalDiscount,
      totalUnits,
      invoicesCount: filteredInvoices.length,
      avgOrderValue,
      topProductsList,
      paymentChartData,
    };
  }, [filteredInvoices, metricView]);

  if (!isOpen) return null;

  // Chart top 7 products data
  const topProductsChartData = summaryMetrics.topProductsList.slice(0, 7).map((p) => ({
    name: p.name.length > 15 ? p.name.slice(0, 14) + '…' : p.name,
    fullName: p.name,
    code: p.code,
    revenue: p.revenue,
    units: p.units,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-slate-50 w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-300 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base tracking-tight">Sales & Revenue Summary</h2>
              <p className="text-xs text-slate-400">
                Regional PKR Analytics • Tax Collection • Top Selling Products
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Date Filter Toolbar */}
        <div className="bg-white p-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          {/* Preset Buttons */}
          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
            <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1" />
              Period:
            </span>
            {(
              [
                { id: 'today', label: 'Today' },
                { id: '7days', label: 'Last 7 Days' },
                { id: 'month', label: 'This Month' },
                { id: '30days', label: 'Last 30 Days' },
                { id: 'all', label: 'All Time' },
                { id: 'custom', label: 'Custom' },
              ] as { id: DatePreset; label: string }[]
            ).map((p) => {
              const active = preset === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPreset(p.id)}
                  className={`text-xs px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                    active
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Custom Date Pickers if 'custom' is active */}
          {preset === 'custom' && (
            <div className="flex items-center space-x-2 text-xs bg-slate-50 p-1.5 rounded-md border border-slate-200">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-2 py-1 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-2 py-1 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>
          )}

          {/* Range description label */}
          <div className="text-xs text-emerald-800 font-medium bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
            {rangeLabel}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-5">
          {/* Key Summary KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Total Revenue */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
                <div className="p-1.5 rounded bg-emerald-100 text-emerald-700">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-bold font-mono text-emerald-700 tracking-tight">
                {formatPKR(summaryMetrics.totalRevenue)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Net sales including applicable sales tax
              </div>
            </div>

            {/* Total Tax Collected */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider">Tax Collected</span>
                <div className="p-1.5 rounded bg-blue-100 text-blue-700">
                  <Receipt className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-bold font-mono text-blue-700 tracking-tight">
                {formatPKR(summaryMetrics.totalTax)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                5% Sales Tax (GST) collected in PKR
              </div>
            </div>

            {/* Invoices Count & AOV */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Invoices</span>
                <div className="p-1.5 rounded bg-purple-100 text-purple-700">
                  <Receipt className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 tracking-tight">
                {summaryMetrics.invoicesCount} <span className="text-xs font-normal text-slate-500">bills</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Avg Order: <strong className="font-mono text-slate-800">{formatPKR(summaryMetrics.avgOrderValue)}</strong>
              </div>
            </div>

            {/* Units Sold */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider">Units Sold</span>
                <div className="p-1.5 rounded bg-amber-100 text-amber-700">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 tracking-tight">
                {summaryMetrics.totalUnits} <span className="text-xs font-normal text-slate-500">items</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Across all product categories
              </div>
            </div>
          </div>

          {/* Empty state prompt if no invoices in selected range */}
          {filteredInvoices.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3">
              <BarChart3 className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-700">No Sales Invoices in Selected Range</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No invoices were generated between the selected dates ({rangeLabel}). Create a new checkout invoice on the POS terminal or seed sample transactions to visualize the analytics charts.
              </p>
              {onSeedSampleInvoices && (
                <button
                  type="button"
                  onClick={onSeedSampleInvoices}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Load Sample Sales Data for Visualization</span>
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Chart 1: Top-Selling Products (Bar Chart) - 7 cols */}
                <div className="lg:col-span-7 bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="w-4 h-4 text-emerald-600" />
                      <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                        Top-Selling Products
                      </h3>
                    </div>

                    {/* Metric Toggle: By Revenue or By Units */}
                    <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded text-[11px]">
                      <button
                        type="button"
                        onClick={() => setMetricView('revenue')}
                        className={`px-2.5 py-1 rounded font-medium transition cursor-pointer ${
                          metricView === 'revenue'
                            ? 'bg-white text-emerald-700 shadow-2xs font-semibold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Revenue (PKR)
                      </button>
                      <button
                        type="button"
                        onClick={() => setMetricView('units')}
                        className={`px-2.5 py-1 rounded font-medium transition cursor-pointer ${
                          metricView === 'units'
                            ? 'bg-white text-emerald-700 shadow-2xs font-semibold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Units Sold
                      </button>
                    </div>
                  </div>

                  {/* Recharts Bar Chart */}
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={topProductsChartData}
                        margin={{ top: 10, right: 10, left: 15, bottom: 25 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 10, fill: '#64748b' }}
                          interval={0}
                          angle={-20}
                          textAnchor="end"
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: '#64748b' }}
                          tickFormatter={(val) =>
                            metricView === 'revenue' ? `Rs. ${val}` : `${val}`
                          }
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-xl text-xs font-sans border border-slate-700">
                                  <div className="font-bold text-slate-100 mb-1">{data.fullName}</div>
                                  <div className="text-slate-300 font-mono">Code: {data.code}</div>
                                  <div className="text-emerald-400 font-mono font-semibold mt-1">
                                    Revenue: {formatPKR(data.revenue)}
                                  </div>
                                  <div className="text-slate-300 font-mono">
                                    Units Sold: {data.units}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar
                          dataKey={metricView === 'revenue' ? 'revenue' : 'units'}
                          radius={[4, 4, 0, 0]}
                        >
                          {topProductsChartData.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart 2: Payment Methods Share (Pie Chart) - 5 cols */}
                <div className="lg:col-span-5 bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col">
                  <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-slate-100">
                    <PieIcon className="w-4 h-4 text-purple-600" />
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                      Payment Channels (PKR)
                    </h3>
                  </div>

                  <div className="h-64 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={summaryMetrics.paymentChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {summaryMetrics.paymentChartData.map((_, index) => (
                            <Cell
                              key={`pay-cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0];
                              return (
                                <div className="bg-slate-900 text-white p-2 rounded-lg shadow-xl text-xs font-sans border border-slate-700">
                                  <span className="font-bold text-slate-200">{data.name}: </span>
                                  <span className="font-mono font-semibold text-emerald-400">
                                    {formatPKR(Number(data.value))}
                                  </span>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          iconType="circle"
                          wrapperStyle={{ fontSize: '11px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Ranked Top-Selling Products Detailed Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-3.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center">
                    <TrendingUp className="w-4 h-4 text-emerald-600 mr-1.5" />
                    Product Sales Leaderboard ({summaryMetrics.topProductsList.length} items sold)
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    Total Volume: {summaryMetrics.totalUnits} units
                  </span>
                </div>

                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 text-slate-600 sticky top-0 border-b border-slate-200 font-semibold uppercase text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3 w-12 text-center">Rank</th>
                        <th className="py-2.5 px-3">Product Name</th>
                        <th className="py-2.5 px-3 w-24 text-center">Code</th>
                        <th className="py-2.5 px-3 w-24 text-center">Units Sold</th>
                        <th className="py-2.5 px-3 w-32 text-right">Revenue (PKR)</th>
                        <th className="py-2.5 px-3 w-36 text-right">Sales Share</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {summaryMetrics.topProductsList.map((product, idx) => {
                        const sharePercent =
                          summaryMetrics.totalRevenue > 0
                            ? ((product.revenue / summaryMetrics.totalRevenue) * 100).toFixed(1)
                            : '0';

                        return (
                          <tr key={product.code} className="hover:bg-slate-50">
                            <td className="py-2 px-3 text-center font-bold text-slate-500">
                              #{idx + 1}
                            </td>
                            <td className="py-2 px-3 font-semibold text-slate-900">
                              {product.name}
                            </td>
                            <td className="py-2 px-3 text-center font-mono text-slate-600">
                              {product.code}
                            </td>
                            <td className="py-2 px-3 text-center font-mono font-bold text-slate-800">
                              {product.units}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">
                              {formatPKR(product.revenue)}
                            </td>
                            <td className="py-2 px-3 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className="bg-emerald-600 h-full rounded-full"
                                    style={{ width: `${Math.min(100, Math.max(5, parseFloat(sharePercent)))}%` }}
                                  />
                                </div>
                                <span className="font-mono text-[11px] text-slate-600 w-10 text-right">
                                  {sharePercent}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Calculated according to Pakistani tax standards (5% GST rate)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-lg transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
