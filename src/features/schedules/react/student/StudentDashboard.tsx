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
  const [isCatalogOpen, setIsCatalogOpen] = useState(true);

  // The core hook manages all selection/filter state
  const {
    major,
    year,
    selectedIds,
    visibleSections,
    selectedSections,
    ghostedSections,
    sessionCount,
    setMajor,
    setYear,
    toggleSection,
  } = useScheduleState(allSections, initialMajor, initialYear);

  const toggleCatalog = () => setIsCatalogOpen((prev) => !prev);

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
        <div className={`${styles.layout} ${isCatalogOpen ? styles.catalogOpen : styles.catalogClosed}`}>
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
              isCatalogOpen={isCatalogOpen}
              onToggleCatalog={toggleCatalog}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
