import type { Activity, Relationship, Calendar, DayStamp } from '../../core/model/types';
import { addWorkingDays, nextWorkingDay, isWorkingDay } from '../calendar/calendar';
import { topologicalSort } from './topo';

function getCal(id: string, cals: Calendar[]) {
  return cals.find(c => c.id === id)!;
}

export function runCPM(activities: Activity[], relationships: Relationship[], calendars: Calendar[], projectStart: DayStamp, mustFinishBy: DayStamp | null): void {
  const { sorted, error } = topologicalSort(activities, relationships);
  if (error) {
    console.error("Cycle detected", error);
    return;
  }

  const actMap = new Map(activities.map(a => [a.id, a]));
  const predsMap = new Map<string, Relationship[]>();
  const succsMap = new Map<string, Relationship[]>();

  activities.forEach(a => {
    predsMap.set(a.id, []);
    succsMap.set(a.id, []);
  });

  relationships.forEach(r => {
    if (predsMap.has(r.succId)) predsMap.get(r.succId)!.push(r);
    if (succsMap.has(r.predId)) succsMap.get(r.predId)!.push(r);
  });

  // Forward Pass
  for (const id of sorted) {
    const a = actMap.get(id);
    if (!a) continue;

    const cal = getCal(a.calendarId, calendars);
    const esCandidates = [projectStart];

    for (const rel of predsMap.get(id) || []) {
      const pred = actMap.get(rel.predId);
      if (!pred) continue;

      const predEF_days = pred.ef / (24*60);
      const predES_days = pred.es / (24*60);

      let c = projectStart;
      if (rel.type === 'FS') c = nextWorkingDay(cal, predEF_days, 1) + (rel.lagDays/100);
      if (rel.type === 'SS') c = predES_days + (rel.lagDays/100);

      esCandidates.push(c);
    }

    let es = Math.max(...esCandidates);
    if (a.constraint?.kind === 'SNET' || a.constraint?.kind === 'MSO') {
      es = Math.max(es, a.constraint.date);
    }

    if (!isWorkingDay(cal, es)) {
        es = nextWorkingDay(cal, es, 1);
    }

    a.es = es * 24 * 60;
    const durDays = a.durationDays / 100;
    const ef = durDays === 0 ? es : addWorkingDays(cal, es, a.durationDays);
    a.ef = ef * 24 * 60;
  }

  // Backward pass setup
  const projectFinish = Math.max(...activities.map(a => a.ef / (24*60)));
  const anchor = mustFinishBy ? Math.max(projectFinish, mustFinishBy) : projectFinish;

  for (let i = sorted.length - 1; i >= 0; i--) {
    const id = sorted[i];
    if (!id) continue;

    const a = actMap.get(id);
    if (!a) continue;

    const cal = getCal(a.calendarId, calendars);

    const lfCandidates = [anchor];
    for (const rel of succsMap.get(id) || []) {
        const succ = actMap.get(rel.succId);
        if (!succ) continue;

        const succLS_days = succ.ls / (24*60);
        let c = anchor;
        if (rel.type === 'FS') c = nextWorkingDay(cal, succLS_days, -1) - (rel.lagDays/100);
        lfCandidates.push(c);
    }

    const lf = Math.min(...lfCandidates);
    a.lf = lf * 24 * 60;
    const durDays = a.durationDays / 100;
    const ls = durDays === 0 ? lf : addWorkingDays(cal, lf, -a.durationDays);
    a.ls = ls * 24 * 60;

    a.totalFloatMin = a.lf - a.ef;
    a.freeFloatMin = a.totalFloatMin;
    a.critical = a.totalFloatMin <= 0;
  }
}
