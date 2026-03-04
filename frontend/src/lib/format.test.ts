import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, formatNumber, truncate, slugify, getInitials } from './format';

describe('formatCurrency', () => {
  it('formats with default PKR currency', () => {
    const result = formatCurrency(1500);
    expect(result).toContain('1,500');
  });

  it('formats USD currency', () => {
    const result = formatCurrency(99.99, 'USD');
    expect(result).toContain('99.99');
  });
});

describe('formatDate', () => {
  it('formats a date string', () => {
    const result = formatDate('2024-01-15T00:00:00Z');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });
});

describe('formatNumber', () => {
  it('formats large numbers with commas', () => {
    const result = formatNumber(1234567);
    expect(result).toBe('1,234,567');
  });
});

describe('truncate', () => {
  it('truncates long strings', () => {
    expect(truncate('Hello World', 5)).toBe('Hello…');
  });

  it('does not truncate short strings', () => {
    expect(truncate('Hi', 10)).toBe('Hi');
  });
});

describe('slugify', () => {
  it('converts to lowercase kebab-case', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('removes special characters', () => {
    expect(slugify('Product #1 (New!)')).toBe('product-1-new');
  });
});

describe('getInitials', () => {
  it('returns initials from name', () => {
    expect(getInitials('John Doe')).toBe('JD');
  });

  it('handles single name', () => {
    expect(getInitials('John')).toBe('J');
  });
});
