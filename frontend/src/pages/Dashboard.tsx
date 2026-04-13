import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { DashboardStats } from '@/types';
import {
  ShoppingCart, Package, Users, AlertTriangle,
  TrendingUp, Wallet,
  Clock, Activity, ArrowUpRight, ArrowDownRight, Zap, Plus, UserPlus, FileText, CreditCard,
  CheckCircle2, AlertCircle, PackageSearch, CalendarClock, ChevronRight, RefreshCw,
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
      <div className="bg-brand-surface/95 dark:bg-[#1a1d33]/95 backdrop-blur-xl border border-brand-border/30 dark:border-white/[0.08] rounded-lg p-3 shadow-xl text-right">
        <p className="text-[10px] font-semibold text-brand-muted/60 dark:text-white/40 mb-1">{label}</p>
        <p className="text-base font-bold text-primary-600 dark:text-primary-400">
          {(payload[0].value).toLocaleString('ar-IQ')}
          <span className="text-[10px] text-brand-muted/40 dark:text-white/30 mr-1">د.ع</span>
        </p>
      </div>
    );
  }
  return null;
};

const quickActions = [
  { id: 'sale', label: 'بيع سريع', icon: Zap, shortcut: 'F1', view: 'sales' as View, color: 'from-emerald-500 to-emerald-600' },
  { id: 'product', label: 'منتج جديد', icon: Plus, shortcut: 'F2', view: 'products' as View, color: 'from-blue-500 to-blue-600' },
  { id: 'customer', label: 'عميل جديد', icon: UserPlus, shortcut: 'F3', view: 'customers' as View, color: 'from-violet-500 to-violet-600' },
  { id: 'inventory', label: 'المخزون', icon: PackageSearch, view: 'inventory' as View, color: 'from-amber-500 to-amber-600' },
  { id: 'reports', label: 'التقارير', icon: FileText, view: 'reports' as View, color: 'from-purple-500 to-purple-600' },
  { id: 'finance', label: 'المالية', icon: CreditCard, view: 'finance' as View, color: 'from-rose-500 to-rose-600' },
];

