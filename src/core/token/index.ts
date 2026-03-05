/**
 * Simple token estimator for architecture policies.
 * Uses a standard rule of thumb (length / 4) for English-like text.
 */
export const estimateTokens = (text: string): number => {
  if (!text) return 0;
  // Standard approximation: ~4 characters per token
  return Math.ceil(text.length / 4);
};

export const formatTokenCount = (count: number): string => {
  if (count < 1000) return `${count}`;
  return `${(count / 1000).toFixed(1)}k`;
};
