import { memo } from 'react';
import { CheckCircle2, AlertCircle, XCircle, Info } from 'lucide-react';

type BadgeType = 'success' | 'error' | 'warning' | 'info' | 'completed' | 'returned' | 'pending';

const badgeStyles: Record<BadgeType, string> = {
  success: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  error: 'bg-red-500/10 text-red-500 border-red-500/20',
  warning: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  info: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  completed: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  returned: 'bg-red-500/10 text-red-500 border-red-500/20',
  pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
};

interface PremiumBadgeProps {
  type: BadgeType;
  text: string;
  className?: string;
}

export const PremiumBadge = memo(({ type, text, className = '' }: PremiumBadgeProps) => {
  const styleClass = badgeStyles[type] || badgeStyles.info;
  const Icon = type === 'success' || type === 'completed' ? CheckCircle2
    : type === 'warning' || type === 'pending' ? AlertCircle
    : type === 'error' || type === 'returned' ? XCircle
    : Info;

  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1.5 w-fit select-none backdrop-blur-sm ${styleClass} ${className}`}>
      <Icon size={12} />
      {text}
    </span>
  );
});

PremiumBadge.displayName = 'PremiumBadge';
