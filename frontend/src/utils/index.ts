import { twMerge } from 'tailwind-merge';
import { clsx, ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format an integer monetary amount for display.
 * Backend stores amounts as int64 (whole dinars for IQD).
 * Use this everywhere you display a monetary value.
 */
export function formatCurrency(amount: number, currency = 'د.ع'): string {
  if (amount == null || isNaN(amount)) return `0 ${currency}`;
  return `${Math.round(amount).toLocaleString('ar-IQ')} ${currency}`;
}

/**
 * Format currency in a compact form for charts and tight spaces.
 * e.g. 1,500,000 → "1.5M د.ع"
 */
export function formatCurrencyCompact(amount: number, currency = 'د.ع'): string {
  if (amount == null || isNaN(amount)) return `0 ${currency}`;
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1)}M ${currency}`;
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(0)}K ${currency}`;
  return `${sign}${abs} ${currency}`;
}

/**
 * Parse a user-entered currency string back to an integer amount.
 * Strips commas, Arabic numerals, and currency symbols.
 */
export function parseCurrencyInput(input: string): number {
  // Remove currency symbols, commas, spaces, Arabic/Persian digits normalization
  const cleaned = input
    .replace(/[د.ع$€£¥,\s]/g, '')
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
  const num = Number(cleaned);
  return isNaN(num) ? 0 : Math.round(num);
}

export function formatNumber(num: number): string {
  if (num == null || isNaN(num)) return '0';
  return num.toLocaleString('ar-IQ');
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function formatDate(date: string | number | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('ar-IQ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(timestamp: number): string {
  const d = new Date(timestamp * 1000);
  return d.toLocaleString('ar-IQ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
