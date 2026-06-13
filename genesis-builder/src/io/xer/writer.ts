import type { Project } from '../../core/model/types';
import { XER_TABLES } from './tables';

export function formatXERDate(minutes: number): string {
    const d = new Date(new Date('2000-01-01T00:00:00Z').getTime() + minutes * 60000);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

export function writeXER(project: Project): string {
    let out = `ERMHDR\t19.12\t2024-01-01\tProject\tadmin\tGENESIS\tdbxDatabaseNoName\tProject Management\tUSD\r\n`;

    // CURRTYPE
    out += `%T\tCURRTYPE\r\n%F\t${XER_TABLES.CURRTYPE.join('\t')}\r\n`;
    out += `%R\t1\t2\tUSD\t$\r\n`;

    // PROJECT
    out += `%T\tPROJECT\r\n%F\t${XER_TABLES.PROJECT.join('\t')}\r\n`;
    out += `%R\t1\t${project.meta.name}\t${formatXERDate(project.meta.projectStart * 24 * 60)}\t\t\t100\r\n`;

    // TASK
    if (project.activities.length > 0) {
        out += `%T\tTASK\r\n%F\t${XER_TABLES.TASK.join('\t')}\r\n`;
        project.activities.forEach((a, i) => {
            const taskId = 10000 + i;
            const es = formatXERDate(a.es);
            const ef = formatXERDate(a.ef);
            const ls = formatXERDate(a.ls);
            const lf = formatXERDate(a.lf);
            out += `%R\t${taskId}\t1\t1000\t100\t${a.code}\t${a.name}\tTT_Task\tDT_FixedDUR2\tTK_NotStart\t${a.durationDays * 8 / 100}\t\t\t${es}\t${ef}\t${ls}\t${lf}\t${a.totalFloatMin / 60}\t${a.freeFloatMin / 60}\t\t\t\tCP_Drtn\r\n`;
        });
    }

    // TASKPRED
    if (project.relationships.length > 0) {
        out += `%T\tTASKPRED\r\n%F\t${XER_TABLES.TASKPRED.join('\t')}\r\n`;
        const actIds = project.activities.map(a => a.id);
        project.relationships.forEach((r, i) => {
            const predIndex = actIds.indexOf(r.predId);
            const succIndex = actIds.indexOf(r.succId);
            if (predIndex !== -1 && succIndex !== -1) {
                out += `%R\t${20000 + i}\t${10000 + succIndex}\t${10000 + predIndex}\t1\t1\tPR_${r.type}\t${r.lagDays * 8 / 100}\r\n`;
            }
        });
    }

    out += `%E\r\n`;
    return out;
}
