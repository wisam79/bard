import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardStats } from '@/types';
import {
  ShoppingCart, Package, Users, AlertTriangle,
  TrendingUp, Wallet,
  Clock, Activity,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { wailsApp } from '@/lib/wails';

// ─── Mock weekly data ─────────────────────────────────────────────────────────
const generateMockData = () => {
  const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  return days.map((day) => ({
    day,
    sales: Math.floor(Math.random() * 800000) + 100000,
    orders: Math.floor(Math.random() * 40) + 5,
  }));
};

const weeklyData = generateMockData();

// ─── Custom Tooltip ────────────────────────────────────────────────────────────
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-brand-surface/90 dark:bg-brand-dark/90 backdrop-blur-xl border border-brand-border/40 rounded-2xl p-4 shadow-2xl text-right">
        <p className="text-[10px] font-black text-brand-accent/40 mb-1 uppercase tracking-widest">{label}</p>
        <p className="text-lg font-black text-primary-600 dark:text-primary-400">
          {(payload[0].value).toLocaleString('ar-IQ')}
          <span className="text-[10px] text-brand-accent/20 mr-1 font-bold">د.ع</span>
        </p>
      </div>
    );
  }
  return null;
};

// ─── Dashboard ─────────────────────────────────────────────────────────────────
const Dashboard: React.FC = () => {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: () => wailsApp.GetDashboardStats(),
  });

  const statCards = [
    {
      label: 'مبيعات اليوم',
      value: stats?.todaySales || 0,
      icon: <ShoppingCart className="w-5 h-5" />,
      color: 'text-indigo-400',
      bg: 'bg-indigo-400/10',
      suffix: ' د.ع',
      isCurrency: true,
    },
    {
      label: 'طلبات اليوم',
      value: stats?.todayOrders || 0,
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
    },
    {
      label: 'المنتجات',
      value: stats?.totalProducts || 0,
      icon: <Package className="w-5 h-5" />,
      color: 'text-primary-400',
      bg: 'bg-primary-400/10',
    },
    {
      label: 'العملاء',
      value: stats?.totalCustomers || 0,
      icon: <Users className="w-5 h-5" />,
      color: 'text-violet-400',
      bg: 'bg-violet-400/10',
    },
    {
      label: 'الديون',
      value: stats?.totalDebt || 0,
      icon: <Wallet className="w-5 h-5" />,
      color: 'text-rose-400',
      bg: 'bg-rose-400/10',
      suffix: ' د.ع',
      isCurrency: true,
    },
    {
      label: 'مخزون حرج',
      value: stats?.lowStockCount || 0,
      icon: <AlertTriangle className="w-5 h-5" />,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
    },
  ];

  return (
    <div className="p-8 h-full flex flex-col gap-8 relative overflow-hidden animate-fade-in" data-testid="page-dashboard">
      {/* Header - Compact */}
      <div className="flex items-center justify-between relative z-10">
        <div>
          <h1 className="text-3xl font-black text-brand-accent tracking-tight flex items-center gap-3">
             <div className="w-1.5 h-8 bg-primary-500 rounded-full" />
             نظرة عامة
          </h1>
        </div>
        
        <div className="flex items-center gap-1 bg-brand-surface/40 dark:bg-brand-dark/40 p-1 rounded-xl border border-brand-border/20 backdrop-blur-md">
          {(['day', 'week', 'month'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-5 py-2 rounded-lg text-[10px] font-black transition-all uppercase tracking-widest ${
                period === p
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                  : 'text-brand-accent/30 hover:text-brand-accent hover:bg-brand-border/10'
              }`}
            >
              {p === 'day' ? 'اليوم' : p === 'week' ? 'الأسبوع' : 'الشهر'}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards - Mini Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 bg-brand-surface/20 dark:bg-brand-dark/20 animate-pulse rounded-2xl border border-brand-border/10" />
            ))
          : statCards.map((card, index) => (
              <div
                key={index}
                className="group relative overflow-hidden bg-brand-surface/40 dark:bg-brand-dark/40 backdrop-blur-xl p-4 rounded-2xl border border-brand-border/20 hover:border-primary-500/30 transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center ${card.color} border border-white/5`}>
                    {card.icon}
                  </div>
                </div>
                <p className="text-[9px] font-black text-brand-accent/30 uppercase tracking-[0.2em] mb-0.5">{card.label}</p>
                <p className="text-lg font-black text-brand-accent truncate">
                  {card.isCurrency ? (card.value as number).toLocaleString('ar-IQ') : card.value}
                  {card.suffix && <span className="text-[9px] text-brand-accent/20 mr-1 font-bold">{card.suffix}</span>}
                </p>
              </div>
            ))}
      </div>

      {/* Main Grid - Chart + Side Panels */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-6 min-h-0">
        {/* Chart Container - Focused */}
        <div className="xl:col-span-2 bg-brand-surface/20 dark:bg-brand-dark/20 backdrop-blur-xl border border-brand-border/20 rounded-[2.5rem] p-8 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-400">
                <Activity size={20} />
              </div>
              <h3 className="text-xl font-black text-brand-accent">تحليلات الأداء</h3>
            </div>
            <div className="flex items-center gap-2 text-[9px] text-brand-accent/30 font-black uppercase tracking-widest bg-brand-border/10 px-3 py-1.5 rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                الإيرادات
            </div>
          </div>

          <div className="flex-1 min-h-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.02)" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  tick={{ fill: 'rgb(var(--brand-accent) / 0.2)', fontSize: 9, fontWeight: 900 }} 
                  axisLine={false} 
                  tickLine={false} 
                  dy={10}
                />
                <YAxis 
                  tick={{ fill: 'rgb(var(--brand-accent) / 0.2)', fontSize: 8, fontWeight: 900 }} 
                  axisLine={false} 
                  tickLine={false}
                  tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : `${(v/1000).toFixed(0)}K`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(99,102,241,0.1)', strokeWidth: 2 }} />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#6366f1" 
                  strokeWidth={3} 
                  fill="url(#salesGradient)" 
                  dot={{ fill: '#6366f1', r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#fff', stroke: '#6366f1', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Panel - Recent Actions */}
        <div className="bg-brand-surface/20 dark:bg-brand-dark/20 backdrop-blur-xl border border-brand-border/20 rounded-[2.5rem] p-8 shadow-sm flex flex-col min-h-0">
          <div className="flex items-center gap-3 mb-6">
            <Clock size={18} className="text-primary-500/50" />
            <h3 className="text-lg font-black text-brand-accent">العمليات الأخيرة</h3>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1">
            {stats?.recentSales?.slice(0, 8).map((sale) => (
              <div
                key={sale.id}
                className="group flex items-center justify-between p-3.5 bg-brand-surface/20 dark:bg-brand-dark/20 rounded-2xl border border-brand-border/10 hover:border-primary-500/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-brand-dark/10 flex items-center justify-center text-[9px] font-black text-primary-500/40">
                    {sale.id.slice(-3)}
                  </div>
                  <div>
                    <p className="text-xs font-black text-brand-accent leading-none mb-1 group-hover:text-primary-400 transition-colors">
                      {sale.customer || 'عميل نقدي'}
                    </p>
                    <p className="text-[9px] text-brand-accent/20 font-bold uppercase">{sale.date}</p>
                  </div>
                </div>
                <p className="text-xs font-black text-brand-accent">
                  {sale.total.toLocaleString('ar-IQ')}
                  <span className="text-[8px] text-brand-accent/20 font-bold mr-1">د.ع</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
