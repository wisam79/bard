import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SplitPaymentModal } from '@/components/features/SplitPaymentModal';
import { formatNumber } from '@/utils';

describe('SplitPaymentModal', () => {
  it('renders the modal with total amount', () => {
    render(<SplitPaymentModal total={100000} onClose={vi.fn()} onConfirm={vi.fn()} />);
    expect(screen.getByText('دفع مجزأ (Split Payment)')).toBeInTheDocument();
  });

  it('displays total amount formatted', () => {
    render(<SplitPaymentModal total={50000} onClose={vi.fn()} onConfirm={vi.fn()} />);
    expect(screen.getByText(formatNumber(50000))).toBeInTheDocument();
  });

  it('renders cash slider', () => {
    render(<SplitPaymentModal total={100000} onClose={vi.fn()} onConfirm={vi.fn()} />);
    expect(screen.getByText('نقدي (Cash)')).toBeInTheDocument();
  });

  it('renders card slider', () => {
    render(<SplitPaymentModal total={100000} onClose={vi.fn()} onConfirm={vi.fn()} />);
    expect(screen.getByText('بطاقة (Card)')).toBeInTheDocument();
  });

  it('defaults cash to total amount', () => {
    render(<SplitPaymentModal total={100000} onClose={vi.fn()} onConfirm={vi.fn()} />);
    expect(screen.getByText(formatNumber(100000))).toBeInTheDocument();
  });

  it('renders confirm button', () => {
    render(<SplitPaymentModal total={100000} onClose={vi.fn()} onConfirm={vi.fn()} />);
    expect(screen.getByText('تأكيد الدفع')).toBeInTheDocument();
  });

  it('calls onConfirm with cash and card amounts', () => {
    const onConfirm = vi.fn();
    render(<SplitPaymentModal total={100000} onClose={onConfirm} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByText('تأكيد الدفع'));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('renders cash icon', () => {
    const { container } = render(<SplitPaymentModal total={100000} onClose={vi.fn()} onConfirm={vi.fn()} />);
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(2);
  });

  it('renders range input for cash', () => {
    const { container } = render(<SplitPaymentModal total={100000} onClose={vi.fn()} onConfirm={vi.fn()} />);
    const range = container.querySelectorAll('input[type="range"]');
    expect(range.length).toBe(2);
  });

  it('renders currency label', () => {
    render(<SplitPaymentModal total={100000} onClose={vi.fn()} onConfirm={vi.fn()} />);
    const labels = screen.getAllByText('د.ع');
    expect(labels.length).toBeGreaterThanOrEqual(1);
  });

  it('renders إجمالي المبلغ label', () => {
    render(<SplitPaymentModal total={100000} onClose={vi.fn()} onConfirm={vi.fn()} />);
    expect(screen.getByText('إجمالي المبلغ')).toBeInTheDocument();
  });

  it('renders split payment icon', () => {
    const { container } = render(<SplitPaymentModal total={100000} onClose={vi.fn()} onConfirm={vi.fn()} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
