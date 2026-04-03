import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Button from '@/components/ui/Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles clicks', () => {
    const fn = vi.fn();
    render(<Button onClick={fn}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(fn).toHaveBeenCalled();
  });

  it('does not call onClick when disabled', () => {
    const fn = vi.fn();
    render(
      <Button onClick={fn} disabled>
        Disabled
      </Button>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Disabled' }));
    expect(fn).not.toHaveBeenCalled();
  });

  it('shows spinner when loading', () => {
    render(<Button loading>Saving</Button>);

    const button = screen.getByRole('button', { name: 'Saving' });
    expect(button.querySelector('svg')).not.toBeNull();
  });

  it('applies fullWidth class', () => {
    render(<Button fullWidth>Wide</Button>);

    expect(screen.getByRole('button', { name: 'Wide' })).toHaveClass('w-full');
  });

  it('renders with danger variant', () => {
    render(<Button variant="danger">Delete</Button>);

    expect(screen.getByRole('button', { name: 'Delete' })).toHaveClass('bg-rose-600');
  });

  it('renders with small size', () => {
    render(<Button size="sm">Small</Button>);

    expect(screen.getByRole('button', { name: 'Small' })).toHaveClass('px-3', 'py-1.5', 'text-sm');
  });
});
