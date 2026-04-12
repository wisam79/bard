import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/store';
import { useAuthStore } from '@/store/authStore';
import { RestaurantTable, KitchenOrder, KitchenStation, KioskLayout, KioskSession, CommissionRule, StaffPerformance } from '@/types';
import { Plus, Edit2, Trash2, Users, Clock, CheckCircle2, XCircle, AlertCircle, LayoutGrid, List, ChefHat, AlertTriangle, Flame, Timer, Monitor, Play, Square, Layout, Trophy, DollarSign, TrendingUp } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { wailsApp } from '@/lib/wails';

const MOCK_TABLES: RestaurantTable[] = [
  { id: '1', number: 1, name: 'طاولة النافذة', seats: 4, status: 'available', floor: 'الطابق الأرضي' },
  { id: '2', number: 2, name: 'طاولة الزاوية', seats: 2, status: 'occupied', floor: 'الطابق الأرضي', currentOrderId: 'ORD-001', assignedWaiter: 'أحمد' },
  { id: '3', number: 3, seats: 6, status: 'reserved', floor: 'الطابق الأرضي', notes: 'حجز الساعة 8 مساءً' },
  { id: '4', number: 4, seats: 4, status: 'cleaning', floor: 'الطابق الأرضي' },
  { id: '5', number: 5, name: 'الطاولة الخاصة', seats: 8, status: 'occupied', floor: 'الطابق العلوي', currentOrderId: 'ORD-002', assignedWaiter: 'سارة' },
  { id: '6', number: 6, seats: 4, status: 'available', floor: 'الطابق العلوي' },
  { id: '7', number: 7, seats: 2, status: 'available', floor: 'الطابق العلوي' },
  { id: '8', number: 8, seats: 10, status: 'reserved', floor: 'الطابق العلوي', notes: 'حفل عائلي' },
  { id: '9', number: 9, name: 'الحنفية', seats: 4, status: 'occupied', floor: 'الطابق الأرضي', currentOrderId: 'ORD-003' },
  { id: '10', number: 10, seats: 2, status: 'available', floor: 'الحديقة' },
  { id: '11', number: 11, seats: 4, status: 'available', floor: 'الحديقة' },
  { id: '12', number: 12, seats: 6, status: 'occupied', floor: 'الحديقة', currentOrderId: 'ORD-004', assignedWaiter: 'محمد' },
];

