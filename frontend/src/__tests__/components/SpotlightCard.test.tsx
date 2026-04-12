import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SpotlightCard } from '@/components/ui/SpotlightCard';

describe('SpotlightCard', () => {
  it('renders children', () => {
    render(<SpotlightCard><p>Test Content</p></SpotlightCard>);
    expect(document.querySelector('[class*="rounded-2xl"]')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<SpotlightCard className="custom-class"><p>Test</p></SpotlightCard>);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<SpotlightCard onClick={onClick}><p>Clickable</p></SpotlightCard>);
    fireEvent.click(document.querySelector('[class*="rounded-2xl"]')!);
    expect(onClick).toHaveBeenCalled();
  });

  it('has cursor-pointer when onClick is provided', () => {
    render(<SpotlightCard onClick={() => {}}><p>Test</p></SpotlightCard>);
    expect(document.querySelector('[class*="rounded-2xl"]')).toHaveClass('cursor-pointer');
  });

  it('does not have cursor-pointer without onClick', () => {
    render(<SpotlightCard><p>Test</p></SpotlightCard>);
    expect(document.querySelector('[class*="rounded-2xl"]')).not.toHaveClass('cursor-pointer');
  });

  it('renders spotlight overlay element', () => {
    const { container } = render(<SpotlightCard><p>Test</p></SpotlightCard>);
    expect(container.querySelector('.pointer-events-none')).toBeInTheDocument();
  });

  it('spotlight overlay is initially hidden (opacity 0)', () => {
    const { container } = render(<SpotlightCard><p>Test</p></SpotlightCard>);
    const overlay = container.querySelector('.pointer-events-none');
    expect(overlay).toHaveStyle({ opacity: '0' });
  });

  it('shows spotlight on mouse move', () => {
    const { container } = render(<SpotlightCard><p>Test</p></SpotlightCard>);
    const card = container.querySelector('[class*="rounded-2xl"]')!;
    fireEvent.mouseMove(card, { clientX: 50, clientY: 50 });
    const overlay = container.querySelector('.pointer-events-none');
    expect(overlay).toHaveStyle({ opacity: '1' });
  });

  it('hides spotlight on mouse leave', () => {
    const { container } = render(<SpotlightCard><p>Test</p></SpotlightCard>);
    const card = container.querySelector('[class*="rounded-2xl"]')!;
    fireEvent.mouseMove(card, { clientX: 50, clientY: 50 });
    fireEvent.mouseLeave(card);
    const overlay = container.querySelector('.pointer-events-none');
    expect(overlay).toHaveStyle({ opacity: '0' });
  });

  it('applies custom spotlightColor', () => {
    const { container } = render(<SpotlightCard spotlightColor="rgba(255,0,0,0.1)"><p>Test</p></SpotlightCard>);
    const overlay = container.querySelector('.pointer-events-none');
    expect(overlay).toBeInTheDocument();
  });
});
