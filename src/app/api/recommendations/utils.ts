export const normalizeRecommendationLimit = (value: string | null, defaultValue: number, maxValue = 20) => {
  const parsed = Number(value ?? defaultValue);
  if (!Number.isFinite(parsed)) {
    return defaultValue;
  }

  return Math.max(1, Math.min(parsed, maxValue));
};
