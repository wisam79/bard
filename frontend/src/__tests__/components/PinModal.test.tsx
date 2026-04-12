import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PinModal } from '@/components/features/PinModal';

describe('PinModal', () => {
  it('renders when isOpen is true', () => {
    render(<PinModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);
    expect(screen.getByText('مطلوب رمز الحماية')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<PinModal isOpen={false} onClose={vi.fn()} onSuccess={vi.fn()} />);
    expect(screen.queryByText('مطلوب رمز الحماية')).not.toBeInTheDocument();
  });

  it('renders number pad buttons 0-9', () => {
    render(<PinModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].forEach((num) => {
      expect(screen.getByText(String(num))).toBeInTheDocument();
    });
  });

  it('updates pin display when number is clicked', () => {
    render(<PinModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);
    fireEvent.click(screen.getByText('1'));
    expect(screen.getByText('•')).toBeInTheDocument();
  });

  it('fills up to 4 digits', () => {
    render(<PinModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);
    fireEvent.click(screen.getByText('1'));
    fireEvent.click(screen.getByText('2'));
    fireEvent.click(screen.getByText('3'));
    fireEvent.click(screen.getByText('4'));
    const dots = screen.getAllByText('•');
    expect(dots.length).toBe(4);
  });

  it('does not allow more than 4 digits', () => {
    render(<PinModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);
    [1, 2, 3, 4, 5].forEach((n) => fireEvent.click(screen.getByText(String(n))));
    const dots = screen.getAllByText('•');
    expect(dots.length).toBe(4);
  });

  it('deletes last digit on backspace', () => {
    render(<PinModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);
    fireEvent.click(screen.getByText('1'));
    fireEvent.click(screen.getByText('2'));
    const deleteBtn = screen.getByTitle('مسح');
    fireEvent.click(deleteBtn);
    const dots = screen.getAllByText('•');
    expect(dots.length).toBe(1);
  });

  it('clears all digits on clear button', () => {
    render(<PinModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);
    fireEvent.click(screen.getByText('1'));
    fireEvent.click(screen.getByText('2'));
    const clearBtn = screen.getByTitle('مسح الكل');
    fireEvent.click(clearBtn);
    expect(screen.getByText('----')).toBeInTheDocument();
  });

  it('calls onClose when cancel is clicked', () => {
    const onClose = vi.fn();
    render(<PinModal isOpen={true} onClose={onClose} onSuccess={vi.fn()} />);
    fireEvent.click(screen.getByText('إلغاء'));
    expect(onClose).toHaveBeenCalled();
  });

  it('renders confirm button', () => {
    render(<PinModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);
    expect(screen.getByText('تأكيد')).toBeInTheDocument();
  });

  it('renders custom title', () => {
    render(<PinModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} title="Custom Title" />);
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('renders lock icon', () => {
    const { container } = render(<PinModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders pin dots indicator', () => {
    const { container } = render(<PinModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);
    const circles = container.querySelectorAll('.rounded-full.w-4');
    expect(circles.length).toBe(4);
  });

  it('shows error message on wrong pin', async () => {
    const mockVerify = vi.fn().mockResolvedValue(false);
    (window as any).go = { main: { App: { VerifyPin: mockVerify } } };
    render(<PinModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);
    [1, 2, 3, 4].forEach((n) => fireEvent.click(screen.getByText(String(n))));
    fireEvent.click(screen.getByText('تأكيد'));
    await waitFor(() => {
      expect(screen.getByText('الرمز غير صحيح')).toBeInTheDocument();
    });
  });

  it('calls onSuccess on correct pin', async () => {
    const onSuccess = vi.fn();
    const mockVerify = vi.fn().mockResolvedValue(true);
    (window as any).go = { main: { App: { VerifyPin: mockVerify } } };
    render(<PinModal isOpen={true} onClose={vi.fn()} onSuccess={onSuccess} />);
    [1, 2, 3, 4].forEach((n) => fireEvent.click(screen.getByText(String(n))));
    fireEvent.click(screen.getByText('تأكيد'));
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('renders with overlay backdrop', () => {
    const { container } = render(<PinModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);
    expect(container.querySelector('.fixed.inset-0')).toBeInTheDocument();
  });
});
