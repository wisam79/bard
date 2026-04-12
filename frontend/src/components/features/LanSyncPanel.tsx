import { useState, useEffect, useCallback } from 'react';
import { Wifi, WifiOff, Server, Monitor, RefreshCw, Power, PowerOff, Copy, Check, AlertTriangle, Ban, Play, UserX, Users, Shield, Trash2, Terminal } from 'lucide-react';

const api = {
  lan: {
    startServer: () => (window as any).go?.main?.App?.StartLanServer?.(),
    stopServer: () => (window as any).go?.main?.App?.StopLanServer?.(),
    getServerStatus: () => (window as any).go?.main?.App?.GetLanServerStatus?.(),
    connect: (ip: string, port: number) => (window as any).go?.main?.App?.ConnectToLanServer?.(ip, port),
    disconnect: () => (window as any).go?.main?.App?.DisconnectFromLanServer?.(),
    getClientStatus: () => (window as any).go?.main?.App?.GetLanClientStatus?.(),
    getLocalIP: () => (window as any).go?.main?.App?.GetLocalIP?.(),
    discoverServers: () => (window as any).go?.main?.App?.DiscoverServers?.(),
    getConnectedClients: () => (window as any).go?.main?.App?.GetConnectedClients?.(),
    disconnectClient: (id: string) => (window as any).go?.main?.App?.DisconnectLanClient?.(id),
    suspendClient: (id: string) => (window as any).go?.main?.App?.SuspendLanClient?.(id),
    resumeClient: (id: string) => (window as any).go?.main?.App?.ResumeLanClient?.(id),
    blockDevice: (id: string, name: string, reason: string) => (window as any).go?.main?.App?.BlockLanDevice?.(id, name, reason),
    getBlockedDevices: () => (window as any).go?.main?.App?.GetBlockedDevices?.(),
    unblockDevice: (id: number) => (window as any).go?.main?.App?.UnblockLanDevice?.(id),
  }
};

interface LanSyncPanelProps {
  notify: (msg: string, type: 'success' | 'error' | 'info') => void;
}

interface ServerStatus {
  running: boolean;
  localIP: string;
  port: number;
  clientCount: number;
}

interface ClientStatus {
  connected: boolean;
  serverAddress: string;
  mode: 'standalone' | 'server' | 'client';
}

interface ConnectedClient {
  deviceId: string;
  deviceName: string;
  ipAddress: string;
  connectedAt: number;
  lastActivity: number;
  status: 'active' | 'suspended';
}

interface BlockedDevice {
  id: number;
  deviceId: string;
  deviceName: string;
  blockedAt: number;
  reason: string;
}

interface DiscoveredServer {
  serverName: string;
  serverIP: string;
  port: number;
}

