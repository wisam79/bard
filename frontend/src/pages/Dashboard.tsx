import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardStats } from '@/types';
import {
  ShoppingCart, Package, Users, AlertTriangle,
  TrendingUp, Wallet,
  Clock, Activity, ArrowUpRight, Zap, Plus, UserPlus, FileText, CreditCard,
  CheckCircle2, AlertCircle, PackageSearch, CalendarClock, ChevronRight,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { wailsApp } from '@/lib/wails';
import { useAppStore } from '@/store';
import { AnimatedNumber, Sparkline } from '@/components/ui';
import { View } from '@/types';

const generateMockData = () => {
  const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  return days.map((day) => ({
    day,
    sales: Math.floor(Math.random() * 800000) + 100000,
    orders: Math.floor(Math.random() * 40) + 5,
  }));
};

const weeklyData = generateMockData();

const generateSparkData = () => Array.from({ length: 7 }, () => Math.floor(Math.random() * 500000) + 100000);

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-brand-surface/90 dark:bg-[#2d2d30]/90 backdrop-blur-xl border border-brand-border/20 dark:border-white/[0.06] rounded-xl p-4 shadow-2xl text-right">
        <p className="text-[9px] font-bold text-brand-accent/25 dark:text-white/20 mb-1 uppercase tracking-[0.15em]">{label}</p>
        <p className="text-lg font-black text-primary-600 dark:text-primary-400">
          {(payload[0].value).toLocaleString('ar-IQ')}
          <span className="text-[9px] text-brand-accent/15 dark:text-white/15 mr-1 font-bold">د.ع</span>
        </p>
      </div>
    );
  }
  return null;
};

const quickActions = [
  { id: 'sale', label: 'بيع سريع', icon: Zap, shortcut: 'F1', view: 'sales' as View },
  { id: 'product', label: 'منتج جديد', icon: Plus, shortcut: 'F2', view: 'products' as View },
  { id: 'customer', label: 'عميل جديد', icon: UserPlus, shortcut: 'F3', view: 'customers' as View },
  { id: 'inventory', label: 'المخزون', icon: PackageSearch, view: 'inventory' as View },
  { id: 'reports', label: 'التقارير', icon: FileText, view: 'reports' as View },
  { id: 'finance', label: 'المالية', icon: CreditCard, view: 'finance' as View },
];

