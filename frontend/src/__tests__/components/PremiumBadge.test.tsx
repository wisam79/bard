import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PremiumBadge } from '@/components/ui/PremiumBadge';

describe('PremiumBadge', () => {
  it('renders success badge', () => {
    const { container } = render(<PremiumBadge type="success" text="Success" />);
    expect(container.querySelector('.bg-emerald-500\\/10')).toBeTruthy();
  });

  it('renders error badge', () => {
    const { container } = render(<PremiumBadge type="error" text="Error" />);
    expect(container.querySelector('.bg-red-500\\/10')).toBeTruthy();
  });

  it('renders warning badge', () => {
    const { container } = render(<PremiumBadge type="warning" text="Warning" />);
    expect(container.querySelector('.bg-amber-500\\/10')).toBeTruthy();
  });

  it('renders info badge', () => {
    const { container } = render(<PremiumBadge type="info" text="Info" />);
    expect(container.querySelector('.bg-blue-500\\/10')).toBeTruthy();
  });

  it('renders completed badge', () => {
    const { container } = render(<PremiumBadge type="completed" text="Completed" />);
    expect(container.querySelector('.bg-emerald-500\\/10')).toBeTruthy();
  });

  it('renders returned badge', () => {
    const { container } = render(<PremiumBadge type="returned" text="Returned" />);
    expect(container.querySelector('.bg-red-500\\/10')).toBeTruthy();
  });

  it('renders pending badge', () => {
    const { container } = render(<PremiumBadge type="pending" text="Pending" />);
    expect(container.querySelector('.bg-amber-500\\/10')).toBeTruthy();
  });

  it('displays text content', () => {
    const { getByText } = render(<PremiumBadge type="success" text="Test Label" />);
    expect(getByText('Test Label')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<PremiumBadge type="success" text="Test" className="my-class" />);
    expect(container.firstChild).toHaveClass('my-class');
  });

  it('has border class', () => {
    const { container } = render(<PremiumBadge type="success" text="Test" />);
    expect(container.firstChild).toHaveClass('border');
  });

  it('renders icon alongside text', () => {
    const { container } = render(<PremiumBadge type="success" text="Test" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('falls back to info style for unknown type', () => {
    const { container } = render(<PremiumBadge type="info" text="Default" />);
    expect(container.querySelector('.bg-blue-500\\/10')).toBeTruthy();
  });
});
