import { expect, test, describe } from 'bun:test';
import { estimateTokens, formatTokenCount } from './index';

describe('Token Estimator', () => {
  test('estimateTokens should return 0 for empty string', () => {
    expect(estimateTokens('')).toBe(0);
  });

  test('estimateTokens should approximate based on length', () => {
    const text = 'abcd'.repeat(10); // 40 chars
    expect(estimateTokens(text)).toBe(10);
  });

  test('formatTokenCount should format small numbers', () => {
    expect(formatTokenCount(500)).toBe('500');
  });

  test('formatTokenCount should format large numbers', () => {
    expect(formatTokenCount(1200)).toBe('1.2k');
    expect(formatTokenCount(2500)).toBe('2.5k');
  });
});