const STATUS_CONFIG = {
  available: { label: 'متاحة', color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500', icon: CheckCircle2, dotColor: 'bg-emerald-500' },
  occupied: { label: 'مشغولة', color: 'bg-red-500/10 border-red-500/20 text-red-500', icon: XCircle, dotColor: 'bg-red-500' },
  reserved: { label: 'محجوزة', color: 'bg-amber-500/10 border-amber-500/20 text-amber-500', icon: Clock, dotColor: 'bg-amber-500' },
  cleaning: { label: 'تنظيف', color: 'bg-blue-500/10 border-blue-500/20 text-blue-500', icon: AlertCircle, dotColor: 'bg-blue-500' },
};

type OperationsTab = 'tables' | 'kitchen' | 'kiosk' | 'commissions';

const TAB_ITEMS: { id: OperationsTab; label: string; icon: React.ReactNode }[] = [
  { id: 'tables', label: 'الطاولات', icon: <LayoutGrid size={16} /> },
  { id: 'kitchen', label: 'المطبخ', icon: <ChefHat size={16} /> },
  { id: 'kiosk', label: 'الكيوسك', icon: <Monitor size={16} /> },
  { id: 'commissions', label: 'العمولات', icon: <Trophy size={16} /> },
];

const TablesTab: React.FC = () => {
  const { notify } = useAppStore();
  const [tables, setTables] = useState<RestaurantTable[]>(MOCK_TABLES);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterFloor, setFilterFloor] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);
  const [form, setForm] = useState({ number: '', name: '', seats: '4', floor: 'الطابق الأرضي', notes: '' });

  const floors = ['الكل', ...Array.from(new Set(tables.map(t => t.floor)))];

  const filtered = tables.filter(t => {
    if (filterFloor !== 'all' && t.floor !== filterFloor) return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    return true;
  });

  const stats = {
    total: tables.length,
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
  };

  const handleSave = () => {
    const num = parseInt(form.number);
    if (!num || num < 1) { notify('رقم الطاولة مطلوب', 'error'); return; }
    if (editingTable) {
      setTables(prev => prev.map(t => t.id === editingTable.id ? { ...t, number: num, name: form.name, seats: parseInt(form.seats), floor: form.floor, notes: form.notes } : t));
      notify('تم تحديث الطاولة', 'success');
    } else {
      const newTable: RestaurantTable = {
        id: Date.now().toString(),
        number: num,
        name: form.name,
        seats: parseInt(form.seats),
        status: 'available',
        floor: form.floor,
        notes: form.notes,
      };
      setTables(prev => [...prev, newTable]);
      notify('تم إضافة الطاولة', 'success');
    }
    setShowAddModal(false);
    setEditingTable(null);
    setForm({ number: '', name: '', seats: '4', floor: 'الطابق الأرضي', notes: '' });
  };

  const handleDelete = (id: string) => {
    setTables(prev => prev.filter(t => t.id !== id));
    notify('تم حذف الطاولة', 'success');
  };

  const handleStatusChange = (id: string, status: RestaurantTable['status']) => {
    setTables(prev => prev.map(t => t.id === id ? { ...t, status, currentOrderId: status === 'occupied' ? t.currentOrderId || `ORD-${Date.now().toString().slice(-4)}` : undefined } : t));
    notify(`تم تغيير حالة الطاولة`, 'success');
  };

  const openEdit = (table: RestaurantTable) => {
    setEditingTable(table);
    setForm({ number: String(table.number), name: table.name || '', seats: String(table.seats), floor: table.floor || 'الطابق الأرضي', notes: table.notes || '' });
    setShowAddModal(true);
  };

  return (
    <div className="p-6 h-full flex flex-col gap-5 relative overflow-hidden animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-primary-500 rounded-full" />
          <div>
            <h1 className="text-2xl font-black text-brand-accent dark:text-white tracking-tight">إدارة الطاولات</h1>
            <p className="text-[10px] text-brand-accent/20 dark:text-white/10 font-medium">تنظيم طاولات المطعم وإدارة الحجوزات</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-brand-surface/30 dark:bg-white/[0.02] border border-brand-border/15 dark:border-white/[0.05] rounded-xl p-0.5">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'text-brand-accent/25 dark:text-white/15'}`}><LayoutGrid size={16} /></button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'text-brand-accent/25 dark:text-white/15'}`}><List size={16} /></button>
          </div>
          <Button onClick={() => { setEditingTable(null); setForm({ number: '', name: '', seats: '4', floor: 'الطابق الأرضي', notes: '' }); setShowAddModal(true); }} icon={<Plus size={16} />}>إضافة طاولة</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'الإجمالي', value: stats.total, color: 'text-primary-500', bg: 'bg-primary-500/10' },
          { label: 'متاحة', value: stats.available, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'مشغولة', value: stats.occupied, color: 'text-red-500', bg: 'bg-red-500/10' },
          { label: 'محجوزة', value: stats.reserved, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ].map((s, i) => (
          <div key={i} className="stat-card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center ${s.color} font-black text-lg`}>{s.value}</div>
            <span className="text-xs font-bold text-brand-accent/25 dark:text-white/15">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <select value={filterFloor} onChange={e => setFilterFloor(e.target.value)} className="px-3 py-2 bg-brand-surface/40 dark:bg-white/[0.03] border border-brand-border/20 dark:border-white/[0.05] rounded-xl text-xs font-bold text-brand-accent/40 dark:text-white/20 outline-none focus:border-primary-500/40">
          {floors.map(f => <option key={f} value={f === 'الكل' ? 'all' : f}>{f}</option>)}
        </select>
        {(['all', 'available', 'occupied', 'reserved', 'cleaning'] as const).map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${filterStatus === s ? 'bg-primary-500 border-primary-500 text-white' : 'bg-brand-surface/20 dark:bg-white/[0.02] border-brand-border/10 dark:border-white/[0.04] text-brand-accent/25 dark:text-white/15 hover:border-brand-border/30'}`}>
            {s === 'all' ? 'الكل' : STATUS_CONFIG[s].label}
          </button>
        ))}
      </div>

      <div className={`flex-1 overflow-y-auto ${viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 content-start' : 'space-y-2'}`}>
        {filtered.map(table => {
          const cfg = STATUS_CONFIG[table.status];
          const Icon = cfg.icon;
          if (viewMode === 'list') {
            return (
              <div key={table.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all hover:shadow-md ${cfg.color}`}>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${cfg.dotColor}`} />
                    <span className="font-black text-brand-accent dark:text-white">#{table.number}</span>
                    {table.name && <span className="text-xs text-brand-accent/30 dark:text-white/15">({table.name})</span>}
                  </div>
                  <span className="text-xs text-brand-accent/25 dark:text-white/10 flex items-center gap-1"><Users size={12} /> {table.seats}</span>
                  <span className="text-xs text-brand-accent/20 dark:text-white/10">{table.floor}</span>
                  {table.assignedWaiter && <span className="text-xs text-brand-accent/20 dark:text-white/10">الويتر: {table.assignedWaiter}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-lg text-[9px] font-bold border ${cfg.color}`}>{cfg.label}</span>
                  <button onClick={() => openEdit(table)} className="p-1.5 rounded-lg hover:bg-brand-border/20 dark:hover:bg-white/[0.06] text-brand-accent/20 dark:text-white/10 hover:text-primary-500 transition-colors"><Edit2 size={14} /></button>
                </div>
              </div>
            );
          }
          return (
            <div key={table.id} className={`relative p-4 rounded-2xl border-2 transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer group ${cfg.color}`} onClick={() => {
              const next: Record<string, RestaurantTable['status']> = { available: 'occupied', occupied: 'cleaning', cleaning: 'available', reserved: 'occupied' };
              handleStatusChange(table.id, next[table.status]);
            }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${cfg.dotColor} ${table.status === 'occupied' ? 'animate-pulse' : ''}`} />
                  <span className="font-black text-lg text-brand-accent dark:text-white">#{table.number}</span>
                </div>
                <Icon size={16} className="opacity-40" />
              </div>
              {table.name && <p className="text-xs font-bold text-brand-accent/40 dark:text-white/20 mb-2">{table.name}</p>}
              <div className="flex items-center gap-2 text-[10px] text-brand-accent/20 dark:text-white/10 mb-2">
                <Users size={10} /> {table.seats} مقاعد
              </div>
              {table.assignedWaiter && <p className="text-[9px] text-brand-accent/15 dark:text-white/8">الويتر: {table.assignedWaiter}</p>}
              {table.notes && <p className="text-[9px] text-brand-accent/15 dark:text-white/8 truncate mt-1">{table.notes}</p>}
              <div className="absolute bottom-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={e => { e.stopPropagation(); openEdit(table); }} className="p-1 rounded bg-brand-surface/40 dark:bg-white/[0.06] text-brand-accent/30 dark:text-white/15 hover:text-primary-500"><Edit2 size={10} /></button>
                <button onClick={e => { e.stopPropagation(); handleDelete(table.id); }} className="p-1 rounded bg-brand-surface/40 dark:bg-white/[0.06] text-brand-accent/30 dark:text-white/15 hover:text-red-500"><Trash2 size={10} /></button>
              </div>
              <div className="absolute top-2 left-2">
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${cfg.color}`}>{cfg.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setEditingTable(null); }} title={editingTable ? 'تعديل الطاولة' : 'إضافة طاولة جديدة'} size="sm" footer={
        <>
          <Button onClick={() => { setShowAddModal(false); setEditingTable(null); }} variant="secondary">إلغاء</Button>
          <Button onClick={handleSave}>{editingTable ? 'تحديث' : 'إضافة'}</Button>
        </>
      }>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-brand-accent/30 dark:text-white/15 uppercase tracking-[0.1em]">رقم الطاولة *</label>
              <input type="number" value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} className="input py-2.5 text-center font-bold" min="1" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-brand-accent/30 dark:text-white/15 uppercase tracking-[0.1em]">عدد المقاعد</label>
              <input type="number" value={form.seats} onChange={e => setForm({ ...form, seats: e.target.value })} className="input py-2.5 text-center" min="1" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-brand-accent/30 dark:text-white/15 uppercase tracking-[0.1em]">اسم الطاولة (اختياري)</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input py-2.5" placeholder="مثال: طاولة النافذة" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-brand-accent/30 dark:text-white/15 uppercase tracking-[0.1em]">الطابق / المنطقة</label>
            <select value={form.floor} onChange={e => setForm({ ...form, floor: e.target.value })} className="input py-2.5">
              <option>الطابق الأرضي</option>
              <option>الطابق العلوي</option>
              <option>الحديقة</option>
              <option>الشرفة</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-brand-accent/30 dark:text-white/15 uppercase tracking-[0.1em]">ملاحظات</label>
            <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="input py-2.5" placeholder="ملاحظات إضافية..." />
          </div>
        </div>
      </Modal>
    </div>
  );
};

const KitchenTab: React.FC = () => {
  const { notify } = useAppStore();
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const { data: initialOrders, refetch } = useQuery<KitchenOrder[]>({
    queryKey: ['kitchenOrders'],
    queryFn: () => wailsApp.GetKitchenOrders(),
    refetchInterval: 5000,
  });

  const { data: stations } = useQuery<KitchenStation[]>({
    queryKey: ['kitchenStations'],
    queryFn: () => wailsApp.GetKitchenStations(),
  });

  useEffect(() => {
    if (initialOrders) setOrders(initialOrders);
  }, [initialOrders]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-500/10';
      case 'high': return 'border-amber-500 bg-amber-500/10';
      default: return 'border-brand-border/20 bg-brand-surface';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'high': return <Flame className="w-4 h-4 text-amber-400" />;
      default: return <Clock className="w-4 h-4 text-brand-accent/40" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'preparing': return 'bg-blue-500/20 text-blue-400';
      case 'completed': return 'bg-emerald-500/20 text-emerald-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      default: return 'bg-brand-accent/20 text-brand-accent';
    }
  };

  const getElapsedColor = (min: number) => {
    if (min > 30) return 'text-red-400';
    if (min > 15) return 'text-amber-400';
    return 'text-emerald-400';
  };

  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const preparingCount = orders.filter(o => o.status === 'preparing').length;

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">شاشة المطبخ</h1>
            <p className="text-sm text-brand-accent/50">إدارة طلبات المطبخ</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-yellow-500/10 px-3 py-1.5 rounded-lg">
            <Clock className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-bold text-yellow-400">{pendingCount} بانتظار</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-1.5 rounded-lg">
            <Timer className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-bold text-blue-400">{preparingCount} قيد التحضير</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 flex-1 overflow-auto">
        {orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').map((order) => (
          <div key={order.id} className={`rounded-xl border-2 p-4 ${getPriorityColor(order.priority)} flex flex-col`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {getPriorityIcon(order.priority)}
                <span className="text-sm font-bold">#{order.saleId?.slice(-6)}</span>
                {order.tableNumber && (
                  <span className="bg-primary-600/20 text-primary-400 px-2 py-0.5 rounded text-xs">طاولة {order.tableNumber}</span>
                )}
              </div>
              <span className={`text-xs font-mono font-bold ${getElapsedColor(order.elapsedMin)}`}>
                {order.elapsedMin} د
              </span>
            </div>

            <div className="flex-1 space-y-2 mb-3">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-brand-bg/50 rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      item.status === 'ready' ? 'bg-emerald-400' :
                      item.status === 'preparing' ? 'bg-blue-400' : 'bg-yellow-400'
                    }`} />
                    <span className="text-sm">{item.productName}</span>
                  </div>
                  <span className="text-sm font-bold">{item.qty}x</span>
                </div>
              ))}
            </div>

            {order.note && (
              <div className="bg-amber-500/10 text-amber-300 text-xs p-2 rounded-lg mb-3">
                ملاحظة: {order.note}
              </div>
            )}

            <div className="flex gap-2">
              {order.status === 'pending' && (
                <Button className="flex-1 text-xs" onClick={() => {}}>
                  بدء التحضير
                </Button>
              )}
              {order.status === 'preparing' && (
                <Button className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700" onClick={() => {}}>
                  <CheckCircle2 className="w-3 h-3 ml-1" /> جاهز
                </Button>
              )}
            </div>
          </div>
        ))}

        {orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length === 0 && (
          <div className="col-span-full text-center py-20 text-brand-accent/30">
            <ChefHat className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">لا توجد طلبات حالياً</p>
            <p className="text-sm">ستظهر الطلبات الجديدة هنا تلقائياً</p>
          </div>
        )}
      </div>
    </div>
  );
};

