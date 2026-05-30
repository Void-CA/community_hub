import type {
  ScheduleSection,
  ScheduleEntry,
  OverlapConflict,
  ScheduleBlock,
  DayItem,
} from '@/lib/schedules/types';

export type { ScheduleSection, ScheduleEntry, OverlapConflict };

export interface ScheduleBlockItem {
  type: string;
  label: string;
  range: string;
}

export interface ActiveDay {
  code: string;
  label: string;
}

export interface SchedulePeriod {
  id: string;
  year: string;
  term: string;
  label: string;
}

export interface StudentDashboardProps {
  allSections: ScheduleSection[];
  initialMajor: string;
  initialYear: number;
  activeDays: ActiveDay[];
  scheduleBlocks: readonly ScheduleBlockItem[];
  integrityError?: boolean;
  schedulePeriods: SchedulePeriod[];
  activePeriodId: string;
  periodMajors: string[];
  periodYears: number[];
}

export interface ScheduleFiltersProps {
  schedulePeriods: SchedulePeriod[];
  activePeriodId: string;
  periodMajors: string[];
  major: string;
  onMajorChange: (major: string) => void;
  periodYears: number[];
  year: string;
  onYearChange: (year: string) => void;
  selectedCount: number;
  sessionCount: number;
}

export interface ScheduleCatalogProps {
  visibleSections: ScheduleSection[];
  selectedIds: Set<string>;
  ghostedSections: Set<string>;
  onToggleSection: (sectionId: string, subject: string) => void;
}

export interface ScheduleTimelineProps {
  selectedSections: ScheduleSection[];
  activeDays: ActiveDay[];
  scheduleBlocks: readonly ScheduleBlockItem[];
  isCatalogOpen: boolean;
  onToggleCatalog: () => void;
}

export interface ScheduleTileProps {
  entry: ScheduleEntry;
  sectionId: string;
  label?: string;
  hasConflict?: boolean;
  variant?: 'student' | 'professor';
  isCompact?: boolean;
}

export interface ConflictMap {
  get(key: string): OverlapConflict[] | undefined;
}
