import type { Calendar, DayStamp, ScaledQty } from '../../core/model/types';
import { } from '../../core/num/scaled';

// 2000-01-01 was a Saturday (Day 6 in P6 where 0=Sunday)
export function getWeekday(d: DayStamp): number {
  return (d + 6) % 7;
}

export function isWorkingDay(cal: Calendar, d: DayStamp): boolean {
  // Check exceptions first
  for (const ex of cal.exceptions) {
    if (ex.date === d) return ex.working;
  }
  const wd = getWeekday(d);
  return cal.week[wd]?.working ?? false;
}

// Simple linear scan for MVP, scale up to index if needed
export function addWorkingDays(cal: Calendar, start: DayStamp, daysS2: ScaledQty): DayStamp {
  let remainingS2 = daysS2;
  let currentDay = start;

  if (remainingS2 === 0) return currentDay;

  const dir = remainingS2 > 0 ? 1 : -1;
  remainingS2 = Math.abs(remainingS2);

  // If starting on a working day, that counts as the first day for positive durations
  if (dir > 0 && isWorkingDay(cal, currentDay)) {
    remainingS2 -= 100; // 1 day S2
    if (remainingS2 <= 0) return currentDay;
  }

  while (remainingS2 > 0) {
    currentDay += dir;
    if (isWorkingDay(cal, currentDay)) {
      remainingS2 -= 100;
    }
  }

  return currentDay;
}

export function workingDaysBetween(cal: Calendar, a: DayStamp, b: DayStamp): ScaledQty {
  let days = 0;
  const dir = b >= a ? 1 : -1;
  let curr = a;
  while (curr !== b) {
    curr += dir;
    if (isWorkingDay(cal, curr)) days += 100;
  }
  return dir === 1 ? days : -days;
}

export function nextWorkingDay(cal: Calendar, d: DayStamp, dir: 1|-1): DayStamp {
  let curr = d;
  for (let i = 0; i < 366; i++) {
    curr += dir;
    if (isWorkingDay(cal, curr)) return curr;
  }
  throw new Error("CAL-DEAD: No working days found in 365 day window.");
}
