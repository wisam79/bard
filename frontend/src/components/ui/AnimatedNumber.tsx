import { useState, useEffect, useRef, memo } from 'react';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const AnimatedNumber = memo(({ value, duration = 800, prefix = '', suffix = '', className = '' }: AnimatedNumberProps) => {
  const [displayValue, setDisplayValue] = useState(value);
  const animationRef = useRef<number | null>(null);
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current === value) return;

    const startValue = prevValue.current;
    const difference = value - startValue;

    if (Math.abs(difference) < 1) {
      setDisplayValue(value);
      prevValue.current = value;
      return;
    }

    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(2, -10 * progress);
      const current = startValue + difference * eased;

      setDisplayValue(Math.round(current));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        prevValue.current = value;
        animationRef.current = null;
      }
    };

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [value, duration]);

  return (
    <span className={`tabular-nums font-mono ${className}`}>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
});

AnimatedNumber.displayName = 'AnimatedNumber';
