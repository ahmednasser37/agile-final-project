import { describe, it, expect } from 'vitest';
import { sAdd, sSub, sMulFactor, sDivToDur, sSum, parseToScaled } from '../src/core/num/scaled';

describe('Scaled Integer Math', () => {
  it('parses correctly', () => {
    expect(parseToScaled('123.45', 3)).toBe(123450);
    expect(parseToScaled('1,234.56', 3)).toBe(1234560);
    expect(parseToScaled('١٬٥٠٠.٢٥', 3)).toBe(1500250);
  });

  it('adds and subtracts', () => {
    expect(sAdd(1000, 2000)).toBe(3000);
    expect(sSub(3000, 1500)).toBe(1500);
    expect(sSum([100, 200, 300])).toBe(600);
  });

  it('multiplies by factor', () => {
    expect(sMulFactor(10000, 7500)).toBe(7500); // 10 * 0.75 = 7.5
  });

  it('divides to duration and rounds to 0.25d', () => {
    // Qty = 100 (100000 S3), Rate = 12 (12000 S3) => 100/12 = 8.333d => Ceil 0.25 => 8.50d (850 S2)
    expect(sDivToDur(100000, 12000)).toBe(850);

    // Qty = 10, Rate = 10 => 1d => 100 S2
    expect(sDivToDur(10000, 10000)).toBe(100);

    // Exact 0.25 duration boundary
    // Qty = 2.5 (2500 S3), Rate = 10 (10000 S3) => 0.25d => 25 S2
    expect(sDivToDur(2500, 10000)).toBe(25);
  });
});
