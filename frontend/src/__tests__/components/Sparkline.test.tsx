import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Sparkline } from '@/components/ui/Sparkline';

describe('Sparkline', () => {
  it('renders with empty data', () => {
    const { container } = render(<Sparkline data={[]} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders with single data point', () => {
    const { container } = render(<Sparkline data={[100]} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders with two data points', () => {
    const { container } = render(<Sparkline data={[100, 200]} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders with multiple data points', () => {
    const { container } = render(<Sparkline data={[100, 200, 150, 300, 250]} />);
    const path = container.querySelector('path:not([fill])');
    expect(path).toBeInTheDocument();
  });

  it('renders fill area when showFill is true', () => {
    const { container } = render(<Sparkline data={[100, 200, 150]} showFill={true} />);
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBeGreaterThanOrEqual(2);
  });

  it('does not render fill when showFill is false', () => {
    const { container } = render(<Sparkline data={[100, 200, 150]} showFill={false} />);
    const defs = container.querySelector('defs');
    expect(defs).toBeNull();
  });

  it('applies custom width and height', () => {
    const { container } = render(<Sparkline data={[100, 200]} width={200} height={60} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '200');
    expect(svg).toHaveAttribute('height', '60');
  });

  it('applies custom color', () => {
    const { container } = render(<Sparkline data={[100, 200, 150]} color="#ff0000" />);
    const path = container.querySelector('path[fill="none"]');
    expect(path).toHaveAttribute('stroke', '#ff0000');
  });

  it('renders green color for positive trend', () => {
    const { container } = render(<Sparkline data={[100, 200, 300]} />);
    const path = container.querySelector('path[fill="none"]');
    expect(path?.getAttribute('stroke')).toBe('#10b981');
  });

  it('renders red color for negative trend', () => {
    const { container } = render(<Sparkline data={[300, 200, 100]} />);
    const path = container.querySelector('path[fill="none"]');
    expect(path?.getAttribute('stroke')).toBe('#ef4444');
  });

  it('renders end dot with pulse animation', () => {
    const { container } = render(<Sparkline data={[100, 200, 150]} />);
    const circle = container.querySelector('circle.animate-pulse');
    expect(circle).toBeInTheDocument();
  });

  it('handles NaN values gracefully', () => {
    const { container } = render(<Sparkline data={[100, NaN as any, 150]} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
