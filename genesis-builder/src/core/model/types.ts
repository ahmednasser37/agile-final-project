export type DayStamp = number;
export type MinuteStamp = number;
export type ScaledQty = number;

export interface Project {
  schemaVersion: 1;
  id: string;
  meta: ProjectMeta;
  codingProfile: CodingProfile;
  calendars: Calendar[];
  defaultCalendarId: string;
  milestones: MilestoneInput[];
  zones: Zone[];
  boq: BOQItem[];
  wbs: WBSNode[];
  activities: Activity[];
  relationships: Relationship[];
  resources: Resource[];
  assignments: Assignment[];
  ratesLocal: RateEntry[];
  llmLog: LLMCallRecord[];
  ui: { stageReached: number; ganttScale: 'day'|'week'|'month' };
}

export interface ProjectMeta {
  name: string;
  longName: string;
  client: string;
  country: 'SA' | 'EG' | 'OTHER';
  projectStart: DayStamp;
  mustFinishBy: DayStamp | null;
  description: string;
  projectType: string;
  createdAt: number;
  updatedAt: number;
}

export interface CodingProfile {
  id: string;
  name: string;
  wbsLevels: WBSLevelDef[];
  wbsSeparator: '.' | '-' | '';
  activityId: {
    prefix: string;
    start: number;
    step: number;
    width: number;
    scope: 'project' | 'per-wbs';
  };
}

export interface WBSLevelDef {
  name: string;
  codeSource: 'manual' | 'zone' | 'discipline' | 'csi-division';
  codeWidth: number;
}

export interface Calendar {
  id: string;
  name: string;
  hoursPerDay: number;
  week: [DayPattern, DayPattern, DayPattern, DayPattern, DayPattern, DayPattern, DayPattern];
  exceptions: CalendarException[];
}

export interface DayPattern { working: boolean; shifts: Shift[] }
export interface Shift { startMin: number; endMin: number }

export interface CalendarException {
  date: DayStamp;
  working: boolean;
  shifts?: Shift[];
  label: string;
}

export interface MilestoneInput {
  id: string;
  name: string;
  kind: 'start'|'finish';
  date: DayStamp;
  hard: boolean;
}

export interface Zone {
  id: string;
  code: string;
  name: string;
  kind: 'chainage' | 'area' | 'floor' | 'building' | 'custom';
  chFrom?: ScaledQty;
  chTo?: ScaledQty;
  weight: ScaledQty;
  sequenceIndex: number;
}

export interface BOQItem {
  id: string;
  srcRef: { kind: 'excel'|'pdf'|'manual'; sheet?: string; row?: number; page?: number };
  itemCode: string;
  description: string;
  unit: string;
  unitNorm: UOM | null;
  qty: ScaledQty;
  section: string;
  extraction: Provenance;
  mappingStatus: 'unmapped'|'mapped'|'excluded';
  excludeReason?: string;
}

export interface WBSNode {
  id: string;
  parentId: string | null;
  code: string;
  name: string;
  levelIndex: number;
  zoneId?: string;
  sortIndex: number;
  provenance: Provenance;
}

export interface Activity {
  id: string;
  code: string;
  name: string;
  wbsId: string;
  type: 'task' | 'start_milestone' | 'finish_milestone' | 'loe';
  calendarId: string;
  boqItemId: string | null;
  logicBankRef: string | null;
  zoneId: string | null;
  qty: ScaledQty | null;
  uom: UOM | null;
  rateResolved: ResolvedRate | null;
  crewCount: number;
  durationDays: ScaledQty;
  durationLock: 'auto' | 'manual';
  constraint: ActivityConstraint | null;
  es: MinuteStamp;
  ef: MinuteStamp;
  ls: MinuteStamp;
  lf: MinuteStamp;
  totalFloatMin: number;
  freeFloatMin: number;
  critical: boolean;
  provenance: Provenance;
}

export interface ActivityConstraint {
  kind: 'SNET' | 'FNLT' | 'SNLT' | 'FNET' | 'MSO' | 'MFO';
  date: DayStamp;
}

export interface Relationship {
  id: string;
  predId: string;
  succId: string;
  type: 'FS' | 'SS' | 'FF' | 'SF';
  lagDays: ScaledQty;
  provenance: Provenance;
}

export interface Resource {
  id: string;
  code: string;
  name: string;
  kind: 'labor_crew' | 'equipment' | 'labor_individual';
  composition: CrewMember[];
  calendarId: string;
}

export interface CrewMember { trade: string; count: number }

export interface Assignment {
  id: string;
  activityId: string;
  resourceId: string;
  units: number;
}

export interface RateEntry {
  id: string;
  match: { csiActivityIds: string[]; keywords: string[]; uom: UOM };
  baseRatePerCrewDay: ScaledQty;
  crew: CrewMember[];
  modifiers: RateModifier[];
  source: { tier: 1|2|3; ref: string };
  locationFactorApplied: boolean;
  notes: string;
}

export interface RateModifier {
  dimension: 'soil'|'depth'|'dia'|'congestion'|'access'|'height'|'custom';
  when: string;
  factor: ScaledQty;
}

export interface ResolvedRate {
  ratePerCrewDay: ScaledQty;
  uom: UOM;
  appliedModifiers: { dimension: string; when: string; factor: ScaledQty }[];
  source: RateEntry['source'];
}

export interface Provenance {
  origin: 'user' | 'ai' | 'import' | 'system';
  confidence: number | null;
  model?: string;
  acceptedByUser: boolean;
  ts: number;
}

export interface LLMCallRecord {
  id: string;
  ts: number;
  type: 'boq_extract'|'boq_map'|'wbs_propose'|'rate_propose'|'logic_review';
  inputTokens: number;
  outputTokens: number;
  durationMs: number;
  ok: boolean;
  error?: string;
}

export type UOM = 'm'|'m2'|'m3'|'kg'|'t'|'nr'|'ls'|'day'|'set';
