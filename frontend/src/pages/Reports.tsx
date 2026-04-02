import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardStats, TopProduct, Sale } from '@/types';
import {
  BarChart3, TrendingUp, Package, PieChart,
  Download, ArrowUpRight, Target, Clock, ShoppingCart,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
  PieChart as RechartsPie, Pie, Cell, Legend,
} from 'recharts';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';

// ─── Colour palette for pie chart ─────────────────────────────────────────────
const PIE_COLORS = ['#f59e0b', '#3b82f6', '#22c55e', '#a855f7', '#ef4444'];

// ─── Mock trend data ──────────────────────────────────────────────────────────
const generateTrendData = (months = 6) =>
  Array.from({ length: months }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (months - 1 - i));
    return {
      month: d.toLocaleString('ar-IQ', { month: 'short' }),
      revenue: Math.floor(Math.random() * 3000000) + 500000,
      profit: Math.floor(Math.random() * 1000000) + 100000,
    };
  });

const trendData = generateTrendData();

// ─── Custom Tooltip ──────────────────────────────────────────────────────────
interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}
const RevenueTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-brand-surface border border-brand-border/50 rounded-2xl p-4 shadow-2xl text-right min-w-[150px]">
      <p className="text-xs font-black text-brand-accent/50 mb-2">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-black mb-0.5" style={{ color: p.color }}>
          {p.value.toLocaleString('ar-IQ')}
          <span className="text-[10px] text-brand-accent/30 mr-1">د.ع</span>
        </p>
      ))}
    </div>
  );
};

