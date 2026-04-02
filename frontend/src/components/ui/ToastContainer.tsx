import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/store';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, RotateCcw } from 'lucide-react';

const TOAST_DURATION = 4000; // ms

export const ToastContainer: React.FC = () => {
  const { notifications, removeNotification } = useAppStore();

  return (
    <div className="fixed bottom-4 left-4 z-[100] flex flex-col gap-3 max-w-sm w-full">
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

// ─── Notification type ────────────────────────────────────────────────────────
interface NotificationData {
  id: number;
  message: string;
  type: string;
  undoAction?: () => void;
}

interface ToastProps {
  notification: NotificationData;
  onClose: () => void;
}

// ─── Individual Toast ─────────────────────────────────────────────────────────
const Toast: React.FC<ToastProps> = ({ notification, onClose }) => {
  const [progress, setProgress] = useState(100);
  const [paused, setPaused] = useState(false);

  // Auto-dismiss with progress bar
  useEffect(() => {
    if (paused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          onClose();
          return 0;
        }
        return prev - 100 / (TOAST_DURATION / 50);
      });
    }, 50);

    return () => clearInterval(interval);
  }, [paused, onClose]);

  const typeConfig: Record<
    string,
    { icon: React.ReactNode; border: string; bar: string; iconBg: string }
  > = {
    success: {
      icon: <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />,
      border: 'border-green-500/30',
      bar: 'bg-green-500',
      iconBg: 'bg-green-500/10',
    },
    error: {
      icon: <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />,
      border: 'border-red-500/30',
      bar: 'bg-red-500',
      iconBg: 'bg-red-500/10',
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />,
      border: 'border-yellow-500/30',
      bar: 'bg-yellow-500',
      iconBg: 'bg-yellow-500/10',
    },
    info: {
      icon: <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />,
      border: 'border-blue-500/30',
      bar: 'bg-blue-500',
      iconBg: 'bg-blue-500/10',
    },
  };

  const cfg = typeConfig[notification.type] ?? typeConfig.info;

  return (
    <div
      className={`
        relative overflow-hidden bg-brand-surface border ${cfg.border} rounded-2xl
        shadow-2xl shadow-black/20 animate-fade-in
        transition-all duration-300
      `}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Main content */}
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Icon */}
        <div className={`w-9 h-9 rounded-xl ${cfg.iconBg} flex items-center justify-center flex-shrink-0`}>
          {cfg.icon}
        </div>

        {/* Message */}
        <p className="text-sm font-bold dark:text-white text-gray-900 flex-1 leading-snug">
          {notification.message}
        </p>

        {/* Undo button */}
        {notification.undoAction && (
          <button
            onClick={() => {
              notification.undoAction?.();
              onClose();
            }}
            className="flex items-center gap-1 text-xs font-black text-primary-400 hover:text-primary-300 transition-colors px-2 py-1 rounded-lg hover:bg-primary-500/10"
          >
            <RotateCcw size={12} />
            تراجع
          </button>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="text-brand-accent/30 hover:text-brand-accent/70 transition-colors flex-shrink-0"
          aria-label="إغلاق الإشعار"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-brand-border/20 w-full">
        <div
          className={`h-full ${cfg.bar} transition-none rounded-full`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
