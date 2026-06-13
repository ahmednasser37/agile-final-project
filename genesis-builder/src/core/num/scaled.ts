import type { ScaledQty } from '../model/types';

// Scale 3 (quantities & rates): 1 m3 = 1000
export const SCALE_QTY = 3;
// Scale 2 (durations): 1 day = 100
export const SCALE_DUR = 2;
// Scale 4 (modifier factors): 1.0 = 10000
export const SCALE_FAC = 4;

export function sAdd(a: ScaledQty, b: ScaledQty): ScaledQty {
  return Math.round(a + b);
}

export function sSub(a: ScaledQty, b: ScaledQty): ScaledQty {
  return Math.round(a - b);
}

// Multiplies a qty (S3) by a factor (S4), returning S3
export function sMulFactor(q: ScaledQty, factorS4: ScaledQty): ScaledQty {
  return Math.round((q * factorS4) / Math.pow(10, SCALE_FAC));
}

// Divides a qty (S3) by a rate (S3) to get duration (S2)
// Durations round UP to nearest 0.25d (25 in S2)
export function sDivToDur(qtyS3: ScaledQty, rateS3: ScaledQty): ScaledQty {
  if (rateS3 === 0) throw new Error("Division by zero rate");
  const rawDurS2 = (qtyS3 / rateS3) * Math.pow(10, SCALE_DUR);
  // Round up to nearest 25 (0.25 day)
  return Math.ceil(rawDurS2 / 25) * 25;
}

export function sSum(arr: ScaledQty[]): ScaledQty {
  return arr.reduce((acc, val) => sAdd(acc, val), 0);
}

export function parseToScaled(input: string, scale: number): ScaledQty | null {
  const clean = input.replace(/,/g, '').replace(/٬/g, '').replace(/[٠-٩]/g, d => String.fromCharCode(d.charCodeAt(0) - 1632 + 48));
  const val = parseFloat(clean);
  if (isNaN(val)) return null;
  return Math.round(val * Math.pow(10, scale));
}

export function formatScaled(qty: ScaledQty, scale: number): string {
  return (qty / Math.pow(10, scale)).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: scale });
}
