import { format, formatDistanceToNow, parseISO } from 'date-fns';

/** Format a date string to "Jan 15, 2024" */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy');
}

/** Format a date string to "Jan 15, 2024 2:30 PM" */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy h:mm a');
}

/** Format to relative time "2 hours ago" */
export function formatRelative(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

/** Format currency (default PKR) */
export function formatCurrency(
  amount: number,
  currency: string = 'PKR',
): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Format a number with commas */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}

/** Truncate text with ellipsis */
export function truncate(text: string, length: number = 100): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trimEnd() + '…';
}

/** Create a slug from a string */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Generate initials from a name */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
