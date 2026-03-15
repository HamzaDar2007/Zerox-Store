export function clampLimit(
  raw: string | undefined,
  defaultVal = 20,
  max = 100,
): number {
  const val = raw ? parseInt(raw, 10) : defaultVal;
  return Math.min(Math.max(1, isNaN(val) ? defaultVal : val), max);
}

export function clampPage(raw: string | undefined, defaultVal = 1): number {
  const val = raw ? parseInt(raw, 10) : defaultVal;
  return Math.max(1, isNaN(val) ? defaultVal : val);
}
