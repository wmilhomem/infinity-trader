/**
 * IV Rank (IVR) Measures current IV relatively to its high and lows of a period (usually 1y).
 * Output is 0 to 100.
 */
export function calculateIVRank(current: number, history: number[]): number {
  if (history.length === 0) return 50; // Neutral fallback if no data
  const min = Math.min(...history);
  const max = Math.max(...history);
  
  if (max === min) return 50; 
  if (current <= min) return 0;
  if (current >= max) return 100;
  
  return ((current - min) / (max - min)) * 100;
}

/**
 * IV Percentile (IVP) measures what percentage of days over a period had a LOWER IV than today.
 * Eliminates the noise of single day massive outlier spikes (unlike IV Rank).
 * Output is 0 to 100.
 */
export function calculateIVPercentile(current: number, history: number[]): number {
  if (history.length === 0) return 50;
  
  const lowerDays = history.filter(v => v < current).length;
  return (lowerDays / history.length) * 100;
}
