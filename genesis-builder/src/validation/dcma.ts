import type { Project } from '../core/model/types';

export interface DCMACheck {
    id: number;
    name: string;
    value: number;
    threshold: number;
    pass: boolean;
    offenders: string[];
}

export function runDCMA(p: Project): DCMACheck[] {
    const tasks = p.activities.filter(a => a.type === 'task');
    const total = tasks.length;
    if (total === 0) return [];

    // 1. Logic (missing pred or succ)
    const hasPred = new Set(p.relationships.map(r => r.succId));
    const hasSucc = new Set(p.relationships.map(r => r.predId));
    const noLogic = tasks.filter(a => !hasPred.has(a.id) || !hasSucc.has(a.id));

    // 2. Leads (negative lags)
    const negativeLags = p.relationships.filter(r => r.lagDays < 0);

    // 3. Lags (positive lags)
    const positiveLags = p.relationships.filter(r => r.lagDays > 0);

    // 4. Rel Types (FS)
    const fsRels = p.relationships.filter(r => r.type === 'FS');

    // 5. Hard Constraints
    const hardCstr = tasks.filter(a => ['MSO', 'MFO', 'SNET', 'FNLT'].includes(a.constraint?.kind || ''));

    // 6. High Float
    const highFloat = tasks.filter(a => a.totalFloatMin > 44 * 24 * 60);

    // 7. Negative Float
    const negativeFloat = tasks.filter(a => a.totalFloatMin < 0);

    // 8. High Duration
    const highDur = tasks.filter(a => a.durationDays > 44 * 100);

    return [
        { id: 1, name: 'Logic (Missing links)', value: (noLogic.length / total) * 100, threshold: 5, pass: (noLogic.length / total) * 100 <= 5, offenders: noLogic.map(a => a.id) },
        { id: 2, name: 'Leads (Negative lag)', value: negativeLags.length, threshold: 0, pass: negativeLags.length === 0, offenders: [] },
        { id: 3, name: 'Lags (Positive lag)', value: p.relationships.length > 0 ? (positiveLags.length / p.relationships.length) * 100 : 0, threshold: 5, pass: p.relationships.length > 0 ? (positiveLags.length / p.relationships.length) * 100 <= 5 : true, offenders: [] },
        { id: 4, name: 'FS Relationships', value: p.relationships.length > 0 ? (fsRels.length / p.relationships.length) * 100 : 100, threshold: 90, pass: p.relationships.length > 0 ? (fsRels.length / p.relationships.length) * 100 >= 90 : true, offenders: [] },
        { id: 5, name: 'Hard Constraints', value: (hardCstr.length / total) * 100, threshold: 5, pass: (hardCstr.length / total) * 100 <= 5, offenders: hardCstr.map(a => a.id) },
        { id: 6, name: 'High Float (>44d)', value: (highFloat.length / total) * 100, threshold: 5, pass: (highFloat.length / total) * 100 <= 5, offenders: highFloat.map(a => a.id) },
        { id: 7, name: 'Negative Float', value: negativeFloat.length, threshold: 0, pass: negativeFloat.length === 0, offenders: negativeFloat.map(a => a.id) },
        { id: 8, name: 'High Duration (>44d)', value: (highDur.length / total) * 100, threshold: 5, pass: (highDur.length / total) * 100 <= 5, offenders: highDur.map(a => a.id) }
    ];
}
