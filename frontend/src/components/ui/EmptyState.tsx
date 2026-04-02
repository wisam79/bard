import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  className?: string;
  compact?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className = '',
  compact = false,
}) => {
  const ActionIcon = action?.icon;

  return (
    <div
      className={`flex flex-col items-center justify-center text-center animate-fade-in ${
        compact ? 'py-10 px-4' : 'py-20 px-8'
      } ${className}`}
    >
      {Icon && (
        <div className="relative mb-6">
          <div
            className={`${
              compact ? 'w-16 h-16' : 'w-24 h-24'
            } rounded-3xl bg-brand-border/10 border border-brand-border/20 flex items-center justify-center text-brand-accent/20 transition-all group-hover:scale-110`}
          >
            <Icon size={compact ? 28 : 44} strokeWidth={1.5} />
          </div>
          {/* Decorative dots */}
          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary-500/20 border border-primary-500/30" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-brand-border/30" />
        </div>
      )}

      <h3
        className={`font-black text-brand-accent/50 mb-2 ${
          compact ? 'text-base' : 'text-xl'
        }`}
      >
        {title}
      </h3>

      {description && (
        <p
          className={`text-brand-accent/30 font-medium max-w-xs leading-relaxed mb-6 ${
            compact ? 'text-xs' : 'text-sm'
          }`}
        >
          {description}
        </p>
      )}

      {action && (
        <button
          onClick={action.onClick}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          {ActionIcon && <ActionIcon size={16} />}
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