export const LanSyncPanel: React.FC<LanSyncPanelProps> = ({ notify }) => {
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [clientStatus, setClientStatus] = useState<ClientStatus | null>(null);
  const [connectedClients, setConnectedClients] = useState<ConnectedClient[]>([]);
  const [blockedDevices, setBlockedDevices] = useState<BlockedDevice[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'clients' | 'blocked'>('clients');
  const [showConnectForm, setShowConnectForm] = useState(false);
  const [discoveredServers, setDiscoveredServers] = useState<DiscoveredServer[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedServer, setSelectedServer] = useState<DiscoveredServer | null>(null);
  const [manualIp, setManualIp] = useState('');

  const fetchStatus = useCallback(async () => {
    try {
      const [server, client] = await Promise.all([
        api.lan.getServerStatus(),
        api.lan.getClientStatus()
      ]);
      setServerStatus(server);
      setClientStatus(client);
      if (server?.running) {
        const [clients, blocked] = await Promise.all([
          api.lan.getConnectedClients(),
          api.lan.getBlockedDevices()
        ]);
        setConnectedClients(clients || []);
        setBlockedDevices(blocked || []);
      }
    } catch (e) {
      console.error('Failed to fetch LAN status', e);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleScanServers = async () => {
    setIsScanning(true);
    setDiscoveredServers([]);
    try {
      const servers = await api.lan.discoverServers();
      setDiscoveredServers(servers || []);
      if (servers && servers.length === 1) setSelectedServer(servers[0]);
    } catch (e) { console.error('Scan failed:', e); }
    setIsScanning(false);
  };

  const handleConnectToServer = async () => {
    const ip = selectedServer?.serverIP || manualIp.trim();
    const port = selectedServer?.port || 0;
    if (!ip) { notify('اختر سيرفر أو أدخل عنوان IP', 'error'); return; }
    setLoading(true);
    try {
      await api.lan.connect(ip, port);
      notify('تم الاتصال بالسيرفر بنجاح!', 'success');
      setTimeout(() => window.location.reload(), 1000);
    } catch (e: any) {
      notify('فشل الاتصال: ' + (e?.message || e), 'error');
      setLoading(false);
    }
  };

  const handleStartServer = async () => {
    setLoading(true);
    try {
      await api.lan.startServer();
      notify('تم تشغيل الخادم بنجاح', 'success');
      await fetchStatus();
    } catch (e: any) { notify('فشل تشغيل الخادم: ' + e, 'error'); }
    setLoading(false);
  };

  const handleStopServer = async () => {
    setLoading(true);
    try {
      await api.lan.stopServer();
      notify('تم إيقاف الخادم', 'info');
      await fetchStatus();
    } catch (e: any) { notify('فشل إيقاف الخادم: ' + e, 'error'); }
    setLoading(false);
  };

  const handleDisconnectClient = async (deviceId: string) => {
    try { await api.lan.disconnectClient(deviceId); notify('تم فصل الجهاز', 'success'); await fetchStatus(); } catch (e: any) { notify('خطأ: ' + e, 'error'); }
  };

  const handleSuspendClient = async (deviceId: string) => {
    try { await api.lan.suspendClient(deviceId); notify('تم تعليق الجهاز', 'info'); await fetchStatus(); } catch (e: any) { notify('خطأ: ' + e, 'error'); }
  };

  const handleResumeClient = async (deviceId: string) => {
    try { await api.lan.resumeClient(deviceId); notify('تم استئناف الجهاز', 'success'); await fetchStatus(); } catch (e: any) { notify('خطأ: ' + e, 'error'); }
  };

  const handleBlockDevice = async (deviceId: string, deviceName: string) => {
    try { await api.lan.blockDevice(deviceId, deviceName, 'حظر يدوي'); notify('تم حظر الجهاز', 'info'); await fetchStatus(); } catch (e: any) { notify('خطأ: ' + e, 'error'); }
  };

  const handleUnblockDevice = async (id: number) => {
    try { await api.lan.unblockDevice(id); notify('تم إلغاء الحظر', 'success'); await fetchStatus(); } catch (e: any) { notify('خطأ: ' + e, 'error'); }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try { await api.lan.disconnect(); notify('تم قطع الاتصال', 'info'); await fetchStatus(); } catch (e: any) { notify('خطأ: ' + e, 'error'); }
    setLoading(false);
  };

  const copyAddress = () => {
    if (serverStatus?.localIP) {
      navigator.clipboard.writeText(serverStatus.localIP);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatTime = (timestamp: number) => new Date(timestamp * 1000).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' });
  const mode = clientStatus?.mode || 'standalone';

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 p-4 text-white shadow-lg">
        <div className="absolute top-0 right-0 p-1 opacity-10"><Wifi size={50} /></div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl shadow-inner border border-white/30">
            <Server size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight">الربط الشبكي</h2>
            <p className="text-cyan-100 text-[10px] opacity-90">إدارة الخادم والاتصال بالأجهزة المتعددة</p>
          </div>
        </div>
      </div>

      <div className={`p-6 rounded-2xl border shadow-sm transition-all ${mode === 'server' ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20' : mode === 'client' ? 'bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20' : 'bg-brand-surface/40 dark:bg-white/[0.02] border-brand-border/15 dark:border-white/[0.05]'}`}>
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${mode === 'server' ? 'bg-emerald-500 text-white shadow-emerald-500/30' : mode === 'client' ? 'bg-blue-500 text-white shadow-blue-500/30' : 'bg-brand-border/20 dark:bg-white/[0.06] text-brand-accent/30 dark:text-white/20'}`}>
            {mode === 'server' ? <Server size={28} /> : mode === 'client' ? <Monitor size={28} /> : <WifiOff size={28} />}
          </div>
          <div>
            <h4 className="text-xl font-black text-brand-accent dark:text-white mb-1">
              {mode === 'server' ? 'الجهاز يعمل كخادم' : mode === 'client' ? 'الجهاز متصل كعميل' : 'الوضع المستقل'}
            </h4>
            <p className="text-sm font-medium text-brand-accent/40 dark:text-white/40">
              {mode === 'server' ? `${connectedClients.length} أجهزة متصلة حالياً` : mode === 'client' ? `متصل بالخادم: ${clientStatus?.serverAddress}` : 'الجهاز غير مرتبط بأي شبكة'}
            </p>
          </div>
        </div>
      </div>

      {mode !== 'client' && (
        <div className="bg-brand-surface/30 dark:bg-white/[0.02] backdrop-blur-xl border border-brand-border/15 dark:border-white/[0.05] rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-brand-accent dark:text-white mb-6 flex items-center gap-2">
            <Server size={20} className="text-emerald-500" />
            إعدادات الخادم (للجهاز الرئيسي)
          </h3>

          {serverStatus?.running ? (
            <div className="space-y-6">
              <div className="p-5 bg-brand-surface/50 dark:bg-white/[0.03] border border-brand-border/15 dark:border-white/[0.05] rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-brand-accent/30 dark:text-white/20 mb-2">عنوان IP للاتصال</p>
                  <div className="flex items-center gap-3">
                    <code className="bg-brand-dark/80 dark:bg-black/60 text-emerald-400 px-4 py-2 rounded-lg text-lg font-mono tracking-wider shadow-inner" dir="ltr">{serverStatus.localIP}</code>
                    <div className="h-8 w-px bg-brand-border/20 dark:bg-white/[0.06] mx-2" />
                    <span className="text-sm font-mono text-brand-accent/25 dark:text-white/15">Port: {serverStatus.port}</span>
                  </div>
                </div>
                <button onClick={copyAddress} className="p-3 bg-brand-border/15 dark:bg-white/[0.05] hover:bg-emerald-500 hover:text-white rounded-xl transition-all group border border-brand-border/20 dark:border-white/[0.06]" title="نسخ العنوان">
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                </button>
              </div>

              <div className="bg-brand-surface/30 dark:bg-white/[0.02] rounded-2xl border border-brand-border/15 dark:border-white/[0.05] overflow-hidden">
                <div className="flex border-b border-brand-border/15 dark:border-white/[0.04]">
                  <button onClick={() => setActiveTab('clients')} className={`flex-1 py-3 text-sm font-bold transition-all ${activeTab === 'clients' ? 'bg-brand-surface/50 dark:bg-white/[0.04] text-primary-500 border-t-2 border-primary-500' : 'text-brand-accent/25 dark:text-white/15'}`}>
                    <Users size={14} className="inline ml-2" /> المتصلون ({connectedClients.length})
                  </button>
                  <button onClick={() => setActiveTab('blocked')} className={`flex-1 py-3 text-sm font-bold transition-all ${activeTab === 'blocked' ? 'bg-brand-surface/50 dark:bg-white/[0.04] text-red-500 border-t-2 border-red-500' : 'text-brand-accent/25 dark:text-white/15'}`}>
                    <Shield size={14} className="inline ml-2" /> المحظورون ({blockedDevices.length})
                  </button>
                </div>
                <div className="p-4 min-h-[200px] max-h-[300px] overflow-y-auto">
                  {activeTab === 'clients' ? (
                    connectedClients.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-48 text-brand-accent/20 dark:text-white/10">
                        <Users size={32} className="mb-2" />
                        <p>لا توجد أجهزة متصلة حالياً</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {connectedClients.map((client) => (
                          <div key={client.deviceId} className="flex items-center justify-between p-3 bg-brand-surface/30 dark:bg-white/[0.02] rounded-xl border border-brand-border/10 dark:border-white/[0.03]">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${client.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                <Monitor size={20} />
                              </div>
                              <div>
                                <p className="font-bold text-brand-accent dark:text-white/80 text-sm">{client.deviceName || 'جهاز غير معروف'}</p>
                                <div className="flex items-center gap-2 text-[10px] text-brand-accent/20 dark:text-white/10">
                                  <span className="font-mono bg-brand-border/10 dark:bg-white/[0.04] px-1.5 rounded">{client.ipAddress}</span>
                                  <span>منذ {formatTime(client.connectedAt)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {client.status === 'suspended' ? (
                                <button onClick={() => handleResumeClient(client.deviceId)} className="p-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-lg transition-colors" title="استئناف"><Play size={14} /></button>
                              ) : (
                                <button onClick={() => handleSuspendClient(client.deviceId)} className="p-2 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white rounded-lg transition-colors" title="تعليق"><Ban size={14} /></button>
                              )}
                              <button onClick={() => handleDisconnectClient(client.deviceId)} className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-colors" title="فصل"><UserX size={14} /></button>
                              <button onClick={() => handleBlockDevice(client.deviceId, client.deviceName)} className="p-2 bg-brand-border/10 dark:bg-white/[0.04] hover:bg-slate-800 text-brand-accent/25 dark:text-white/15 hover:text-white rounded-lg transition-colors" title="حظر"><Shield size={14} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    blockedDevices.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-48 text-brand-accent/20 dark:text-white/10"><Shield size={32} className="mb-2" /><p>لا توجد أجهزة محظورة</p></div>
                    ) : (
                      <div className="space-y-2">
                        {blockedDevices.map((device) => (
                          <div key={device.id} className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center"><Ban size={20} /></div>
                              <div>
                                <p className="font-bold text-brand-accent dark:text-white/80 text-sm">{device.deviceName}</p>
                                <p className="text-[10px] text-red-400">محظور: {formatTime(device.blockedAt)}</p>
                              </div>
                            </div>
                            <button onClick={() => handleUnblockDevice(device.id)} className="p-2 bg-brand-surface/30 hover:bg-emerald-500 hover:text-white text-brand-accent/25 dark:text-white/15 rounded-lg transition-colors" title="إلغاء الحظر"><Trash2 size={14} /></button>
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </div>
              </div>

              <button onClick={handleStopServer} disabled={loading} className="w-full py-4 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 border border-red-500/20 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                <PowerOff size={18} /> إيقاف خدمة الخادم
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-brand-accent/30 dark:text-white/15 mb-6 max-w-md mx-auto">قم بتحويل هذا الجهاز إلى خادم رئيسي للسماح للأجهزة الأخرى بالاتصال ومزامنة البيانات.</p>
              <button onClick={handleStartServer} disabled={loading || clientStatus?.connected} className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 mx-auto disabled:opacity-50">
                {loading ? <RefreshCw size={20} className="animate-spin" /> : <Power size={20} />}
                تشغيل كخادم رئيسي
              </button>
            </div>
          )}
        </div>
      )}

      {mode === 'standalone' && (
        <div className="flex items-center gap-4 px-8 opacity-50">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-brand-border/20 dark:via-white/[0.06] to-transparent" />
          <span className="text-xs font-bold text-brand-accent/20 dark:text-white/10 uppercase tracking-widest">خيارات الاتصال</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-brand-border/20 dark:via-white/[0.06] to-transparent" />
        </div>
      )}

      {mode !== 'server' && (
        <div className="bg-brand-surface/30 dark:bg-white/[0.02] backdrop-blur-xl border border-brand-border/15 dark:border-white/[0.05] rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-brand-accent dark:text-white mb-6 flex items-center gap-2">
            <Monitor size={20} className="text-blue-500" />
            وضع العميل (للأجهزة الفرعية)
          </h3>

          {mode === 'client' ? (
            <div className="space-y-6">
              <div className="p-5 bg-blue-500/5 border border-blue-500/15 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <Wifi size={24} className="text-blue-500 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-sm text-brand-accent/30 dark:text-white/20 mb-1">متصل بالخادم:</p>
                    <code className="text-xl font-mono font-bold text-blue-500 tracking-wider" dir="ltr">{clientStatus?.serverAddress}</code>
                  </div>
                </div>
              </div>
              <button onClick={handleDisconnect} disabled={loading} className="w-full py-4 bg-brand-surface/30 hover:bg-red-500 hover:text-white text-brand-accent/30 dark:text-white/15 border border-brand-border/15 dark:border-white/[0.05] rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                <WifiOff size={18} /> قطع الاتصال بالخادم
              </button>
            </div>
          ) : showConnectForm ? (
            <div className="bg-brand-surface/30 dark:bg-white/[0.02] rounded-2xl border border-brand-border/15 dark:border-white/[0.05] p-6 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-brand-accent dark:text-white">اكتشاف الخوادم المتاحة</h4>
                <button onClick={handleScanServers} disabled={isScanning} className="px-3 py-1.5 bg-brand-border/15 dark:bg-white/[0.06] hover:bg-primary-500/20 text-primary-500 rounded-lg text-xs font-bold transition-colors flex items-center gap-1">
                  {isScanning ? <RefreshCw size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                  تحديث
                </button>
              </div>
              <div className="min-h-[100px] max-h-[200px] overflow-y-auto space-y-2">
                {isScanning ? (
                  <div className="flex flex-col items-center justify-center py-8 text-brand-accent/20 dark:text-white/10"><RefreshCw size={24} className="animate-spin mb-2 text-primary-500" /><p className="text-xs">جاري البحث عن الخوادم...</p></div>
                ) : discoveredServers.length > 0 ? (
                  discoveredServers.map((server, idx) => (
                    <button key={idx} onClick={() => { setSelectedServer(server); setManualIp(''); }} className={`w-full p-4 rounded-xl border text-right transition-all ${selectedServer?.serverIP === server.serverIP ? 'bg-blue-500/10 border-blue-500 shadow-md shadow-blue-500/10' : 'bg-brand-dark/20 dark:bg-white/[0.02] border-brand-border/15 dark:border-white/[0.04] hover:border-blue-500/50'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${selectedServer?.serverIP === server.serverIP ? 'bg-blue-500 ring-2 ring-blue-500/30' : 'bg-emerald-400'}`} />
                          <div>
                            <span className="font-bold text-sm block text-brand-accent dark:text-white">{server.serverName}</span>
                            <span className="text-[10px] text-brand-accent/20 dark:text-white/10">تم اكتشافه تلقائياً</span>
                          </div>
                        </div>
                        <code className="text-xs font-mono bg-brand-border/10 dark:bg-white/[0.04] px-2 py-1 rounded border border-brand-border/15 dark:border-white/[0.06]">{server.serverIP}</code>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="py-8 text-center bg-brand-dark/20 dark:bg-white/[0.02] rounded-xl border border-dashed border-brand-border/20 dark:border-white/[0.06] text-brand-accent/20 dark:text-white/10">
                    <Ban size={24} className="mx-auto mb-2 opacity-50" />
                    <p className="text-xs">لم يتم العثور على خوادم. تأكد أن الخادم يعمل.</p>
                  </div>
                )}
              </div>
              <div className="h-px bg-brand-border/15 dark:bg-white/[0.04] my-2" />
              <div className="flex items-center gap-2 mb-2"><Terminal size={14} className="text-brand-accent/20 dark:text-white/10" /><span className="text-xs font-bold text-brand-accent/20 dark:text-white/10">أو أدخل العنوان يدوياً:</span></div>
              <input type="text" value={manualIp} onChange={(e) => { setManualIp(e.target.value); setSelectedServer(null); }} placeholder="مثال: 192.168.1.100" dir="ltr" className="w-full p-3 bg-brand-dark/20 dark:bg-white/[0.02] border border-brand-border/15 dark:border-white/[0.06] rounded-xl text-center font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowConnectForm(false)} className="flex-1 py-3 bg-brand-surface/30 hover:bg-brand-border/20 text-brand-accent dark:text-white/60 border border-brand-border/15 dark:border-white/[0.06] rounded-xl font-bold transition-colors">إلغاء</button>
                <button onClick={handleConnectToServer} disabled={loading || (!selectedServer && !manualIp)} className="flex-[2] py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2">
                  {loading ? <RefreshCw size={18} className="animate-spin" /> : <Wifi size={18} />}
                  اتصال بالخادم
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-brand-accent/30 dark:text-white/15 mb-6 max-w-md mx-auto">اربط هذا الجهاز بشبكة المحل للعمل كنقطة بيع متصلة بالخادم الرئيسي.</p>
              <button onClick={() => { setShowConnectForm(true); handleScanServers(); }} className="px-8 py-4 bg-brand-surface/30 hover:bg-blue-500 hover:text-white text-blue-500 border-2 border-dashed border-blue-500/30 hover:border-blue-500 rounded-xl font-bold transition-all flex items-center justify-center gap-3 mx-auto group">
                <Wifi size={20} className="group-hover:animate-pulse" />
                الاتصال بسيرفر رئيسي
              </button>
            </div>
          )}
        </div>
      )}

      <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 flex items-start gap-3">
        <AlertTriangle size={20} className="text-blue-500 shrink-0 mt-0.5" />
        <div className="text-xs text-brand-accent/30 dark:text-white/15 leading-relaxed">
          <strong className="text-blue-500 block mb-1">ملاحظات هامة للشبكة:</strong>
          <ul className="list-disc list-inside space-y-1 opacity-80">
            <li>يجب أن تكون جميع الأجهزة متصلة بنفس شبكة Wi-Fi أو الكايبل.</li>
            <li>يفضل تثبيت IP ثابت للجهاز المضيف لمنع انقطاع الاتصال.</li>
            <li>الاتصال يتم تلقائياً عبر المنفذ الافتراضي للتطبيق.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