const KioskTab: React.FC = () => {
  const { notify } = useAppStore();
  const { getToken } = useAuthStore();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', theme: 'colorful' as 'light' | 'dark' | 'colorful', showImages: true, fontSize: 'large' as 'small' | 'medium' | 'large' | 'xlarge', welcomeMsg: 'مرحباً بك', acceptCash: true, acceptCard: true });

  const { data: layouts } = useQuery({ queryKey: ['kioskLayouts'], queryFn: () => wailsApp.GetKioskLayouts() });
  const { data: sessions } = useQuery({ queryKey: ['activeKioskSessions'], queryFn: () => wailsApp.GetActiveKioskSessions() });

  const createMutation = useMutation({
    mutationFn: (l: KioskLayout) => wailsApp.CreateKioskLayout(getToken() || '', l),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['kioskLayouts'] }); notify('تم إنشاء التصميم', 'success'); setShowModal(false); },
    onError: () => notify('فشل في إنشاء التصميم', 'error'),
  });

  const startSessionMutation = useMutation({
    mutationFn: (layoutId: string) => wailsApp.StartKioskSession(layoutId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['activeKioskSessions'] }); notify('تم بدء الجلسة', 'success'); },
    onError: () => notify('فشل في بدء الجلسة', 'error'),
  });

  const endSessionMutation = useMutation({
    mutationFn: ({ id, saleId, total }: { id: number; saleId: string; total: number }) => wailsApp.EndKioskSession(id, saleId, total),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['activeKioskSessions'] }); notify('تم إنهاء الجلسة', 'success'); },
    onError: () => notify('فشل في إنهاء الجلسة', 'error'),
  });

  return (
    <div className="flex-1 overflow-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center"><Monitor size={20} className="text-cyan-500" /></div>
          <div><h1 className="text-xl font-bold">كيوسك الخدمة الذاتية</h1><p className="text-xs text-brand-accent/40 dark:text-white/30">إعداد شاشات الخدمة الذاتية للعملاء</p></div>
        </div>
        <Button onClick={() => setShowModal(true)} className="flex items-center gap-2"><Plus size={16} /> تصميم جديد</Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <h2 className="text-sm font-bold flex items-center gap-2"><Layout size={16} /> التصاميم المتاحة</h2>
          {(layouts || []).map((l: KioskLayout) => (
            <div key={l.id} className="bg-brand-surface/50 dark:bg-[#1e1e1e]/50 rounded-xl border border-brand-border/15 dark:border-white/[0.04] p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">{l.name}</p>
                <p className="text-xs text-brand-accent/40 dark:text-white/30">{l.theme} • {l.fontSize} • {l.welcomeMsg}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={() => startSessionMutation.mutate(l.id)} size="sm" className="flex items-center gap-1"><Play size={12} /> بدء</Button>
                <button onClick={() => {}} className="text-red-500/50 hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <h2 className="text-sm font-bold flex items-center gap-2"><Monitor size={16} /> الجلسات النشطة</h2>
          {(sessions || []).map((s: KioskSession) => (
            <div key={s.id} className="bg-brand-surface/50 dark:bg-[#1e1e1e]/50 rounded-xl border border-emerald-500/20 p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">جلسة #{s.id}</p>
                <p className="text-xs text-brand-accent/40 dark:text-white/30">بدأت: {s.startedAt} • {s.status}</p>
              </div>
              <Button onClick={() => endSessionMutation.mutate({ id: s.id, saleId: s.saleId || '', total: s.totalAmount })} size="sm" variant="secondary" className="flex items-center gap-1"><Square size={12} /> إنهاء</Button>
            </div>
          ))}
          {(!sessions || sessions.length === 0) && <p className="text-center text-brand-accent/30 dark:text-white/20 py-4 text-sm">لا توجد جلسات نشطة</p>}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="تصميم كيوسك جديد">
        <div className="space-y-4 p-4">
          <div><label className="text-xs font-semibold mb-1 block">الاسم</label><input className="w-full bg-brand-surface/50 dark:bg-[#1e1e1e] border border-brand-border/20 dark:border-white/10 rounded-lg px-3 py-2 text-sm" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="text-xs font-semibold mb-1 block">السمة</label><select className="w-full bg-brand-surface/50 dark:bg-[#1e1e1e] border border-brand-border/20 dark:border-white/10 rounded-lg px-3 py-2 text-sm" value={form.theme} onChange={e => setForm({ ...form, theme: e.target.value as 'light' | 'dark' | 'colorful' })}><option value="light">فاتح</option><option value="dark">داكن</option><option value="colorful">ملون</option></select></div>
          <div><label className="text-xs font-semibold mb-1 block">حجم الخط</label><select className="w-full bg-brand-surface/50 dark:bg-[#1e1e1e] border border-brand-border/20 dark:border-white/10 rounded-lg px-3 py-2 text-sm" value={form.fontSize} onChange={e => setForm({ ...form, fontSize: e.target.value as 'small' | 'medium' | 'large' | 'xlarge' })}><option value="small">صغير</option><option value="medium">متوسط</option><option value="large">كبير</option><option value="xlarge">كبير جداً</option></select></div>
          <div><label className="text-xs font-semibold mb-1 block">رسالة الترحيب</label><input className="w-full bg-brand-surface/50 dark:bg-[#1e1e1e] border border-brand-border/20 dark:border-white/10 rounded-lg px-3 py-2 text-sm" value={form.welcomeMsg} onChange={e => setForm({ ...form, welcomeMsg: e.target.value })} /></div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.acceptCash} onChange={e => setForm({ ...form, acceptCash: e.target.checked })} /><span className="text-sm">قبول الكاش</span></label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.acceptCard} onChange={e => setForm({ ...form, acceptCard: e.target.checked })} /><span className="text-sm">قبول البطاقات</span></label>
          </div>
          <Button onClick={() => createMutation.mutate({ ...form, id: '', categories: '', isDefault: false, isActive: true, createdAt: '', updatedAt: '' } as KioskLayout)} className="w-full">إنشاء التصميم</Button>
        </div>
      </Modal>
    </div>
  );
};

