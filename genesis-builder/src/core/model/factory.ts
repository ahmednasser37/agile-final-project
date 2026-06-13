import { nanoid } from 'nanoid';
import type { Project, ProjectMeta, CodingProfile, Provenance } from './types';

export function createProject(meta: Partial<ProjectMeta>): Project {
  return {
    schemaVersion: 1,
    id: nanoid(),
    meta: {
      name: meta.name || 'New Project',
      longName: meta.longName || '',
      client: meta.client || '',
      country: meta.country || 'SA',
      projectStart: meta.projectStart || 0,
      mustFinishBy: meta.mustFinishBy || null,
      description: meta.description || '',
      projectType: meta.projectType || '',
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    codingProfile: createDefaultCodingProfile(),
    calendars: [],
    defaultCalendarId: '',
    milestones: [],
    zones: [],
    boq: [],
    wbs: [],
    activities: [],
    relationships: [],
    resources: [],
    assignments: [],
    ratesLocal: [],
    llmLog: [],
    ui: { stageReached: 0, ganttScale: 'week' }
  };
}

export function createDefaultCodingProfile(): CodingProfile {
  return {
    id: nanoid(),
    name: 'GENERIC-CSI',
    wbsLevels: [
      { name: 'Phase', codeSource: 'manual', codeWidth: 2 },
      { name: 'CSI Division', codeSource: 'csi-division', codeWidth: 2 }
    ],
    wbsSeparator: '.',
    activityId: {
      prefix: 'A',
      start: 1000,
      step: 10,
      width: 0,
      scope: 'project'
    }
  };
}

export function createProvenance(origin: Provenance['origin']): Provenance {
  return {
    origin,
    confidence: null,
    acceptedByUser: false,
    ts: Date.now()
  };
}
