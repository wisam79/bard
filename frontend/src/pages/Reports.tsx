import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/store';
import { useAuthStore } from '@/store/authStore';
import {
  ReportTemplate, ScheduledExport, MessagingProvider, MessageTemplate, MessageLog,
  AnalyticsDashboard, SalesForecast, ProfitAnalysis, DemandForecast, AnomalyDetection
} from '@/types';
import {
  FileSpreadsheet, Plus, Play, Clock, BarChart3, Download, Brain, TrendingUp, AlertTriangle, Package,
  MessageSquare, Phone, Send, TrendingDown, DollarSign
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { wailsApp } from '@/lib/wails';

type ReportsTab = 'reports' | 'analytics' | 'builder' | 'messaging';

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc', '#d8b4fe'];

const TAB_ITEMS: { id: ReportsTab; label: string; icon: React.ReactNode }[] = [
  { id: 'reports', label: 'التقارير', icon: <FileSpreadsheet size={16} /> },
  { id: 'analytics', label: 'التحليلات', icon: <Brain size={16} /> },
  { id: 'builder', label: 'منشئ التقارير', icon: <BarChart3 size={16} /> },
  { id: 'messaging', label: 'الرسائل', icon: <MessageSquare size={16} /> },
];

const ReportsSubTab: React.FC = () => {
  const { data: dashboard, isLoading } = useQuery<AnalyticsDashboard>({
    queryKey: ['analyticsDashboard'],
    queryFn: () => wailsApp.GetAnalyticsDashboard(),
  });

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 h-full flex flex-col bg-brand-dark/20">
      <div className="mb-8">
        <h1 className="text-3xl font-black dark:text-white text-gray-900 tracking-tight flex items-center gap-3">
          <FileSpreadsheet className="text-primary-400" /> تقارير النظام
        </h1>
        <p className="text-brand-accent/50 font-medium mt-1">عرض التقارير المالية والمخزونية والعملياتية</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'إجمالي المبيعات', value: (dashboard?.sales?.total || 0).toLocaleString('ar-IQ'), suffix: 'د.ع', icon: <DollarSign size={20} />, color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'إجمالي المشتريات', value: (dashboard?.purchases?.total || 0).toLocaleString('ar-IQ'), suffix: 'د.ع', icon: <TrendingDown size={20} />, color: 'text-red-400', bg: 'bg-red-500/10' },
          { label: 'الربح الصافي', value: ((dashboard?.sales?.total || 0) - (dashboard?.purchases?.total || 0)).toLocaleString('ar-IQ'), suffix: 'د.ع', icon: <TrendingUp size={20} />, color: 'text-primary-400', bg: 'bg-primary-500/10' },
          { label: 'المعاملات', value: dashboard?.sales?.count || 0, icon: <FileSpreadsheet size={20} />, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-brand-surface border border-brand-border/30 rounded-3xl p-6 flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} border border-white/5`}>{stat.icon}</div>
            <div>
              <p className="text-xs font-bold text-brand-accent/40 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-xl font-black dark:text-white text-gray-900">{stat.value} <span className="text-sm opacity-30">{stat.suffix}</span></p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        <div className="bg-brand-surface border border-brand-border/30 rounded-3xl p-6 flex flex-col">
          <h3 className="font-bold mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary-500" /> مبيعات الشهر الحالي</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboard?.sales?.daily || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Area type="monotone" dataKey="total" stroke="#6366f1" fill="rgba(99,102,241,0.2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-brand-surface border border-brand-border/30 rounded-3xl p-6 flex flex-col">
          <h3 className="font-bold mb-4 flex items-center gap-2"><Package className="w-4 h-4 text-amber-500" /> حركة المخزون</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboard?.inventory?.movements || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="product" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="in" fill="#10b981" name="وارد" radius={[4, 4, 0, 0]} />
                <Bar dataKey="out" fill="#ef4444" name="صادر" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const AnalyticsSubTab: React.FC = () => {
  const { data: dashboard, isLoading } = useQuery<AnalyticsDashboard>({
    queryKey: ['analyticsDashboard'],
    queryFn: () => wailsApp.GetAnalyticsDashboard(),
  });

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const forecasts = dashboard?.forecasts || [];
  const profits = dashboard?.profits || [];
  const demands = dashboard?.demands || [];
  const anomalies = dashboard?.anomalies || [];
  const insights = dashboard?.insights || [];

  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-auto bg-brand-dark/20">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center"><Brain className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-xl font-bold">التحليلات الذكية</h1><p className="text-sm text-brand-accent/50">توقعات المبيعات وتحليل الربح والكشف عن الحالات الشاذة</p></div>
      </div>

      {insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {insights.map((insight, i) => (
            <div key={i} className={`rounded-xl p-4 border ${
              insight.severity === 'high' ? 'bg-red-500/10 border-red-500/30' :
              insight.severity === 'medium' ? 'bg-amber-500/10 border-amber-500/30' :
              'bg-emerald-500/10 border-emerald-500/30'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {insight.severity === 'high' ? <AlertTriangle className="w-4 h-4 text-red-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
                <span className="font-bold text-sm">{insight.title}</span>
              </div>
              <p className="text-sm text-brand-accent/60">{insight.description}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-brand-surface rounded-xl p-5 border border-brand-border/20">
          <h3 className="font-bold mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary-500" /> توقعات المبيعات (7 أيام)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecasts}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Area type="monotone" dataKey="upperBound" stroke="transparent" fill="rgba(99,102,241,0.1)" />
                <Area type="monotone" dataKey="predicted" stroke="#6366f1" fill="rgba(99,102,241,0.2)" />
                <Area type="monotone" dataKey="lowerBound" stroke="transparent" fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-brand-surface rounded-xl p-5 border border-brand-border/20">
          <h3 className="font-bold mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-emerald-500" /> تحليل الأرباح</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profits}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#6366f1" name="الإيرادات" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" fill="#10b981" name="الربح" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-brand-surface rounded-xl p-5 border border-brand-border/20">
        <h3 className="font-bold mb-4 flex items-center gap-2"><Package className="w-4 h-4 text-amber-500" /> توقعات الطلب وإعادة الطلب</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-brand-border/20"><th className="text-right py-2 px-3">المنتج</th><th className="text-right py-2 px-3">المخزون الحالي</th><th className="text-right py-2 px-3">الطلب المتوقع</th><th className="text-right py-2 px-3">أيام المخزون</th><th className="text-right py-2 px-3">تاريخ الطلب</th><th className="text-right py-2 px-3">الأولوية</th></tr></thead>
            <tbody>
              {demands.map((d, i) => (
                <tr key={i} className="border-b border-brand-border/10">
                  <td className="py-2 px-3 font-medium">{d.productName}</td>
                  <td className="py-2 px-3">{d.currentQty}</td>
                  <td className="py-2 px-3">{d.predictedDemand}</td>
                  <td className="py-2 px-3">{d.daysOfStock}</td>
                  <td className="py-2 px-3">{d.reorderDate}</td>
                  <td className="py-2 px-3"><span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    d.urgency === 'critical' ? 'bg-red-500/20 text-red-400' :
                    d.urgency === 'high' ? 'bg-amber-500/20 text-amber-400' :
                    d.urgency === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>{d.urgency === 'critical' ? 'حرج' : d.urgency === 'high' ? 'عالي' : d.urgency === 'medium' ? 'متوسط' : 'منخفض'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {demands.length === 0 && <p className="text-center text-brand-accent/40 py-8">لا توجد منتجات تحتاج إعادة طلب</p>}
        </div>
      </div>

      {anomalies.length > 0 && (
        <div className="bg-brand-surface rounded-xl p-5 border border-red-500/30">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-red-400"><AlertTriangle className="w-4 h-4" /> تنبيهات شاذة</h3>
          <div className="space-y-3">
            {anomalies.map((a, i) => (
              <div key={i} className="bg-red-500/10 rounded-lg p-3">
                <p className="font-bold text-sm">{a.description}</p>
                <p className="text-xs text-brand-accent/50 mt-1">المتوقع: {a.expected.toLocaleString()} | الفعلي: {a.actual.toLocaleString()} | الانحراف: {a.deviation}%</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const BuilderSubTab: React.FC = () => {
  const { notify } = useAppStore();
  const { getToken } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState<'templates' | 'scheduled'>('templates');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [templateForm, setTemplateForm] = useState({ name: '', description: '', type: 'sales' as 'sales' | 'inventory' | 'financial' | 'custom', dataSource: 'sales', columns: '', chartType: 'table' as 'bar' | 'line' | 'pie' | 'table' });
  const [scheduleForm, setScheduleForm] = useState({ name: '', reportId: '', format: 'pdf' as 'pdf' | 'csv' | 'excel', frequency: 'monthly' as 'daily' | 'weekly' | 'monthly', recipients: '' });

  const { data: templates } = useQuery({ queryKey: ['reportTemplates'], queryFn: () => wailsApp.GetReportTemplates() });
  const { data: scheduled } = useQuery({ queryKey: ['scheduledExports'], queryFn: () => wailsApp.GetScheduledExports() });

  const createTemplateMutation = useMutation({
    mutationFn: (t: ReportTemplate) => wailsApp.CreateReportTemplate(getToken() || '', t),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['reportTemplates'] }); notify('تم إنشاء القالب', 'success'); setShowTemplateModal(false); },
    onError: () => notify('فشل في إنشاء القالب', 'error'),
  });

  const createScheduleMutation = useMutation({
    mutationFn: (e: ScheduledExport) => wailsApp.CreateScheduledExport(getToken() || '', e),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['scheduledExports'] }); notify('تم إنشاء التصدير المجدول', 'success'); setShowScheduleModal(false); },
    onError: () => notify('فشل في إنشاء التصدير', 'error'),
  });

  const generateMutation = useMutation({
    mutationFn: (id: string) => wailsApp.GenerateReport(id),
    onSuccess: () => notify('تم إنشاء التقرير بنجاح', 'success'),
    onError: () => notify('فشل في إنشاء التقرير', 'error'),
  });

  return (
    <div className="p-6 h-full flex flex-col gap-6 relative overflow-hidden bg-brand-dark/20">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button onClick={() => setActiveSubTab('templates')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeSubTab === 'templates' ? 'bg-primary-500/10 text-primary-500 border border-primary-500/20' : 'text-brand-accent/40 dark:text-white/30'}`}>قوالب التقارير</button>
          <button onClick={() => setActiveSubTab('scheduled')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeSubTab === 'scheduled' ? 'bg-primary-500/10 text-primary-500 border border-primary-500/20' : 'text-brand-accent/40 dark:text-white/30'}`}>التصدير المجدول</button>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowScheduleModal(true)} variant="secondary" className="flex items-center gap-2"><Clock size={16} /> تصدير مجدول</Button>
          <Button onClick={() => setShowTemplateModal(true)} className="flex items-center gap-2"><Plus size={16} /> تقرير جديد</Button>
        </div>
      </div>

      {activeSubTab === 'templates' && (
        <div className="grid grid-cols-2 gap-4">
          {(templates || []).map((t: ReportTemplate) => (
            <div key={t.id} className="bg-brand-surface/50 dark:bg-[#1e1e1e]/50 rounded-xl border border-brand-border/15 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center"><BarChart3 size={16} className="text-indigo-500" /></div><p className="font-semibold text-sm">{t.name}</p></div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary-500/10 text-primary-500">{t.type}</span>
              </div>
              <p className="text-xs text-brand-accent/40 dark:text-white/30 mb-3">{t.description || 'بدون وصف'}</p>
              <div className="flex items-center gap-2">
                <Button onClick={() => generateMutation.mutate(t.id)} size="sm" className="flex items-center gap-1"><Play size={12} /> تشغيل</Button>
                <Button size="sm" variant="secondary" className="flex items-center gap-1"><Download size={12} /> تصدير</Button>
              </div>
            </div>
          ))}
          {(!templates || templates.length === 0) && <p className="text-center text-brand-accent/30 dark:text-white/20 py-8 col-span-2">لا توجد قوالب تقارير</p>}
        </div>
      )}

      {activeSubTab === 'scheduled' && (
        <div className="grid gap-3">
          {(scheduled || []).map((s: ScheduledExport) => (
            <div key={s.id} className="bg-brand-surface/50 dark:bg-[#1e1e1e]/50 rounded-xl border border-brand-border/15 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3"><Clock size={16} className="text-indigo-500" /><div><p className="font-semibold text-sm">{s.name}</p><p className="text-xs text-brand-accent/40">{s.format} • {s.frequency} • {s.recipients}</p></div></div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${s.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gray-500/10 text-gray-500'}`}>{s.isActive ? 'نشط' : 'معطل'}</span>
            </div>
          ))}
          {(!scheduled || scheduled.length === 0) && <p className="text-center text-brand-accent/30 dark:text-white/20 py-8">لا يوجد تصدير مجدول</p>}
        </div>
      )}

      <Modal isOpen={showTemplateModal} onClose={() => setShowTemplateModal(false)} title="تقرير جديد">
        <div className="space-y-4 p-4">
          <div><label className="text-xs font-semibold mb-1 block">الاسم</label><input className="w-full bg-brand-surface/50 border border-brand-border/20 rounded-lg px-3 py-2 text-sm" value={templateForm.name} onChange={e => setTemplateForm({ ...templateForm, name: e.target.value })} /></div>
          <div><label className="text-xs font-semibold mb-1 block">الوصف</label><input className="w-full bg-brand-surface/50 border border-brand-border/20 rounded-lg px-3 py-2 text-sm" value={templateForm.description} onChange={e => setTemplateForm({ ...templateForm, description: e.target.value })} /></div>
          <div><label className="text-xs font-semibold mb-1 block">النوع</label><select className="w-full bg-brand-surface/50 border border-brand-border/20 rounded-lg px-3 py-2 text-sm" value={templateForm.type} onChange={e => setTemplateForm({ ...templateForm, type: e.target.value as 'sales' | 'inventory' | 'financial' | 'custom' })}><option value="sales">مبيعات</option><option value="inventory">مخزون</option><option value="financial">مالي</option><option value="custom">مخصص</option></select></div>
          <div><label className="text-xs font-semibold mb-1 block">نوع الرسم البياني</label><select className="w-full bg-brand-surface/50 border border-brand-border/20 rounded-lg px-3 py-2 text-sm" value={templateForm.chartType} onChange={e => setTemplateForm({ ...templateForm, chartType: e.target.value as 'bar' | 'line' | 'pie' | 'table' })}><option value="table">جدول</option><option value="bar">أعمدة</option><option value="line">خطي</option><option value="pie">دائري</option></select></div>
          <Button onClick={() => createTemplateMutation.mutate({ ...templateForm, id: '', columns: '[]', filters: '', sortBy: '', groupBy: '', isShared: false, createdBy: '', createdAt: '', updatedAt: '' } as ReportTemplate)} className="w-full">إنشاء التقرير</Button>
        </div>
      </Modal>

      <Modal isOpen={showScheduleModal} onClose={() => setShowScheduleModal(false)} title="تصدير مجدول جديد">
        <div className="space-y-4 p-4">
          <div><label className="text-xs font-semibold mb-1 block">الاسم</label><input className="w-full bg-brand-surface/50 border border-brand-border/20 rounded-lg px-3 py-2 text-sm" value={scheduleForm.name} onChange={e => setScheduleForm({ ...scheduleForm, name: e.target.value })} /></div>
          <div><label className="text-xs font-semibold mb-1 block">التقرير</label><select className="w-full bg-brand-surface/50 border border-brand-border/20 rounded-lg px-3 py-2 text-sm" value={scheduleForm.reportId} onChange={e => setScheduleForm({ ...scheduleForm, reportId: e.target.value })}><option value="">اختر التقرير</option>{(templates || []).map((t: ReportTemplate) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
          <div><label className="text-xs font-semibold mb-1 block">الصيغة</label><select className="w-full bg-brand-surface/50 border border-brand-border/20 rounded-lg px-3 py-2 text-sm" value={scheduleForm.format} onChange={e => setScheduleForm({ ...scheduleForm, format: e.target.value as 'pdf' | 'csv' | 'excel' })}><option value="pdf">PDF</option><option value="csv">CSV</option><option value="excel">Excel</option></select></div>
          <div><label className="text-xs font-semibold mb-1 block">التكرار</label><select className="w-full bg-brand-surface/50 border border-brand-border/20 rounded-lg px-3 py-2 text-sm" value={scheduleForm.frequency} onChange={e => setScheduleForm({ ...scheduleForm, frequency: e.target.value as 'daily' | 'weekly' | 'monthly' })}><option value="daily">يومي</option><option value="weekly">أسبوعي</option><option value="monthly">شهري</option></select></div>
          <div><label className="text-xs font-semibold mb-1 block">المستلمون</label><input className="w-full bg-brand-surface/50 border border-brand-border/20 rounded-lg px-3 py-2 text-sm" placeholder="email1@example.com, email2@example.com" value={scheduleForm.recipients} onChange={e => setScheduleForm({ ...scheduleForm, recipients: e.target.value })} /></div>
          <Button onClick={() => createScheduleMutation.mutate({ ...scheduleForm, id: '', lastRunAt: undefined, nextRunAt: undefined, isActive: true, createdAt: '', updatedAt: '' } as ScheduledExport)} className="w-full">إنشاء التصدير</Button>
        </div>
      </Modal>
    </div>
  );
};

const MessagingSubTab: React.FC = () => {
  const { notify } = useAppStore();
  const { getToken } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState<'providers' | 'templates' | 'logs'>('providers');
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [providerForm, setProviderForm] = useState({ name: '', type: 'whatsapp' as 'whatsapp' | 'sms' | 'telegram', apiKey: '', phone: '' });
  const [templateForm, setTemplateForm] = useState({ name: '', type: 'receipt' as 'receipt' | 'promotion' | 'reminder' | 'custom', content: '' });
  const [sendForm, setSendForm] = useState({ providerId: '', recipient: '', content: '' });

  const { data: providers } = useQuery({ queryKey: ['messagingProviders'], queryFn: () => wailsApp.GetMessagingProviders() });
  const { data: templates } = useQuery({ queryKey: ['messageTemplates'], queryFn: () => wailsApp.GetMessageTemplates() });
  const { data: logsData } = useQuery({ queryKey: ['messageLogs', 1, 50], queryFn: () => wailsApp.GetMessageLogs(1, 50) });

  const logs: MessageLog[] = logsData?.[0] || [];

  const createProviderMutation = useMutation({
    mutationFn: (p: MessagingProvider) => wailsApp.CreateMessagingProvider(getToken() || '', p),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['messagingProviders'] }); notify('تم إنشاء المزود بنجاح', 'success'); setShowProviderModal(false); },
    onError: () => notify('فشل في إنشاء المزود', 'error'),
  });

  const createTemplateMutation = useMutation({
    mutationFn: (t: MessageTemplate) => wailsApp.CreateMessageTemplate(getToken() || '', t),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['messageTemplates'] }); notify('تم إنشاء القالب بنجاح', 'success'); setShowTemplateModal(false); },
    onError: () => notify('فشل في إنشاء القالب', 'error'),
  });

  const sendMutation = useMutation({
    mutationFn: () => wailsApp.SendMessage(getToken() || '', sendForm.providerId, sendForm.recipient, sendForm.content, '', '', ''),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['messageLogs'] }); notify('تم إرسال الرسالة بنجاح', 'success'); setShowSendModal(false); },
    onError: () => notify('فشل في إرسال الرسالة', 'error'),
  });

  return (
    <div className="p-6 h-full flex flex-col gap-6 relative overflow-hidden bg-brand-dark/20">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button onClick={() => setActiveSubTab('providers')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeSubTab === 'providers' ? 'bg-primary-500/10 text-primary-500 border border-primary-500/20' : 'text-brand-accent/40 dark:text-white/30 hover:bg-brand-surface/50'}`}><Phone size={14} /> مزودو الخدمة</button>
          <button onClick={() => setActiveSubTab('templates')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeSubTab === 'templates' ? 'bg-primary-500/10 text-primary-500 border border-primary-500/20' : 'text-brand-accent/40 dark:text-white/30 hover:bg-brand-surface/50'}`}><MessageSquare size={14} /> القوالب</button>
          <button onClick={() => setActiveSubTab('logs')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeSubTab === 'logs' ? 'bg-primary-500/10 text-primary-500 border border-primary-500/20' : 'text-brand-accent/40 dark:text-white/30 hover:bg-brand-surface/50'}`}><Send size={14} /> سجل الرسائل</button>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowSendModal(true)} variant="secondary" className="flex items-center gap-2"><Send size={16} /> إرسال رسالة</Button>
          <Button onClick={() => setShowProviderModal(true)} className="flex items-center gap-2"><Plus size={16} /> مزود جديد</Button>
        </div>
      </div>

      {activeSubTab === 'providers' && (
        <div className="grid gap-3">
          {(providers || []).map((p: MessagingProvider) => (
            <div key={p.id} className="bg-brand-surface/50 dark:bg-[#1e1e1e]/50 rounded-xl border border-brand-border/15 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-lg flex items-center justify-center ${p.type === 'whatsapp' ? 'bg-green-500/10' : p.type === 'sms' ? 'bg-blue-500/10' : 'bg-sky-500/10'}`}><Phone size={16} className={p.type === 'whatsapp' ? 'text-green-500' : p.type === 'sms' ? 'text-blue-500' : 'text-sky-500'} /></div><div><p className="font-semibold text-sm">{p.name}</p><p className="text-xs text-brand-accent/40">{p.type} • {p.phone || 'بدون رقم'}</p></div></div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${p.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>{p.isActive ? 'نشط' : 'معطل'}</span>
            </div>
          ))}
          {(!providers || providers.length === 0) && <p className="text-center text-brand-accent/30 dark:text-white/20 py-8">لا يوجد مزودو خدمة</p>}
        </div>
      )}

      {activeSubTab === 'templates' && (
        <div className="grid gap-3">
          <Button onClick={() => setShowTemplateModal(true)} variant="secondary" className="flex items-center gap-2 self-start"><Plus size={16} /> قالب جديد</Button>
          {(templates || []).map((t: MessageTemplate) => (
            <div key={t.id} className="bg-brand-surface/50 dark:bg-[#1e1e1e]/50 rounded-xl border border-brand-border/15 p-4">
              <div className="flex items-center justify-between mb-2"><p className="font-semibold text-sm">{t.name}</p><span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary-500/10 text-primary-500">{t.type}</span></div>
              <p className="text-xs text-brand-accent/40 line-clamp-2">{t.content}</p>
            </div>
          ))}
        </div>
      )}

      {activeSubTab === 'logs' && (
        <div className="bg-brand-surface/50 dark:bg-[#1e1e1e]/50 rounded-xl border border-brand-border/15 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-brand-border/10"><th className="text-right px-4 py-3 font-semibold text-brand-accent/50">المستلم</th><th className="text-right px-4 py-3 font-semibold text-brand-accent/50">المحتوى</th><th className="text-right px-4 py-3 font-semibold text-brand-accent/50">الحالة</th></tr></thead>
            <tbody>
              {logs.map((log: MessageLog) => (
                <tr key={log.id} className="border-b border-brand-border/5"><td className="px-4 py-3">{log.recipient}</td><td className="px-4 py-3 text-xs truncate max-w-[200px]">{log.content}</td><td className="px-4 py-3"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${log.status === 'sent' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>{log.status}</span></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showProviderModal} onClose={() => setShowProviderModal(false)} title="مزود خدمة جديد">
        <div className="space-y-4 p-4">
          <div><label className="text-xs font-semibold mb-1 block">الاسم</label><input className="w-full bg-brand-surface/50 border border-brand-border/20 rounded-lg px-3 py-2 text-sm" value={providerForm.name} onChange={e => setProviderForm({ ...providerForm, name: e.target.value })} /></div>
          <div><label className="text-xs font-semibold mb-1 block">النوع</label><select className="w-full bg-brand-surface/50 border border-brand-border/20 rounded-lg px-3 py-2 text-sm" value={providerForm.type} onChange={e => setProviderForm({ ...providerForm, type: e.target.value as 'whatsapp' | 'sms' | 'telegram' })}><option value="whatsapp">واتساب</option><option value="sms">رسائل SMS</option><option value="telegram">تلغرام</option></select></div>
          <div><label className="text-xs font-semibold mb-1 block">مفتاح API</label><input className="w-full bg-brand-surface/50 border border-brand-border/20 rounded-lg px-3 py-2 text-sm" value={providerForm.apiKey} onChange={e => setProviderForm({ ...providerForm, apiKey: e.target.value })} /></div>
          <div><label className="text-xs font-semibold mb-1 block">رقم الهاتف</label><input className="w-full bg-brand-surface/50 border border-brand-border/20 rounded-lg px-3 py-2 text-sm" value={providerForm.phone} onChange={e => setProviderForm({ ...providerForm, phone: e.target.value })} /></div>
          <Button onClick={() => createProviderMutation.mutate({ ...providerForm, id: '', isDefault: false, isActive: true, createdAt: '', updatedAt: '' } as MessagingProvider)} className="w-full">إنشاء المزود</Button>
        </div>
      </Modal>

      <Modal isOpen={showTemplateModal} onClose={() => setShowTemplateModal(false)} title="قالب رسالة جديد">
        <div className="space-y-4 p-4">
          <div><label className="text-xs font-semibold mb-1 block">الاسم</label><input className="w-full bg-brand-surface/50 border border-brand-border/20 rounded-lg px-3 py-2 text-sm" value={templateForm.name} onChange={e => setTemplateForm({ ...templateForm, name: e.target.value })} /></div>
          <div><label className="text-xs font-semibold mb-1 block">النوع</label><select className="w-full bg-brand-surface/50 border border-brand-border/20 rounded-lg px-3 py-2 text-sm" value={templateForm.type} onChange={e => setTemplateForm({ ...templateForm, type: e.target.value as 'receipt' | 'promotion' | 'reminder' | 'custom' })}><option value="receipt">إيصال</option><option value="promotion">ترويجي</option><option value="reminder">تذكير</option><option value="custom">مخصص</option></select></div>
          <div><label className="text-xs font-semibold mb-1 block">المحتوى</label><textarea className="w-full bg-brand-surface/50 border border-brand-border/20 rounded-lg px-3 py-2 text-sm h-24 resize-none" value={templateForm.content} onChange={e => setTemplateForm({ ...templateForm, content: e.target.value })} placeholder="استخدم {{name}} للمتغيرات" /></div>
          <Button onClick={() => createTemplateMutation.mutate({ ...templateForm, id: '', isActive: true, createdAt: '', updatedAt: '' } as MessageTemplate)} className="w-full">إنشاء القالب</Button>
        </div>
      </Modal>

      <Modal isOpen={showSendModal} onClose={() => setShowSendModal(false)} title="إرسال رسالة">
        <div className="space-y-4 p-4">
          <div><label className="text-xs font-semibold mb-1 block">مزود الخدمة</label><select className="w-full bg-brand-surface/50 border border-brand-border/20 rounded-lg px-3 py-2 text-sm" value={sendForm.providerId} onChange={e => setSendForm({ ...sendForm, providerId: e.target.value })}><option value="">اختر المزود</option>{(providers || []).map((p: MessagingProvider) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
          <div><label className="text-xs font-semibold mb-1 block">المستلم</label><input className="w-full bg-brand-surface/50 border border-brand-border/20 rounded-lg px-3 py-2 text-sm" placeholder="+9647700000000" value={sendForm.recipient} onChange={e => setSendForm({ ...sendForm, recipient: e.target.value })} /></div>
          <div><label className="text-xs font-semibold mb-1 block">المحتوى</label><textarea className="w-full bg-brand-surface/50 border border-brand-border/20 rounded-lg px-3 py-2 text-sm h-24 resize-none" value={sendForm.content} onChange={e => setSendForm({ ...sendForm, content: e.target.value })} /></div>
          <Button onClick={() => sendMutation.mutate()} className="w-full flex items-center justify-center gap-2"><Send size={16} /> إرسال</Button>
        </div>
      </Modal>
    </div>
  );
};

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportsTab>('reports');

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-1 p-2 px-6 bg-brand-surface/30 border-b border-brand-border/15">
        {TAB_ITEMS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === tab.id ? 'bg-primary-500/10 text-primary-500 border border-primary-500/20' : 'text-brand-accent/40 dark:text-white/30 hover:bg-brand-surface/50 hover:text-brand-accent/70'}`}>{tab.icon}{tab.label}</button>
        ))}
      </div>
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'reports' && <ReportsSubTab />}
        {activeTab === 'analytics' && <AnalyticsSubTab />}
        {activeTab === 'builder' && <BuilderSubTab />}
        {activeTab === 'messaging' && <MessagingSubTab />}
      </div>
    </div>
  );
};

export default Reports;