const Dashboard: React.FC = () => {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');
  const { setActiveView } = useAppStore();

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: () => wailsApp.GetDashboardStats(),
  });

  const sparkData = useMemo(() => ({
    sales: generateSparkData(),
    orders: generateSparkData().map(v => Math.floor(v / 20000)),
    products: generateSparkData().map(v => Math.floor(v / 30000)),
    customers: generateSparkData().map(v => Math.floor(v / 25000)),
    debt: generateSparkData(),
    stock: generateSparkData().map(v => Math.floor(v / 50000)),
  }), []);

  const statCards = [
    {
      label: 'مبيعات اليوم',
      value: stats?.todaySales || 0,
      icon: <ShoppingCart className="w-5 h-5" />,
      iconBg: 'bg-indigo-500/10',
      textColor: 'text-indigo-500',
      suffix: ' د.ع',
      isCurrency: true,
      trend: '+12%',
      sparkData: sparkData.sales,
      sparkColor: '#818cf8',
    },
    {
      label: 'طلبات اليوم',
      value: stats?.todayOrders || 0,
      icon: <TrendingUp className="w-5 h-5" />,
      iconBg: 'bg-emerald-500/10',
      textColor: 'text-emerald-500',
      trend: '+8%',
      sparkData: sparkData.orders,
      sparkColor: '#10b981',
    },
    {
      label: 'المنتجات',
      value: stats?.totalProducts || 0,
      icon: <Package className="w-5 h-5" />,
      iconBg: 'bg-primary-500/10',
      textColor: 'text-primary-500',
      sparkData: sparkData.products,
      sparkColor: '#6366f1',
    },
    {
      label: 'العملاء',
      value: stats?.totalCustomers || 0,
      icon: <Users className="w-5 h-5" />,
      iconBg: 'bg-violet-500/10',
      textColor: 'text-violet-500',
      trend: '+3%',
      sparkData: sparkData.customers,
      sparkColor: '#8b5cf6',
    },
    {
      label: 'الديون',
      value: stats?.totalDebt || 0,
      icon: <Wallet className="w-5 h-5" />,
      iconBg: 'bg-rose-500/10',
      textColor: 'text-rose-500',
      suffix: ' د.ع',
      isCurrency: true,
      sparkData: sparkData.debt,
      sparkColor: '#f43f5e',
    },
    {
      label: 'مخزون حرج',
      value: stats?.lowStockCount || 0,
      icon: <AlertTriangle className="w-5 h-5" />,
      iconBg: 'bg-amber-500/10',
      textColor: 'text-amber-500',
      sparkData: sparkData.stock,
      sparkColor: '#f59e0b',
    },
  ];

  const alerts = useMemo(() => {
    const list = [];
    if ((stats?.lowStockCount || 0) > 0) list.push({ type: 'stock', count: stats?.lowStockCount || 0, label: 'منتجات منخفضة المخزون', view: 'inventory' as View, priority: 'high' });
    if ((stats?.totalDebt || 0) > 0) list.push({ type: 'debt', count: Math.min(Math.floor((stats?.totalDebt || 0) / 50000), 99), label: 'ديون مستحقة', view: 'customers' as View, priority: 'critical' });
    return list.sort((x, _y) => (x.priority === 'critical' ? -1 : 1));
  }, [stats]);

  return (
    <div className="p-6 h-full flex flex-col gap-5 relative overflow-hidden animate-fade-in" data-testid="page-dashboard">
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-primary-500 rounded-full" />
          <div>
            <h1 className="text-2xl font-black text-brand-accent tracking-tight">نظرة عامة</h1>
            <p className="text-[10px] text-brand-accent/20 dark:text-white/15 font-medium">ملخص أداء المتجر</p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-brand-surface/30 dark:bg-white/[0.03] p-1 rounded-xl border border-brand-border/15 dark:border-white/[0.05] backdrop-blur-xl">
          {(['day', 'week', 'month'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-[10px] font-bold transition-all duration-300 uppercase tracking-[0.1em] ${
                period === p
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                  : 'text-brand-accent/25 dark:text-white/20 hover:text-brand-accent dark:hover:text-white/50'
              }`}
            >
              {p === 'day' ? 'اليوم' : p === 'week' ? 'الأسبوع' : 'الشهر'}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/[0.03] via-transparent to-primary-500/[0.03] rounded-2xl" />
        <div className="relative bg-brand-surface/20 dark:bg-white/[0.02] border border-brand-border/15 dark:border-white/[0.05] rounded-2xl p-2 backdrop-blur-xl">
          <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary-500/15 to-transparent" />
          <div className="grid grid-cols-6 gap-2">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => setActiveView(action.view)}
                className="relative group flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-brand-dark/20 dark:bg-white/[0.02] border border-brand-border/20 dark:border-white/[0.04] hover:border-primary-500/30 hover:bg-primary-500/[0.06] active:scale-[0.97] transition-all duration-200"
              >
                <div className="relative p-3 rounded-xl bg-primary-500/[0.08] border border-primary-500/15 group-hover:bg-primary-500/15 group-hover:border-primary-500/25 group-hover:shadow-lg group-hover:shadow-primary-500/10 transition-all duration-200">
                  <action.icon size={24} className="text-primary-500" strokeWidth={1.5} />
                </div>
                <span className="text-[10px] font-bold text-brand-accent/30 dark:text-white/20 group-hover:text-primary-500 transition-colors">
                  {action.label}
                </span>
                {action.shortcut && (
                  <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-brand-surface/30 dark:bg-white/[0.04] border border-brand-border/20 dark:border-white/[0.06] opacity-40 group-hover:opacity-100 transition-opacity">
                    <span className="text-[8px] font-mono font-bold text-brand-accent/25 dark:text-white/15">{action.shortcut}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 bg-brand-surface/15 dark:bg-white/[0.02] animate-pulse rounded-2xl border border-brand-border/10 dark:border-white/[0.03]" />
            ))
          : statCards.map((card, index) => (
              <div
                key={index}
                className="group stat-card premium-shine cursor-pointer"
                style={{ animationDelay: `${index * 80}ms` }}
                onClick={() => {
                  const views: View[] = ['sales', 'sales', 'products', 'customers', 'finance', 'inventory'];
                  setActiveView(views[index]);
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className={`w-8 h-8 rounded-xl ${card.iconBg} flex items-center justify-center ${card.textColor} border border-white/5 dark:border-white/[0.05]`}>
                    {card.icon}
                  </div>
                  <div className="flex items-center gap-1">
                    {card.trend && (
                      <span className="flex items-center gap-0.5 text-emerald-500 text-[9px] font-bold">
                        <ArrowUpRight size={9} />
                        {card.trend}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-[9px] font-bold text-brand-accent/25 dark:text-white/15 uppercase tracking-[0.15em] mb-1">{card.label}</p>
                <div className="flex items-end justify-between">
                  <p className="text-xl font-black text-brand-accent dark:text-white truncate">
                    {card.isCurrency
                      ? <AnimatedNumber value={card.value as number} />
                      : <AnimatedNumber value={card.value as number} />
                    }
                    {card.suffix && <span className="text-[9px] text-brand-accent/15 dark:text-white/10 mr-1 font-bold">{card.suffix}</span>}
                  </p>
                  <Sparkline data={card.sparkData} width={60} height={24} color={card.sparkColor} showFill={true} strokeWidth={1.5} />
                </div>
              </div>
            ))}
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-5 min-h-0">
        <div className="xl:col-span-2 bg-brand-surface/20 dark:bg-white/[0.02] backdrop-blur-xl border border-brand-border/15 dark:border-white/[0.05] rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500">
                <Activity size={18} />
              </div>
              <div>
                <h3 className="text-lg font-black text-brand-accent dark:text-white">تحليلات الأداء</h3>
                <p className="text-[9px] text-brand-accent/20 dark:text-white/10 font-medium">تتبع الإيرادات والطلبات</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[9px] text-brand-accent/20 dark:text-white/15 font-bold uppercase tracking-[0.1em] bg-brand-border/8 dark:bg-white/[0.03] px-3 py-1.5 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
              الإيرادات
            </div>
          </div>

          <div className="flex-1 min-h-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.015)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: 'rgb(var(--brand-accent) / 0.15)', fontSize: 9, fontWeight: 800 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fill: 'rgb(var(--brand-accent) / 0.12)', fontSize: 8, fontWeight: 800 }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : `${(v/1000).toFixed(0)}K`} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(99,102,241,0.08)', strokeWidth: 2 }} />
                <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={2.5} fill="url(#salesGradient)" dot={{ fill: '#6366f1', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: '#fff', stroke: '#6366f1', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-4 min-h-0">
          <div className="bg-brand-surface/20 dark:bg-white/[0.02] backdrop-blur-xl border border-brand-border/15 dark:border-white/[0.05] rounded-2xl p-5 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-brand-accent dark:text-white flex items-center gap-2">
                <AlertCircle size={16} className="text-amber-500" />
                التنبيهات
              </h3>
              {alerts.length > 0 && (
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold">
                  {alerts.length}
                </span>
              )}
            </div>
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-2">
                  <CheckCircle2 size={20} className="text-emerald-500" />
                </div>
                <p className="text-xs font-bold text-brand-accent dark:text-white">كل شيء على ما يرام</p>
              </div>
            ) : (
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <button
                    key={alert.type}
                    onClick={() => setActiveView(alert.view)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-right group ${alert.priority === 'critical' ? 'bg-red-500/5 border-red-500/15 hover:border-red-500/30' : 'bg-brand-surface/15 dark:bg-white/[0.02] border-brand-border/15 dark:border-white/[0.04] hover:border-primary-500/30'}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${alert.type === 'stock' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'}`}>
                        {alert.type === 'stock' ? <PackageSearch size={14} /> : <CalendarClock size={14} />}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-brand-accent dark:text-white/80">{alert.label}</p>
                        <p className="text-[9px] text-brand-accent/20 dark:text-white/15">
                          <span className="font-mono font-bold text-primary-500">{alert.count}</span> حالة
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={12} className="text-brand-accent/15 dark:text-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-brand-surface/20 dark:bg-white/[0.02] backdrop-blur-xl border border-brand-border/15 dark:border-white/[0.05] rounded-2xl p-5 shadow-sm flex flex-col flex-1 min-h-0">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-primary-500/[0.08] flex items-center justify-center">
                <Clock size={14} className="text-primary-500/50" />
              </div>
              <h3 className="text-sm font-bold text-brand-accent dark:text-white">العمليات الأخيرة</h3>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto pr-1">
              {stats?.recentSales?.slice(0, 6).map((sale) => (
                <div
                  key={sale.id}
                  className="group flex items-center justify-between p-2.5 bg-brand-surface/15 dark:bg-white/[0.02] rounded-xl border border-brand-border/10 dark:border-white/[0.03] hover:border-primary-500/20 dark:hover:border-primary-500/15 transition-all duration-300"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary-500/[0.06] dark:bg-primary-500/10 flex items-center justify-center text-[8px] font-black text-primary-500/30">
                      {sale.id.slice(-3)}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-brand-accent dark:text-white/70 leading-none mb-0.5 group-hover:text-primary-500 transition-colors">
                        {sale.customer || 'عميل نقدي'}
                      </p>
                      <p className="text-[8px] text-brand-accent/15 dark:text-white/10 font-semibold">{sale.date}</p>
                    </div>
                  </div>
                  <p className="text-[10px] font-black text-brand-accent dark:text-white/60">
                    {sale.total.toLocaleString('ar-IQ')}
                    <span className="text-[7px] text-brand-accent/10 dark:text-white/10 font-bold mr-1">د.ع</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
