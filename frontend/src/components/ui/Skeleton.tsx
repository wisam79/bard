import React from 'react';

type SkeletonVariant = 'text' | 'circle' | 'card' | 'table-row' | 'stat-card' | 'rect';

interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string;
  height?: string;
  className?: string;
  count?: number;
}

const baseClass =
  'animate-pulse bg-brand-border/20 rounded-xl relative overflow-hidden';

const shimmer =
  "after:absolute after:inset-0 after:translate-x-[-100%] after:bg-gradient-to-r after:from-transparent after:via-white/5 after:to-transparent after:animate-shimmer";

const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rect',
  width,
  height,
  className = '',
  count = 1,
}) => {
  const items = Array.from({ length: count });

  const renderVariant = (_: unknown, i: number) => {
    switch (variant) {
      case 'text':
        return (
          <div
            key={i}
            className={`${baseClass} ${shimmer} h-4 rounded-lg ${className}`}
            style={{ width: width || '100%' }}
          />
        );

      case 'circle':
        return (
          <div
            key={i}
            className={`${baseClass} ${shimmer} rounded-full ${className}`}
            style={{
              width: width || '40px',
              height: height || '40px',
            }}
          />
        );

      case 'stat-card':
        return (
          <div
            key={i}
            className={`bg-brand-surface border-2 border-brand-border/30 rounded-3xl p-6 space-y-4 ${className}`}
          >
            <div className="flex items-center justify-between">
              <div className={`${baseClass} ${shimmer} w-14 h-14 rounded-2xl`} />
              <div className={`${baseClass} ${shimmer} w-12 h-6 rounded-lg`} />
            </div>
            <div className="space-y-2">
              <div className={`${baseClass} ${shimmer} h-3 w-20 rounded-lg`} />
              <div className={`${baseClass} ${shimmer} h-8 w-32 rounded-xl`} />
            </div>
          </div>
        );

      case 'card':
        return (
          <div
            key={i}
            className={`bg-brand-surface border border-brand-border/30 rounded-3xl p-6 space-y-4 ${className}`}
          >
            <div className={`${baseClass} ${shimmer} h-6 w-1/3 rounded-lg`} />
            <div className={`${baseClass} ${shimmer} h-4 w-full rounded-lg`} />
            <div className={`${baseClass} ${shimmer} h-4 w-2/3 rounded-lg`} />
            <div className={`${baseClass} ${shimmer} h-4 w-3/4 rounded-lg`} />
          </div>
        );

      case 'table-row':
        return (
          <div
            key={i}
            className={`flex items-center gap-4 p-4 border-b border-brand-border/10 ${className}`}
          >
            <div className={`${baseClass} ${shimmer} w-8 h-8 rounded-xl flex-shrink-0`} />
            <div className={`${baseClass} ${shimmer} flex-1 h-4 rounded-lg`} />
            <div className={`${baseClass} ${shimmer} w-24 h-4 rounded-lg`} />
            <div className={`${baseClass} ${shimmer} w-16 h-6 rounded-lg`} />
          </div>
        );

      default:
        return (
          <div
            key={i}
            className={`${baseClass} ${shimmer} ${className}`}
            style={{ width: width || '100%', height: height || '16px' }}
          />
        );
    }
  };

  return <>{items.map(renderVariant)}</>;
};

export default Skeleton;
