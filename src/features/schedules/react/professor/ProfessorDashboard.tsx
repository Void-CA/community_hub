import { useEffect, useCallback } from 'react';
import { useProfessorState } from './hooks/useProfessorState';
import { ProfessorFilters } from './ProfessorFilters';
import { ProfessorCatalog } from './ProfessorCatalog';
import { ProfessorTimeline } from './ProfessorTimeline';
import type { ProfessorDashboardProps } from '../shared/types';
import styles from './ProfessorDashboard.module.css';

export function ProfessorDashboard({
  professorNames,
  professorSchedules,
  initialProfessor,
  activeDays,
  scheduleBlocks,
  schedulePeriods,
  activePeriodId,
}: ProfessorDashboardProps) {
  const {
    selectedProfessor,
    searchQuery,
    currentPage,
    totalPages,
    sessionCount,
    totalEntries,
    isCatalogOpen,
    selectProfessor,
    setSearchQuery,
    setCurrentPage,
    openCatalog,
    closeCatalog,
    toggleCatalog,
  } = useProfessorState(
    professorNames,
    professorSchedules,
    initialProfessor,
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
      <ProfessorFilters
        schedulePeriods={schedulePeriods}
        activePeriodId={activePeriodId}
        professorName={selectedProfessor}
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
          aria-label="Catálogo de docentes"
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
          <ProfessorCatalog
            professorNames={professorNames}
            professorSchedules={professorSchedules}
            selectedProfessor={selectedProfessor}
            onSelectProfessor={selectProfessor}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* Timeline — always full width */}
        <div className={styles.layout}>
          <ProfessorTimeline
            selectedProfessor={selectedProfessor}
            professorSchedules={professorSchedules}
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