// ─── Reports Page ─────────────────────────────────────────────────────────────
const Reports: React.FC = () => {
  const [dateRange, setDateRange] = useState('month');

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: () => window.go.main.App.GetDashboardStats(),
  });

  const { data: recentSales, isLoading: salesLoading } = useQuery<Sale[]>({
    queryKey: ['recentSales', 10],
    queryFn: () => window.go.main.App.GetRecentSales(10),
  });

  // Build pie data from topProducts
  const pieData = (stats?.topProducts || []).map((p: TopProduct) => ({
    name: p.name,
    value: p.totalAmount,
  }));

  return (
    <div className="p-6 h-full flex flex-col gap-6 relative bg-brand-dark/20 overflow-auto custom-scrollbar" dir="rtl">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black dark:text-white text-gray-900 tracking-tight flex items-center gap-3">
            <BarChart3 className="text-primary-400" />
            التقارير والتحليلات الذكية
          </h1>
          <p className="text-brand-accent/50 font-medium mt-1">
            رؤية شاملة لأداء متجرك ومؤشرات النمو
          </p>
        </div>
        <div className="flex gap-3 bg-brand-surface p-1 rounded-2xl border border-brand-border/30 shadow-lg">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-transparent text-sm font-black dark:text-white text-gray-900 px-4 py-2 outline-none cursor-pointer"
          >
            <option value="today">اليوم</option>
            <option value="week">هذا الأسبوع</option>
            <option value="month">هذا الشهر</option>
            <option value="year">هذا العام</option>
          </select>
          <button className="btn-primary flex items-center gap-2 px-4 shadow-none text-sm">
            <Download size={16} />
            تصدير PDF
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="stat-card" />)
          : [
              {
                label: 'إيرادات الفترة',
                value: (stats?.monthSales || 0).toLocaleString('ar-IQ'),
                suffix: 'د.ع',
                icon: <TrendingUp size={22} />,
                color: 'text-green-400',
                bg: 'bg-green-500/10',
                border: 'border-green-500/20',
                change: '+15%',
                positive: true,
              },
              {
                label: 'عدد المبيعات',
                value: stats?.monthOrders || 0,
                suffix: 'عملية',
                icon: <ShoppingCart size={22} />,
                color: 'text-blue-400',
                bg: 'bg-blue-500/10',
                border: 'border-blue-500/20',
                change: '85% من الهدف',
                positive: true,
              },
              {
                label: 'إجمالي الديون',
                value: (stats?.totalDebt || 0).toLocaleString('ar-IQ'),
                suffix: 'د.ع',
                icon: <Target size={22} />,
                color: 'text-red-400',
                bg: 'bg-red-500/10',
                border: 'border-red-500/20',
                change: 'تحت المراقبة',
                positive: false,
              },
              {
                label: 'تنبيهات المخزون',
                value: stats?.lowStockCount || 0,
                suffix: 'صنف',
                icon: <Package size={22} />,
                color: 'text-yellow-400',
                bg: 'bg-yellow-500/10',
                border: 'border-yellow-500/20',
                change: 'تحتاج تجديد',
                positive: false,
              },
            ].map((card, i) => (
              <div
                key={i}
                className="bg-brand-surface border border-brand-border/30 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-primary-500/30 transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-11 h-11 rounded-2xl ${card.bg} flex items-center justify-center ${card.color} border ${card.border} group-hover:scale-110 transition-transform`}
                  >
                    {card.icon}
                  </div>
                  <p className="text-xs font-bold text-brand-accent/40 uppercase tracking-widest">
                    {card.label}
                  </p>
                </div>
                <p className="text-2xl font-black dark:text-white text-gray-900">
                  {card.value}{' '}
                  <span className="text-xs opacity-30">{card.suffix}</span>
                </p>
                <div
                  className={`flex items-center gap-1 mt-2 text-xs font-bold ${
                    card.positive ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  <ArrowUpRight size={12} />
                  {card.change}
                </div>
              </div>
            ))}
      </div>

      {/* ── Revenue Trend ── */}
      <div className="bg-brand-surface border border-brand-border/30 rounded-3xl p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black dark:text-white text-gray-900 flex items-center gap-3">
            <TrendingUp className="text-primary-400" />
            مسار الإيرادات والأرباح (آخر 6 أشهر)
          </h3>
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 rounded-full bg-primary-500 inline-block" />
              <span className="text-brand-accent/40">إيرادات</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 rounded-full bg-green-400 inline-block" />
              <span className="text-brand-accent/40">أرباح</span>
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={trendData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(224,192,151,0.07)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fill: 'rgba(224,192,151,0.4)', fontSize: 12, fontWeight: 700 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'rgba(224,192,151,0.4)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) =>
                v >= 1000000 ? `${(v / 1000000).toFixed(1)}م` : `${(v / 1000).toFixed(0)}ك`
              }
              width={44}
            />
            <Tooltip content={<RevenueTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              name="إيرادات"
              stroke="#f59e0b"
              strokeWidth={2.5}
              fill="url(#revenueGrad)"
              dot={false}
              activeDot={{ r: 5, fill: '#f59e0b', strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="profit"
              name="أرباح"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#profitGrad)"
              dot={false}
              activeDot={{ r: 5, fill: '#22c55e', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Top Products + Sales List ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie + Bar: Top Products */}
        <div className="bg-brand-surface border border-brand-border/30 rounded-3xl p-8 shadow-xl">
          <h3 className="text-xl font-black dark:text-white text-gray-900 flex items-center gap-3 mb-6">
            <PieChart className="text-primary-400" />
            الأصناف الأكثر طلباً
          </h3>

          {isLoading ? (
            <Skeleton variant="card" />
          ) : stats?.topProducts && stats.topProducts.length > 0 ? (
            <>
              {/* Pie Chart */}
              <div className="flex justify-center mb-4">
                <ResponsiveContainer width="100%" height={180}>
                  <RechartsPie>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                          opacity={0.85}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) =>
                        active && payload?.length ? (
                          <div className="bg-brand-surface border border-brand-border/50 rounded-xl p-3 shadow-xl text-right">
                            <p className="text-xs font-black text-brand-accent/60 mb-0.5">
                              {payload[0].name}
                            </p>
                            <p className="text-sm font-black text-primary-400">
                              {(payload[0].value as number).toLocaleString('ar-IQ')} د.ع
                            </p>
                          </div>
                        ) : null
                      }
                    />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>

              {/* List */}
              <div className="space-y-3">
                {stats.topProducts.map((product: TopProduct, index: number) => (
                  <div
                    key={product.productId}
                    className="group flex items-center justify-between p-3 bg-brand-dark/20 rounded-2xl border border-brand-border/20 hover:border-primary-500/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black"
                        style={{ background: PIE_COLORS[index % PIE_COLORS.length] }}
                      >
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-bold dark:text-white text-gray-900 group-hover:text-primary-400 transition-colors">
                          {product.name}
                        </p>
                        <p className="text-[10px] text-brand-accent/40 font-bold">
                          الكمية: {product.totalQty}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-black dark:text-white text-gray-900">
                      {product.totalAmount.toLocaleString('ar-IQ')}
                      <span className="text-[10px] opacity-30 mr-0.5">د.ع</span>
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              icon={Package}
              title="لا توجد بيانات كافية"
              description="ستظهر هنا المنتجات الأكثر مبيعاً بعد إتمام عمليات البيع"
              compact
            />
          )}
        </div>

        {/* Recent Sales Table */}
        <div className="bg-brand-surface border border-brand-border/30 rounded-3xl p-8 shadow-xl flex flex-col">
          <h3 className="text-xl font-black dark:text-white text-gray-900 flex items-center gap-3 mb-6">
            <Clock className="text-primary-400" />
            أحدث الحركات المالية
          </h3>

          <div className="flex-1 space-y-3">
            {salesLoading ? (
              <Skeleton variant="table-row" count={6} />
            ) : recentSales && recentSales.length > 0 ? (
              recentSales.slice(0, 8).map((sale: Sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between p-3 border-b border-brand-border/10 last:border-0 hover:bg-brand-dark/10 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        sale.status === 'return' ? 'bg-red-500' : 'bg-green-500'
                      }`}
                    />
                    <div>
                      <p className="text-sm font-bold dark:text-white text-gray-900 leading-none mb-1">
                        {sale.customer || 'عميل غير مسجل'}
                      </p>
                      <p className="text-[10px] text-brand-accent/40 font-bold">{sale.date}</p>
                    </div>
                  </div>
                  <p
                    className={`text-sm font-black ${
                      sale.status === 'return' ? 'text-red-400' : 'text-primary-400'
                    }`}
                  >
                    {sale.status === 'return' ? '-' : ''}
                    {sale.total.toLocaleString('ar-IQ')} د.ع
                  </p>
                </div>
              ))
            ) : (
              <EmptyState
                icon={ShoppingCart}
                title="لا توجد مبيعات حديثة"
                compact
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Health Indicators ── */}
      <div className="bg-brand-surface border border-brand-border/30 rounded-3xl p-8 shadow-xl">
        <h3 className="text-xl font-black dark:text-white text-gray-900 mb-8 flex items-center gap-3">
          <TrendingUp className="text-primary-400" />
          مؤشرات الصحة التجارية
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} variant="card" />
              ))
            : [
                {
                  label: 'المنتجات النشطة',
                  value: stats?.totalProducts || 0,
                  color: 'text-primary-400',
                  bar: 'bg-primary-500',
                  pct: '80%',
                },
                {
                  label: 'قاعدة العملاء',
                  value: stats?.totalCustomers || 0,
                  color: 'text-blue-400',
                  bar: 'bg-blue-500',
                  pct: '65%',
                },
                {
                  label: 'الديون المعلقة',
                  value: `${(stats?.totalDebt || 0).toLocaleString('ar-IQ')} د.ع`,
                  color: 'text-red-400',
                  bar: 'bg-red-500',
                  pct: '40%',
                },
                {
                  label: 'تنبيهات المخزون',
                  value: stats?.lowStockCount || 0,
                  color: 'text-yellow-400',
                  bar: 'bg-yellow-500',
                  pct: '25%',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-brand-dark/20 p-6 rounded-2xl border border-brand-border/20 hover:border-primary-500/30 transition-all"
                >
                  <p className={`text-2xl font-black ${item.color} mb-1`}>{item.value}</p>
                  <p className="text-[10px] font-black text-brand-accent/40 uppercase tracking-widest mb-3">
                    {item.label}
                  </p>
                  <div className="h-1.5 bg-brand-dark rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.bar} rounded-full transition-all duration-700`}
                      style={{ width: item.pct }}
                    />
                  </div>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;
