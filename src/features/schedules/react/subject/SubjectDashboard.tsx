import { useEffect, useCallback } from 'react';
import { useSubjectState } from './hooks/useSubjectState';
import { SubjectFilters } from './SubjectFilters';
import { SubjectCatalog } from './SubjectCatalog';
import { SubjectTimeline } from './SubjectTimeline';
import type { SubjectDashboardProps } from '../shared/types';
import styles from './SubjectDashboard.module.css';

export function SubjectDashboard({
  subjectNames,
  subjectSchedules,
  initialSubject,
  activeDays,
  scheduleBlocks,
  schedulePeriods,
  activePeriodId,
}: SubjectDashboardProps) {
  const {
    selectedSubject,
    searchQuery,
    currentPage,
    totalPages,
    visibleNames,
    filteredCount,
    sessionCount,
    totalEntries,
    isCatalogOpen,
    selectSubject,
    setSearchQuery,
    setCurrentPage,
    openCatalog,
    closeCatalog,
    toggleCatalog,
  } = useSubjectState(
    subjectNames,
    subjectSchedules,
    initialSubject,
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
    <div className={styles.dashboard}>
      <SubjectFilters
        schedulePeriods={schedulePeriods}
        activePeriodId={activePeriodId}
        subjectName={selectedSubject}
        totalEntries={totalEntries}
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
          <SubjectCatalog
            visibleNames={visibleNames}
            totalCount={filteredCount}
            subjectSchedules={subjectSchedules}
            selectedSubject={selectedSubject}
            onSelectSubject={selectSubject}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            isCatalogOpen={isCatalogOpen}
          />
        </div>

        {/* Timeline — always full width */}
        <div className={styles.layout}>
          <SubjectTimeline
            selectedSubject={selectedSubject}
            subjectSchedules={subjectSchedules}
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