const Dashboard: React.FC = () => {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');
  const { setActiveView } = useAppStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: stats, isLoading, refetch } = useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: () => wailsApp.GetDashboardStats(),
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

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
      iconBg: 'bg-info-500/10',
      iconColor: 'text-info-500',
      suffix: ' د.ع',
      isCurrency: true,
      trend: '+12%',
      trendUp: true,
      sparkData: sparkData.sales,
      sparkColor: '#3b82f6',
    },
    {
      label: 'طلبات اليوم',
      value: stats?.todayOrders || 0,
      icon: <TrendingUp className="w-5 h-5" />,
      iconBg: 'bg-success-500/10',
      iconColor: 'text-success-500',
      trend: '+8%',
      trendUp: true,
      sparkData: sparkData.orders,
      sparkColor: '#10b981',
    },
    {
      label: 'إجمالي المنتجات',
      value: stats?.totalProducts || 0,
      icon: <Package className="w-5 h-5" />,
      iconBg: 'bg-primary-500/10',
      iconColor: 'text-primary-500',
      sparkData: sparkData.products,
      sparkColor: '#6366f1',
    },
    {
      label: 'إجمالي العملاء',
      value: stats?.totalCustomers || 0,
      icon: <Users className="w-5 h-5" />,
      iconBg: 'bg-violet-500/10',
      iconColor: 'text-violet-500',
      trend: '+3%',
      trendUp: true,
      sparkData: sparkData.customers,
      sparkColor: '#8b5cf6',
    },
    {
      label: 'الديون المستحقة',
      value: stats?.totalDebt || 0,
      icon: <Wallet className="w-5 h-5" />,
      iconBg: 'bg-error-500/10',
      iconColor: 'text-error-500',
      suffix: ' د.ع',
      isCurrency: true,
      trend: '-5%',
      trendUp: false,
      sparkData: sparkData.debt,
      sparkColor: '#f43f5e',
    },
    {
      label: 'مخزون حرج',
      value: stats?.lowStockCount || 0,
      icon: <AlertTriangle className="w-5 h-5" />,
      iconBg: 'bg-warning-500/10',
      iconColor: 'text-warning-500',
      trend: '-2',
      trendUp: true,
      sparkData: sparkData.stock,
      sparkColor: '#f59e0b',
    },
  ];

  const alerts = useMemo(() => {
    const list = [];
    if ((stats?.lowStockCount || 0) > 0) list.push({ type: 'stock', count: stats?.lowStockCount || 0, label: 'منتجات منخفضة المخزون', view: 'inventory' as View, priority: 'high' as const });
    if ((stats?.totalDebt || 0) > 0) list.push({ type: 'debt', count: Math.min(Math.floor((stats?.totalDebt || 0) / 50000), 99), label: 'ديون مستحقة', view: 'customers' as View, priority: 'critical' as const });
    return list.sort((x, _y) => (x.priority === 'critical' ? -1 : 1));
  }, [stats]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="p-6 h-full flex flex-col gap-5 relative overflow-hidden"
      data-testid="page-dashboard"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex items-start justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-12 bg-gradient-to-b from-primary-500 to-violet-500 rounded-full" />
          <div>
            <h1 className="text-2xl font-bold text-brand-accent dark:text-white">لوحة التحكم</h1>
            <p className="text-sm text-brand-muted/60 dark:text-white/50 mt-0.5">
              مرحباً بك في نظام إدارة المبيعات
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Period Selector */}
          <div className="flex items-center gap-1 bg-brand-surface/50 dark:bg-white/[0.06] p-1 rounded-lg border border-brand-border/30 dark:border-white/[0.08] backdrop-blur-xl">
            {(['day', 'week', 'month'] as const).map((p) => (
              <motion.button
                key={p}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-md text-xs font-semibold transition-all uppercase ${
                  period === p
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                    : 'text-brand-muted/60 dark:text-white/40 hover:text-brand-accent dark:hover:text-white/70 hover:bg-brand-border/20 dark:hover:bg-white/[0.06]'
                }`}
              >
                {p === 'day' ? 'اليوم' : p === 'week' ? 'الأسبوع' : 'الشهر'}
              </motion.button>
            ))}
          </div>

          {/* Refresh Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            className="p-2.5 rounded-lg bg-brand-surface/50 dark:bg-white/[0.06] border border-brand-border/30 dark:border-white/[0.08] hover:border-primary-500/30 text-brand-muted/60 dark:text-white/40 hover:text-primary-500 transition-all"
          >
            <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
          </motion.button>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="relative">
        <div className="bg-brand-surface/50 dark:bg-white/[0.05] border border-brand-border/30 dark:border-white/[0.08] rounded-xl p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-brand-accent dark:text-white">إجراءات سريعة</h3>
            <span className="text-[10px] text-brand-muted/50 dark:text-white/30">اختصارات لوحة المفاتيح متاحة</span>
          </div>
          <div className="grid grid-cols-6 gap-3">
            {quickActions.map((action) => (
              <motion.button
                key={action.id}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveView(action.view)}
                className="relative group flex flex-col items-center justify-center gap-2.5 p-4 rounded-lg bg-brand-surface/50 dark:bg-white/[0.04] border border-brand-border/30 dark:border-white/[0.06] hover:border-primary-500/30 hover:shadow-lg hover:shadow-primary-500/10 transition-all"
              >
                <div className={`relative p-3 rounded-lg bg-gradient-to-br ${action.color} text-white shadow-lg`}>
                  <action.icon size={22} strokeWidth={2} />
                </div>
                <span className="text-xs font-semibold text-brand-muted/70 dark:text-white/60 group-hover:text-primary-500 transition-colors">
                  {action.label}
                </span>
                {action.shortcut && (
                  <div className="px-2 py-0.5 rounded bg-brand-surface/70 dark:bg-white/[0.06] border border-brand-border/30 dark:border-white/[0.08]">
                    <span className="text-[9px] font-mono font-semibold text-brand-muted/50 dark:text-white/40">{action.shortcut}</span>
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-36 bg-brand-surface/50 dark:bg-white/[0.05] animate-pulse rounded-lg border border-brand-border/30 dark:border-white/[0.06]" />
            ))
          : statCards.map((card, index) => (
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={index}
                className="group stat-card cursor-pointer"
                onClick={() => {
                  const views: View[] = ['sales', 'sales', 'products', 'customers', 'finance', 'inventory'];
                  setActiveView(views[index]);
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg ${card.iconBg} flex items-center justify-center ${card.iconColor} border border-white/5 dark:border-white/[0.06]`}>
                    {card.icon}
                  </div>
                  <div className="flex items-center gap-1">
                    {card.trend && (
                      <span className={`flex items-center gap-0.5 text-[10px] font-bold ${card.trendUp ? 'text-success-500' : 'text-error-500'}`}>
                        {card.trendUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                        {card.trend}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-[10px] font-semibold text-brand-muted/50 dark:text-white/30 uppercase tracking-wide mb-2">{card.label}</p>
                <div className="flex items-end justify-between">
                  <p className="text-xl font-bold text-brand-accent dark:text-white truncate">
                    {card.isCurrency
                      ? <AnimatedNumber value={card.value as number} />
                      : <AnimatedNumber value={card.value as number} />
                    }
                    {card.suffix && <span className="text-[10px] text-brand-muted/40 dark:text-white/30 mr-1">{card.suffix}</span>}
                  </p>
                  <Sparkline data={card.sparkData} width={60} height={24} color={card.sparkColor} showFill={true} strokeWidth={1.5} />
                </div>
              </motion.div>
            ))}
      </motion.div>

      {/* Charts & Alerts Section */}
      <motion.div variants={itemVariants} className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-5 min-h-0">
        {/* Chart */}
        <div className="xl:col-span-2 bg-brand-surface/50 dark:bg-white/[0.05] backdrop-blur-xl border border-brand-border/30 dark:border-white/[0.08] rounded-xl p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-500">
                <Activity size={18} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-brand-accent dark:text-white">تحليلات الأداء</h3>
                <p className="text-[10px] text-brand-muted/50 dark:text-white/30">تتبع الإيرادات والطلبات</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-brand-muted/60 dark:text-white/40 font-semibold uppercase bg-brand-border/15 dark:bg-white/[0.06] px-3 py-1.5 rounded-md">
              <span className="w-2 h-2 rounded-full bg-primary-500" />
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
                <XAxis dataKey="day" tick={{ fill: 'rgb(var(--brand-accent) / 0.2)', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fill: 'rgb(var(--brand-accent) / 0.15)', fontSize: 9, fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : `${(v/1000).toFixed(0)}K`} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(99,102,241,0.1)', strokeWidth: 2 }} />
                <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={2.5} fill="url(#salesGradient)" dot={{ fill: '#6366f1', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: '#fff', stroke: '#6366f1', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-4 min-h-0">
          {/* Alerts */}
          <div className="bg-brand-surface/50 dark:bg-white/[0.05] backdrop-blur-xl border border-brand-border/30 dark:border-white/[0.08] rounded-xl p-4 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-brand-accent dark:text-white flex items-center gap-2">
                <AlertCircle size={16} className="text-warning-500" />
                التنبيهات
              </h3>
              {alerts.length > 0 && (
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-warning-500/10 text-warning-500 text-[10px] font-bold">
                  {alerts.length}
                </span>
              )}
            </div>
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="w-12 h-12 rounded-full bg-success-500/10 border border-success-500/20 flex items-center justify-center mb-2">
                  <CheckCircle2 size={20} className="text-success-500" />
                </div>
                <p className="text-sm font-semibold text-brand-accent dark:text-white">كل شيء على ما يرام</p>
                <p className="text-[10px] text-brand-muted/50 dark:text-white/30 mt-0.5">لا توجد تنبيهات حالياً</p>
              </div>
            ) : (
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <motion.button
                    key={alert.type}
                    whileHover={{ x: -2 }}
                    onClick={() => setActiveView(alert.view)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all text-right group ${
                      alert.priority === 'critical'
                        ? 'bg-error/5 dark:bg-error/10 border-error/20 dark:border-error/30 hover:border-error/40'
                        : 'bg-warning/5 dark:bg-warning/10 border-warning/20 dark:border-warning/30 hover:border-warning/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-md flex items-center justify-center ${
                        alert.type === 'stock' ? 'bg-warning-500/10 text-warning-500' : 'bg-error-500/10 text-error-500'
                      }`}>
                        {alert.type === 'stock' ? <PackageSearch size={14} /> : <CalendarClock size={14} />}
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-brand-accent dark:text-white/90">{alert.label}</p>
                        <p className="text-[10px] text-brand-muted/50 dark:text-white/40">
                          <span className="font-mono font-semibold text-primary-500">{alert.count}</span> حالة
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={12} className="text-brand-muted/30 dark:text-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-brand-surface/50 dark:bg-white/[0.05] backdrop-blur-xl border border-brand-border/30 dark:border-white/[0.08] rounded-xl p-4 shadow-sm flex flex-col flex-1 min-h-0">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-md bg-primary-500/10 flex items-center justify-center">
                <Clock size={14} className="text-primary-500/60" />
              </div>
              <h3 className="text-sm font-semibold text-brand-accent dark:text-white">العمليات الأخيرة</h3>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto pr-1">
              {stats?.recentSales?.slice(0, 6).map((sale) => (
                <motion.div
                  key={sale.id}
                  whileHover={{ scale: 1.02 }}
                  className="group flex items-center justify-between p-2.5 bg-brand-surface/50 dark:bg-white/[0.04] rounded-lg border border-brand-border/30 dark:border-white/[0.06] hover:border-primary-500/25 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-md bg-primary-500/10 dark:bg-primary-500/15 flex items-center justify-center text-[9px] font-bold text-primary-500/50">
                      {sale.id.slice(-3)}
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-brand-accent dark:text-white/80 leading-none mb-0.5 group-hover:text-primary-500 transition-colors">
                        {sale.customer || 'عميل نقدي'}
                      </p>
                      <p className="text-[9px] text-brand-muted/50 dark:text-white/30">{sale.date}</p>
                    </div>
                  </div>
                  <p className="text-[11px] font-bold text-brand-accent dark:text-white/70">
                    {sale.total.toLocaleString('ar-IQ')}
                    <span className="text-[9px] text-brand-muted/30 dark:text-white/30 mr-1">د.ع</span>
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
