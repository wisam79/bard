import React from 'react';
import { Activity, Clock, Trash2 } from 'lucide-react';
import { useActivityLog, getActionLabel, getActionColor } from '@/store/activityLog';
import type { ActivityEntry } from '@/store/activityLog';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';

// ─── Single entry row ────────────────────────────────────────────────────────
const EntryRow: React.FC<{ entry: ActivityEntry }> = ({ entry }) => {
  const colorClass = getActionColor(entry.action);
  const label = getActionLabel(entry.action);
  const time = new Date(entry.timestamp);
  const timeStr = time.toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex items-start gap-3 py-3 px-1 border-b border-brand-border/25 last:border-0 group hover:bg-brand-dark/25 rounded-lg transition-colors">
      {/* Dot indicator */}
      <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${colorClass.replace('text-', 'bg-')}`} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-black ${colorClass}`}>{label}</span>
          <span className="text-[10px] text-brand-muted/45 font-mono">{timeStr}</span>
        </div>
        <p className="text-sm font-bold text-brand-accent/70 mt-0.5 truncate">
          {entry.label}
        </p>
        {entry.detail && (
          <p className="text-xs text-brand-accent/35 mt-0.5 truncate">{entry.detail}</p>
        )}
      </div>
    </div>
  );
};

// ─── Panel component ─────────────────────────────────────────────────────────
interface ActivityPanelProps {
  maxVisible?: number;
  className?: string;
}

const ActivityPanel: React.FC<ActivityPanelProps> = ({
  maxVisible = 15,
  className = '',
}) => {
  const entries = useActivityLog((s) => s.entries);
  const clear = useActivityLog((s) => s.clear);

  const visibleEntries = entries.slice(0, maxVisible);

  return (
    <div className={`bg-brand-surface rounded-2xl border border-brand-border/35 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary-500/15 flex items-center justify-center">
            <Activity size={16} className="text-primary-400" />
          </div>
          <div>
            <h3 className="font-black text-sm text-brand-accent">سجل النشاطات</h3>
            <p className="text-[10px] text-brand-muted/50 font-bold">{entries.length} سجل</p>
          </div>
        </div>

        {entries.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clear} icon={<Trash2 size={13} />}>
            مسح
          </Button>
        )}
      </div>

      {/* Entries */}
      <div className="px-4 py-2 max-h-[400px] overflow-y-auto">
        {visibleEntries.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="لا توجد نشاطات"
            description="ستظهر هنا العمليات التي تتم على النظام"
            compact
          />
        ) : (
          visibleEntries.map((entry) => <EntryRow key={entry.id} entry={entry} />)
        )}
      </div>

      {/* Footer - show if more entries exist */}
      {entries.length > maxVisible && (
        <div className="px-5 py-2.5 border-t border-brand-border/25 text-center">
          <p className="text-[10px] text-brand-muted/45 font-bold">
            +{entries.length - maxVisible} سجل آخر
          </p>
        </div>
      )}
    </div>
  );
};

export default ActivityPanel;
