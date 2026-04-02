import { describe, it, expect } from 'vitest';
import {
  cn,
  formatCurrency,
  formatNumber,
  generateId,
  formatDate,
  formatDateTime,
  debounce,
  truncate,
  getInitials,
  sleep,
} from './index';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
  });

  it('handles Tailwind conflicts', () => {
    expect(cn('px-4', 'px-2')).toBe('px-2');
  });
});

describe('formatCurrency', () => {
  it('formats number with default currency', () => {
    const result = formatCurrency(1000);
    expect(result).toContain('د.ع');
    expect(result.length).toBeGreaterThan(0);
  });

  it('formats number with custom currency', () => {
    const result = formatCurrency(1000, '$');
    expect(result).toContain('$');
    expect(result.length).toBeGreaterThan(0);
  });

  it('includes the amount in the result', () => {
    const result = formatCurrency(1000);
    expect(result).toMatch(/١/);
  });
});

describe('formatNumber', () => {
  it('formats number with locale', () => {
    const result = formatNumber(1234567);
    expect(result).toContain('١');
    expect(result).toContain('٢٣٤');
  });

  it('formats zero', () => {
    expect(formatNumber(0)).toBe('٠');
  });

  it('formats decimal', () => {
    const result = formatNumber(1234.56);
    expect(result).toContain('١');
    expect(result).toContain('٢٣٤');
  });
});

describe('generateId', () => {
  it('generates a unique ID', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it('generates a string', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
  });
});

describe('formatDate', () => {
  it('formats a date string', () => {
    const result = formatDate('2024-01-15');
    expect(result).toMatch(/٢٠٢٤/);
  });

  it('formats a timestamp', () => {
    const result = formatDate(1705276800000);
    expect(result).toMatch(/٢٠٢٤/);
  });

  it('formats a Date object', () => {
    const result = formatDate(new Date('2024-01-15'));
    expect(result).toMatch(/٢٠٢٤/);
  });
});

describe('formatDateTime', () => {
  it('formats unix timestamp', () => {
    const result = formatDateTime(1705276800);
    expect(result).toMatch(/٢٠٢٤/);
  });
});

describe('debounce', () => {
  it('delays function execution', async () => {
    let count = 0;
    const increment = () => { count++; };
    const debouncedIncrement = debounce(increment, 50);

    debouncedIncrement();
    debouncedIncrement();
    debouncedIncrement();

    expect(count).toBe(0);

    await sleep(100);
    expect(count).toBe(1);
  });
});

describe('truncate', () => {
  it('truncates long strings', () => {
    expect(truncate('Hello World', 5)).toBe('Hello...');
  });

  it('returns short strings unchanged', () => {
    expect(truncate('Hi', 5)).toBe('Hi');
  });

  it('returns exact length strings unchanged', () => {
    expect(truncate('Hello', 5)).toBe('Hello');
  });
});

describe('getInitials', () => {
  it('gets initials from full name', () => {
    expect(getInitials('John Doe')).toBe('JD');
  });

  it('gets initials from single name', () => {
    expect(getInitials('John')).toBe('J');
  });

  it('limits to 2 characters', () => {
    expect(getInitials('John Doe Smith')).toBe('JD');
  });

  it('converts to uppercase', () => {
    expect(getInitials('john doe')).toBe('JD');
  });
});

describe('sleep', () => {
  it('resolves after specified time', async () => {
    const start = Date.now();
    await sleep(50);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(40);
  });
});
