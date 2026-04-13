import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  className?: string;
  animation?: 'pulse' | 'wave' | 'none';
  count?: number;
}

const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
  animation = 'pulse',
  count = 1,
}) => {
  const baseClasses = 'inline-block bg-brand-border/20 dark:bg-white/[0.06]';
  
  const variantClasses = {
    text: 'rounded-md h-3',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: '',
    none: '',
  };

  const style: React.CSSProperties = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : '100%',
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  };

  const items = Array.from({ length: count });

  if (animation === 'wave') {
    return (
      <div className={`${className}`}>
        {items.map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${variantClasses[variant]} relative overflow-hidden`}
            style={style}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={{
                x: ['100%', '-100%'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {items.map((_, index) => (
        <div
          key={index}
          className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
          style={style}
        />
      ))}
    </>
  );
};

export default Skeleton;
