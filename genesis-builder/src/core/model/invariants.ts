import type { Project } from './types';
import { sSum } from '../num/scaled';

export function checkInvariants(p: Project): void {
  // 1. Exactly one WBS root
  const roots = p.wbs.filter(n => n.parentId === null);
  if (roots.length !== 1 && p.wbs.length > 0) throw new Error("Invariant failed: Must have exactly one WBS root");

  // 2. Activity.code unique, wbsId exists, calendarId exists
  const codes = new Set();
  const wbsIds = new Set(p.wbs.map(w => w.id));
  const calIds = new Set(p.calendars.map(c => c.id));
  for (const a of p.activities) {
    if (codes.has(a.code)) throw new Error(`Invariant failed: Duplicate activity code ${a.code}`);
    codes.add(a.code);
    if (!wbsIds.has(a.wbsId)) throw new Error(`Invariant failed: Activity ${a.code} has missing WBS ${a.wbsId}`);
    if (!calIds.has(a.calendarId)) throw new Error(`Invariant failed: Activity ${a.code} has missing Calendar ${a.calendarId}`);
  }

  // 3. Relationships endpoints exist, no self-loop
  const actIds = new Set(p.activities.map(a => a.id));
  const relKeys = new Set();
  for (const r of p.relationships) {
    if (!actIds.has(r.predId) || !actIds.has(r.succId)) throw new Error(`Invariant failed: Relationship missing endpoints`);
    if (r.predId === r.succId) throw new Error(`Invariant failed: Self-loop relationship`);
    const key = `${r.predId}-${r.succId}-${r.type}`;
    if (relKeys.has(key)) throw new Error(`Invariant failed: Duplicate relationship ${key}`);
    relKeys.add(key);
  }

  // 4. BOQ Qty matching
  for (const item of p.boq) {
    if (item.mappingStatus === 'mapped') {
      const acts = p.activities.filter(a => a.boqItemId === item.id && a.qty !== null);
      const sum = sSum(acts.map(a => a.qty!));
      if (sum !== item.qty) {
         throw new Error(`Invariant failed: BOQ Item ${item.itemCode} qty mismatch. Expected ${item.qty}, got ${sum}`);
      }
    }
  }

  // 6. Milestone activities
  for (const a of p.activities) {
    if (a.type === 'start_milestone' || a.type === 'finish_milestone') {
      if (a.durationDays !== 0) throw new Error(`Invariant failed: Milestone ${a.code} must have duration 0`);
      const hasAssig = p.assignments.some(asg => asg.activityId === a.id);
      if (hasAssig) throw new Error(`Invariant failed: Milestone ${a.code} cannot have assignments`);
    }
  }
}
