import { describe, it, expect, vi } from 'vitest'
import { cn, formatCurrency, formatDate, formatDateTime, truncate, getInitials, debounce } from '@/lib/utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1')
  })

  it('handles conditional classes', () => {
    const condition = false as boolean
    expect(cn('px-2', condition && 'py-1', 'mt-2')).toBe('px-2 mt-2')
  })

  it('deduplicates tailwind classes', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })
})

describe('formatCurrency', () => {
  it('formats USD by default', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56')
  })

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00')
  })

  it('formats with custom currency', () => {
    const result = formatCurrency(100, 'EUR')
    expect(result).toContain('100')
  })
})

describe('formatDate', () => {
  it('formats a date string', () => {
    const result = formatDate('2024-01-15')
    expect(result).toContain('Jan')
    expect(result).toContain('2024')
    expect(result).toContain('15')
  })

  it('formats a Date object', () => {
    const result = formatDate(new Date(2024, 0, 15))
    expect(result).toContain('Jan')
    expect(result).toContain('15')
  })
})

describe('formatDateTime', () => {
  it('formats date with time', () => {
    const result = formatDateTime('2024-01-15T14:30:00Z')
    expect(result).toContain('Jan')
    expect(result).toContain('2024')
  })
})

describe('truncate', () => {
  it('returns short strings unchanged', () => {
    expect(truncate('hello', 10)).toBe('hello')
  })

  it('truncates long strings with ellipsis', () => {
    expect(truncate('hello world', 5)).toBe('hello...')
  })

  it('handles exact length', () => {
    expect(truncate('hello', 5)).toBe('hello')
  })
})

describe('getInitials', () => {
  it('extracts initials from full name', () => {
    expect(getInitials('John Doe')).toBe('JD')
  })

  it('handles single name', () => {
    expect(getInitials('John')).toBe('J')
  })

  it('handles multiple names and takes first two', () => {
    expect(getInitials('John Michael Doe')).toBe('JM')
  })
})

describe('debounce', () => {
  it('debounces function calls', async () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debounced = debounce(fn, 300)

    debounced()
    debounced()
    debounced()

    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(300)
    expect(fn).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })

  it('passes arguments correctly', async () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced('test')
    vi.advanceTimersByTime(100)

    expect(fn).toHaveBeenCalledWith('test')
    vi.useRealTimers()
  })
})
