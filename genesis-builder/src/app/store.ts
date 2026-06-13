import { create } from 'zustand';
import type { Project } from '../core/model/types';
import { createProject } from '../core/model/factory';
import { runCPM } from '../engine/cpm/cpm';

interface AppState {
  project: Project;
  updateProject: (fn: (p: Project) => void) => void;
  recompute: () => void;
}

export const useStore = create<AppState>((set) => ({
  project: createProject({ name: 'Initial Project' }),
  updateProject: (fn) => set((state) => {
    const next = JSON.parse(JSON.stringify(state.project));
    fn(next);
    return { project: next };
  }),
  recompute: () => set((state) => {
    const next = JSON.parse(JSON.stringify(state.project));
    if (next.activities.length > 0 && next.calendars.length > 0) {
      runCPM(next.activities, next.relationships, next.calendars, next.meta.projectStart, next.meta.mustFinishBy);
    }
    return { project: next };
  })
}));
