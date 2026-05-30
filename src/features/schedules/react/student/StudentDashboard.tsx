import { useState } from 'react';
import { useScheduleState } from './hooks/useScheduleState';
import { StudentFilters } from './StudentFilters';
import { StudentCatalog } from './StudentCatalog';
import { StudentTimeline } from './StudentTimeline';
import type { StudentDashboardProps } from '../shared/types';
import styles from './StudentDashboard.module.css';

/**
 * Orchestrator for the Student Schedule feature.
 * Receives data from Astro (build-time), manages reactive state via hooks,
 * and renders the three sub-components: Filters, Catalog, Timeline.
 */
export function StudentDashboard({
  allSections,
  initialMajor,
  initialYear,
  activeDays,
  scheduleBlocks,
  integrityError = false,
  schedulePeriods,
  activePeriodId,
  periodMajors,
  periodYears,
}: StudentDashboardProps) {
  const [isZen, setIsZen] = useState(false);

  // The core hook manages all selection/filter state
  const {
    major,
    year,
    selectedIds,
    visibleSections,
    selectedSections,
    conflicts,
    ghostedSections,
    sessionCount,
    setMajor,
    setYear,
    toggleSection,
  } = useScheduleState(allSections, initialMajor, initialYear);

  const toggleZen = () => setIsZen((prev) => !prev);

  return (
    <div id="student-schedule-dashboard" className={styles.dashboard}>
      <StudentFilters
        schedulePeriods={schedulePeriods}
        activePeriodId={activePeriodId}
        periodMajors={periodMajors}
        major={major}
        onMajorChange={setMajor}
        periodYears={periodYears}
        year={year}
        onYearChange={setYear}
        selectedCount={selectedIds.size}
        sessionCount={sessionCount}
      />

      <section className={styles.section}>
        <div className={`${styles.layout} ${isZen ? styles.isZen : ''}`}>
          <div className={styles.explorer}>
            <StudentCatalog
              visibleSections={visibleSections}
              selectedIds={selectedIds}
              ghostedSections={ghostedSections}
              onToggleSection={toggleSection}
            />
          </div>

          <div className={styles.timeline}>
            <StudentTimeline
              selectedSections={selectedSections}
              activeDays={activeDays}
              scheduleBlocks={scheduleBlocks}
              conflicts={conflicts}
              isZen={isZen}
              onToggleZen={toggleZen}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
