import { useState, useEffect, useCallback } from 'react';
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
 *
 * The catalog is now an OVERLAY panel that slides in from the left, leaving
 * the schedule with full focus at all times.
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
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

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

  const openCatalog = useCallback(() => setIsCatalogOpen(true), []);
  const closeCatalog = useCallback(() => setIsCatalogOpen(false), []);
  const toggleCatalog = useCallback(
    () => setIsCatalogOpen((prev) => !prev),
    [],
  );

  // Close on Escape key
  useEffect(() => {
    if (!isCatalogOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCatalog();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isCatalogOpen, closeCatalog]);

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
        {/* Backdrop */}
        {isCatalogOpen && (
          <div
            className={styles.backdrop}
            onClick={closeCatalog}
            aria-hidden="true"
          />
        )}

        {/* Overlay catalog panel */}
        <div
          className={`${styles.overlay} ${isCatalogOpen ? styles.overlayOpen : ''}`}
          aria-label="Catálogo de asignaturas"
          aria-hidden={!isCatalogOpen}
        >
          <button
            className={styles.closeButton}
            onClick={closeCatalog}
            aria-label="Cerrar catálogo"
            type="button"
          >
            ✕
          </button>
          <StudentCatalog
            visibleSections={visibleSections}
            selectedIds={selectedIds}
            ghostedSections={ghostedSections}
            onToggleSection={toggleSection}
          />
        </div>

        {/* Timeline — always full width */}
        <div className={styles.layout}>
          <StudentTimeline
            selectedSections={selectedSections}
            activeDays={activeDays}
            scheduleBlocks={scheduleBlocks}
            isCatalogOpen={isCatalogOpen}
            onToggleCatalog={toggleCatalog}
          />
        </div>
      </section>
    </div>
  );
}
