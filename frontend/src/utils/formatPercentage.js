/**
 * Institutional percentage and basis points formatting utilities
 */

export function formatPercentage(val, precision = 2, isDecimal = true) {
  if (val === null || val === undefined || isNaN(val)) return "—";
  const num = Number(val);
  const percentageVal = isDecimal ? num * 100 : num;
  return `${percentageVal.toLocaleString("en-US", {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  })}%`;
}

export function formatBps(val, isDecimal = true) {
  if (val === null || val === undefined || isNaN(val)) return "—";
  const num = Number(val);
  const bps = isDecimal ? Math.round(num * 10000) : Math.round(num * 100);
  const sign = bps > 0 ? "+" : "";
  return `${sign}${bps} bps`;
}

export function formatDelta(val, precision = 2, isDecimal = true) {
  if (val === null || val === undefined || isNaN(val)) return "—";
  const num = Number(val);
  const percentageVal = isDecimal ? num * 100 : num;
  const sign = percentageVal > 0 ? "+" : "";
  return `${sign}${percentageVal.toFixed(precision)}%`;
}