const CommissionsTab: React.FC = () => {
  const { notify } = useAppStore();
  const { getToken } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'rules' | 'performance' | 'payments'>('rules');
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [ruleForm, setRuleForm] = useState({ name: '', type: 'percentage' as 'percentage' | 'fixed', value: 0, targetType: 'all', minAmount: 0 });
  const [periodStart] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [periodEnd] = useState(new Date().toISOString().split('T')[0]);

  const { data: rules } = useQuery({ queryKey: ['commissionRules'], queryFn: () => wailsApp.GetCommissionRules() });
  const { data: performance } = useQuery({ queryKey: ['staffPerformance', periodStart, periodEnd], queryFn: () => wailsApp.GetAllStaffPerformance(periodStart, periodEnd) });

  const createRuleMutation = useMutation({
    mutationFn: (r: CommissionRule) => wailsApp.CreateCommissionRule(getToken() || '', r),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['commissionRules'] }); notify('تم إنشاء القاعدة بنجاح', 'success'); setShowRuleModal(false); },
    onError: () => notify('فشل في إنشاء القاعدة', 'error'),
  });

  const deleteRuleMutation = useMutation({
    mutationFn: (id: string) => wailsApp.DeleteCommissionRule(getToken() || '', id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['commissionRules'] }); notify('تم حذف القاعدة', 'success'); },
    onError: () => notify('فشل في حذف القاعدة', 'error'),
  });

  const stats = {
    totalSales: (performance || []).reduce((s: number, p: StaffPerformance) => s + p.totalSales, 0),
    totalStaff: (performance || []).length,
    totalCommission: (performance || []).reduce((s: number, p: StaffPerformance) => s + p.commission, 0),
  };

  const tabs = [
    { id: 'rules' as const, label: 'قواعد العمولة' },
    { id: 'performance' as const, label: 'أداء الموظفين' },
    { id: 'payments' as const, label: 'المدفوعات' },
  ];

  return (
    <div className="flex-1 overflow-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Trophy size={20} className="text-purple-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold">الأداء والعمولات</h1>
            <p className="text-xs text-brand-accent/40 dark:text-white/30">تتبع أداء الموظفين وحساب العمولات</p>
          </div>
        </div>
        <Button onClick={() => setShowRuleModal(true)} className="flex items-center gap-2"><Plus size={16} /> قاعدة جديدة</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-brand-surface/50 dark:bg-[#1e1e1e]/50 rounded-xl border border-brand-border/15 dark:border-white/[0.04] p-4">
          <div className="flex items-center gap-2 mb-1"><TrendingUp size={14} className="text-emerald-500" /><span className="text-xs text-brand-accent/40 dark:text-white/30">إجمالي المبيعات</span></div>
          <p className="text-lg font-bold">{stats.totalSales.toLocaleString()}</p>
        </div>
        <div className="bg-brand-surface/50 dark:bg-[#1e1e1e]/50 rounded-xl border border-brand-border/15 dark:border-white/[0.04] p-4">
          <div className="flex items-center gap-2 mb-1"><Users size={14} className="text-blue-500" /><span className="text-xs text-brand-accent/40 dark:text-white/30">عدد الموظفين</span></div>
          <p className="text-lg font-bold">{stats.totalStaff}</p>
        </div>
        <div className="bg-brand-surface/50 dark:bg-[#1e1e1e]/50 rounded-xl border border-brand-border/15 dark:border-white/[0.04] p-4">
          <div className="flex items-center gap-2 mb-1"><DollarSign size={14} className="text-purple-500" /><span className="text-xs text-brand-accent/40 dark:text-white/30">إجمالي العمولات</span></div>
          <p className="text-lg font-bold">{stats.totalCommission.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.id ? 'bg-primary-500/10 text-primary-500 border border-primary-500/20' : 'text-brand-accent/40 dark:text-white/30 hover:bg-brand-surface/30'}`}>{tab.label}</button>
        ))}
      </div>

      {activeTab === 'rules' && (
        <div className="grid gap-3">
          {(rules || []).map((r: CommissionRule) => (
            <div key={r.id} className="bg-brand-surface/50 dark:bg-[#1e1e1e]/50 rounded-xl border border-brand-border/15 dark:border-white/[0.04] p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">{r.name}</p>
                <p className="text-xs text-brand-accent/40 dark:text-white/30">{r.type === 'percentage' ? `${r.value}%` : r.value.toLocaleString()} • الحد الأدنى: {r.minAmount.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary-500/10 text-primary-500">{r.targetType}</span>
                <button onClick={() => deleteRuleMutation.mutate(r.id)} className="text-red-500/50 hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="bg-brand-surface/50 dark:bg-[#1e1e1e]/50 rounded-xl border border-brand-border/15 dark:border-white/[0.04] overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-brand-border/10 dark:border-white/[0.04]"><th className="text-right px-4 py-3 font-semibold text-brand-accent/50 dark:text-white/40">الموظف</th><th className="text-right px-4 py-3 font-semibold text-brand-accent/50 dark:text-white/40">المبيعات</th><th className="text-right px-4 py-3 font-semibold text-brand-accent/50 dark:text-white/40">عدد</th><th className="text-right px-4 py-3 font-semibold text-brand-accent/50 dark:text-white/40">المتوسط</th><th className="text-right px-4 py-3 font-semibold text-brand-accent/50 dark:text-white/40">العمولة</th></tr></thead>
            <tbody>
              {(performance || []).map((p: StaffPerformance) => (
                <tr key={p.staffId} className="border-b border-brand-border/5 dark:border-white/[0.02]"><td className="px-4 py-3 font-semibold">{p.staffName}</td><td className="px-4 py-3 font-mono">{p.totalSales.toLocaleString()}</td><td className="px-4 py-3">{p.salesCount}</td><td className="px-4 py-3 font-mono">{p.avgSaleValue.toLocaleString()}</td><td className="px-4 py-3 font-mono text-purple-500">{p.commission.toLocaleString()}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="text-center text-brand-accent/30 dark:text-white/20 py-8">
          <DollarSign size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">سيتم عرض المدفوعات عند تسجيل عمولات</p>
        </div>
      )}

      <Modal isOpen={showRuleModal} onClose={() => setShowRuleModal(false)} title="قاعدة عمولة جديدة">
        <div className="space-y-4 p-4">
          <div><label className="text-xs font-semibold mb-1 block">الاسم</label><input className="w-full bg-brand-surface/50 dark:bg-[#1e1e1e] border border-brand-border/20 dark:border-white/10 rounded-lg px-3 py-2 text-sm" value={ruleForm.name} onChange={e => setRuleForm({ ...ruleForm, name: e.target.value })} /></div>
          <div><label className="text-xs font-semibold mb-1 block">النوع</label><select className="w-full bg-brand-surface/50 dark:bg-[#1e1e1e] border border-brand-border/20 dark:border-white/10 rounded-lg px-3 py-2 text-sm" value={ruleForm.type} onChange={e => setRuleForm({ ...ruleForm, type: e.target.value as 'percentage' | 'fixed' })}><option value="percentage">نسبة مئوية</option><option value="fixed">مبلغ ثابت</option></select></div>
          <div><label className="text-xs font-semibold mb-1 block">القيمة</label><input type="number" className="w-full bg-brand-surface/50 dark:bg-[#1e1e1e] border border-brand-border/20 dark:border-white/10 rounded-lg px-3 py-2 text-sm" value={ruleForm.value} onChange={e => setRuleForm({ ...ruleForm, value: parseFloat(e.target.value) || 0 })} /></div>
          <div><label className="text-xs font-semibold mb-1 block">الحد الأدنى للمبيعات</label><input type="number" className="w-full bg-brand-surface/50 dark:bg-[#1e1e1e] border border-brand-border/20 dark:border-white/10 rounded-lg px-3 py-2 text-sm" value={ruleForm.minAmount} onChange={e => setRuleForm({ ...ruleForm, minAmount: parseFloat(e.target.value) || 0 })} /></div>
          <Button onClick={() => createRuleMutation.mutate({ ...ruleForm, id: '', targetId: '', isActive: true, createdAt: '', updatedAt: '' } as CommissionRule)} className="w-full">إنشاء القاعدة</Button>
        </div>
      </Modal>
    </div>
  );
};

const Operations: React.FC = () => {
  const [activeTab, setActiveTab] = useState<OperationsTab>('tables');

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-1 p-2 px-6 bg-brand-surface/30 border-b border-brand-border/15">
        {TAB_ITEMS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all ${
              activeTab === tab.id
                ? 'bg-primary-500/10 text-primary-500 border border-primary-500/20'
                : 'text-brand-accent/40 dark:text-white/30 hover:bg-brand-surface/50 hover:text-brand-accent/70'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-hidden">
        {activeTab === 'tables' && <TablesTab />}
        {activeTab === 'kitchen' && <KitchenTab />}
        {activeTab === 'kiosk' && <KioskTab />}
        {activeTab === 'commissions' && <CommissionsTab />}
      </div>
    </div>
  );
};

export default Operations;
