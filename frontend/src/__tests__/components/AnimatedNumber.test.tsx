import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';

describe('AnimatedNumber', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('renders initial value', () => {
    render(<AnimatedNumber value={1000} />);
    expect(screen.getByText('1,000')).toBeInTheDocument();
  });

  it('renders with prefix', () => {
    render(<AnimatedNumber value={500} prefix="$" />);
    expect(screen.getByText('$500')).toBeInTheDocument();
  });

  it('renders with suffix', () => {
    render(<AnimatedNumber value={500} suffix=" IQD" />);
    expect(screen.getByText('500 IQD')).toBeInTheDocument();
  });

  it('renders with prefix and suffix', () => {
    render(<AnimatedNumber value={100} prefix="$" suffix=" USD" />);
    expect(screen.getByText('$100 USD')).toBeInTheDocument();
  });

  it('renders zero', () => {
    render(<AnimatedNumber value={0} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renders negative numbers', () => {
    render(<AnimatedNumber value={-50} />);
    expect(screen.getByText('-50')).toBeInTheDocument();
  });

  it('renders large numbers with locale formatting', () => {
    render(<AnimatedNumber value={1234567} />);
    expect(screen.getByText('1,234,567')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<AnimatedNumber value={10} className="text-xl" />);
    expect(container.firstChild).toHaveClass('text-xl');
  });

  it('has tabular-nums and font-mono classes', () => {
    const { container } = render(<AnimatedNumber value={10} />);
    expect(container.firstChild).toHaveClass('tabular-nums', 'font-mono');
  });

  it('updates display when value changes', () => {
    const { rerender } = render(<AnimatedNumber value={100} />);
    expect(screen.getByText('100')).toBeInTheDocument();

    rerender(<AnimatedNumber value={200} />);
    act(() => { vi.advanceTimersByTime(1000); });
    expect(screen.getByText('200')).toBeInTheDocument();
  });

  it('animates from old value to new value', () => {
    const { rerender } = render(<AnimatedNumber value={0} duration={500} />);
    rerender(<AnimatedNumber value={100} duration={500} />);
    act(() => { vi.advanceTimersByTime(250); });
    const text = document.querySelector('.tabular-nums')?.textContent;
    expect(text).not.toBe('100');
  });

  it('handles rapid value changes', () => {
    const { rerender } = render(<AnimatedNumber value={0} duration={200} />);
    rerender(<AnimatedNumber value={100} duration={200} />);
    rerender(<AnimatedNumber value={200} duration={200} />);
    rerender(<AnimatedNumber value={300} duration={200} />);
    act(() => { vi.advanceTimersByTime(500); });
    expect(screen.getByText('300')).toBeInTheDocument();
  });
});
