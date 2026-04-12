import { memo, useMemo } from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showFill?: boolean;
  strokeWidth?: number;
}

const getSparklinePath = (points: [number, number][]): string => {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0][0]},${points[0][1]}`;

  let d = `M ${points[0][0]},${points[0][1]}`;

  for (let i = 0; i < points.length - 1; i++) {
    const x0 = i > 0 ? points[i - 1][0] : points[0][0];
    const y0 = i > 0 ? points[i - 1][1] : points[0][1];
    const x1 = points[i][0];
    const y1 = points[i][1];
    const x2 = points[i + 1][0];
    const y2 = points[i + 1][1];
    const x3 = i !== points.length - 2 ? points[i + 2][0] : x2;
    const y3 = i !== points.length - 2 ? points[i + 2][1] : y2;

    const cp1x = x1 + (x2 - x0) / 6;
    const cp1y = y1 + (y2 - y0) / 6;
    const cp2x = x2 - (x3 - x1) / 6;
    const cp2y = y2 - (y3 - y1) / 6;

    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${x2},${y2}`;
  }

  return d;
};

export const Sparkline = memo(({
  data,
  width = 120,
  height = 40,
  color,
  showFill = true,
  strokeWidth = 2,
}: SparklineProps) => {
  const { points, pathD, fillD, lineColor } = useMemo(() => {
    const safeData = data && data.length > 0
      ? data.filter(v => typeof v === 'number' && !isNaN(v))
      : [];

    if (safeData.length < 2) {
      return { points: [] as [number, number][], pathD: '', fillD: '', lineColor: color || '#6366f1' };
    }

    const firstVal = safeData[0];
    const lastVal = safeData[safeData.length - 1];
    const positive = lastVal >= firstVal;
    const calculatedColor = color || (positive ? '#10b981' : '#ef4444');

    const maxVal = Math.max(...safeData);
    const minVal = Math.min(...safeData);
    const range = maxVal - minVal || 1;

    const padding = { x: 2, y: 4 };
    const innerWidth = width - padding.x * 2;
    const innerHeight = height - padding.y * 2;

    const calculatedPoints: [number, number][] = safeData.map((value, i) => {
      const x = padding.x + (i / (safeData.length - 1)) * innerWidth;
      const y = padding.y + innerHeight - ((value - minVal) / range) * innerHeight;
      return [x, y];
    });

    const linePath = getSparklinePath(calculatedPoints);
    const fillPath = calculatedPoints.length > 0
      ? `${linePath} L ${calculatedPoints[calculatedPoints.length - 1][0]},${height} L ${calculatedPoints[0][0]},${height} Z`
      : '';

    return { points: calculatedPoints, pathD: linePath, fillD: fillPath, lineColor: calculatedColor };
  }, [data, width, height, color]);

  if (points.length < 2) {
    return (
      <svg width={width} height={height} className="opacity-30">
        <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="currentColor" strokeWidth="1" strokeDasharray="4,4" className="text-brand-border" />
      </svg>
    );
  }

  const gradientId = `sparkline-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <svg width={width} height={height} className="select-none overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lineColor} stopOpacity="0.25" />
          <stop offset="100%" stopColor={lineColor} stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {showFill && (
        <path d={fillD} fill={`url(#${gradientId})`} className="transition-all duration-300" />
      )}

      <path
        d={pathD}
        fill="none"
        stroke={lineColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-all duration-300"
      />

      {points.length > 0 && (
        <circle
          cx={points[points.length - 1][0]}
          cy={points[points.length - 1][1]}
          r={3}
          fill={lineColor}
          className="animate-pulse"
        />
      )}
    </svg>
  );
});

Sparkline.displayName = 'Sparkline';
