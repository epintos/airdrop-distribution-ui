import { describe, expect, it } from 'vitest';
import { formatTokenAmount } from './formatTokenAmount';

describe('formatTokenAmount', () => {
  it('formats a simple amount with 18 decimals', () => {
    const result = formatTokenAmount(1000000000000000000, 18)
    expect(result).toBe('1.00')
  })

  it('formats a small number with 6 decimals', () => {
    const result = formatTokenAmount(123456, 6)
    expect(result).toBe('0.12')
  })

  it('formats a number and rounds correctly (down)', () => {
    const result = formatTokenAmount(1999999999999999999, 18)
    expect(result).toBe('2.00')
  })

  it('formats a number and rounds correctly (up)', () => {
    const result = formatTokenAmount(1234567890123456789, 18)
    expect(result).toBe('1.23')
  })

  it('formats a large number with thousands separator', () => {
    const result = formatTokenAmount(1234567890000000000000000, 18)
    expect(result).toBe('1,234,567.89')
  })

  it('returns "0.00" for zero input', () => {
    const result = formatTokenAmount(0, 18)
    expect(result).toBe('0.00')
  })

  it('handles custom decimals correctly', () => {
    const result = formatTokenAmount(123456789, 8)
    expect(result).toBe('1.23')
  })
})
