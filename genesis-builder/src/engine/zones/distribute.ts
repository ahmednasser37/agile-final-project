import type { Zone, ScaledQty } from '../../core/model/types';
import { sSum, sSub } from '../../core/num/scaled';

export function distributeProportional(qtyS3: ScaledQty, zones: Zone[]): ScaledQty[] {
  if (zones.length === 0) return [];
  const totalWeight = sSum(zones.map(z => z.weight));
  if (totalWeight === 0) return zones.map(() => 0);

  const shares = zones.map(z => {
      const exact = (qtyS3 * z.weight) / totalWeight;
      return { val: Math.floor(exact), remainder: exact - Math.floor(exact) };
  });

  const sum = sSum(shares.map(s => s.val));
  const remainder = sSub(qtyS3, sum);

  // Largest remainder method
  const indices = shares.map((_, i) => i).sort((a, b) => {
      const bRem = shares[b]?.remainder ?? 0;
      const aRem = shares[a]?.remainder ?? 0;
      return bRem - aRem;
  });

  for (let i = 0; i < remainder; i++) {
      const idx = indices[i % indices.length];
      if (idx !== undefined && shares[idx]) {
          shares[idx]!.val += 1;
      }
  }

  return shares.map(s => s.val);
}
