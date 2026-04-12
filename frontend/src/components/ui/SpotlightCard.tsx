import React, { useRef, useState, memo } from 'react';

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  onClick?: () => void;
}

export const SpotlightCard = memo(({ children, className = '', spotlightColor = 'rgba(99, 102, 241, 0.06)', onClick }: SpotlightCardProps) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setOpacity(1);
  };

  return (
    <div
      ref={divRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setOpacity(0)}
      className={`relative bg-brand-surface/40 dark:bg-white/[0.02] border border-brand-border/20 dark:border-white/[0.05] rounded-2xl transition-all duration-500 hover:shadow-xl dark:hover:shadow-primary-500/5 backdrop-blur-xl ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-500 rounded-2xl"
        style={{ opacity, background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)` }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
});

SpotlightCard.displayName = 'SpotlightCard';
