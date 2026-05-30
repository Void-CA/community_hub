import { useMemo } from 'react';
import { dayOrder } from '@/lib/schedules/constants';
import type { ProfessorCatalogProps } from '../shared/types';
import styles from './ProfessorCatalog.module.css';

export function ProfessorCatalog({
  professorNames,
  professorSchedules,
  selectedProfessor,
  onSelectProfessor,
  searchQuery,
  onSearchChange,
  currentPage,
  totalPages,
  onPageChange,
}: ProfessorCatalogProps) {
  // Pre-compute workload per professor
  const workloadMap = useMemo(() => {
    const map = new Map<
      string,
      { subjects: number; days: number; byDay: Record<string, number> }
    >();
    for (const name of professorNames) {
      const schedule = professorSchedules[name];
      if (!schedule) continue;
      const entries = dayOrder.flatMap(
        (day) => schedule.by_day[day] ?? [],
      );
      const days = new Set(entries.map((e) => e.day)).size;
      const subjects = new Set(entries.map((e) => e.subject)).size;
      const byDay: Record<string, number> = {};
      for (const day of dayOrder) {
        byDay[day] = (schedule.by_day[day] ?? []).length;
      }
      map.set(name, { subjects, days, byDay });
    }
    return map;
  }, [professorNames, professorSchedules]);

  const getPageNumbers = (current: number, total: number): (number | null)[] => {
    const pages: (number | null)[] = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
      return pages;
    }
    pages.push(1);
    if (current > 3) pages.push(null);
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 2) pages.push(null);
    pages.push(total);
    return pages;
  };

  // Filtered names for the current page
  const pageNames = useMemo(() => {
    const start = (currentPage - 1) * 6;
    return professorNames.slice(start, start + 6);
  }, [professorNames, currentPage]);

  const dayCodes = ['L', 'M', 'X', 'J', 'V'];

  return (
    <aside className={styles.catalog}>
      <div className={styles.head}>
        <div>
          <p className={styles.eyebrow}>Catálogo</p>
          <h2>Docentes</h2>
        </div>
        <p className={styles.count}>
          <span>{professorNames.length}</span> disponibles
        </p>
      </div>

      <label className={styles.searchBox}>
        <span className={styles.srOnly}>Buscar profesor</span>
        <input
          type="search"
          placeholder="Buscar por nombre"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </label>

      <div className={styles.list}>
        {pageNames.map((name) => {
          const workload = workloadMap.get(name);
          const isSelected = name === selectedProfessor;

          return (
            <button
              key={name}
              type="button"
              className={`${styles.card} ${isSelected ? styles.isSelected : ''}`}
              aria-pressed={isSelected}
              onClick={() => onSelectProfessor(name)}
            >
              <div className={styles.cardTop}>
                <div>
                  <h4>{name}</h4>
                  {workload && (
                    <p className={styles.subtitle}>
                      {workload.subjects} {workload.subjects === 1 ? 'materia' : 'materias'} en{' '}
                      {workload.days} {workload.days === 1 ? 'día' : 'días'}
                    </p>
                  )}
                </div>
                <div className={styles.workload}>
                  {dayCodes.map((code) => {
                    const count = workload?.byDay[code] ?? 0;
                    return (
                      <span
                        key={code}
                        className={`${styles.dot} ${count > 0 ? styles.hasLoad : ''} ${count > 3 ? styles.highLoad : ''}`}
                        title={`${count} sesiones`}
                      />
                    );
                  })}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {totalPages > 1 && (
        <nav className={styles.pagination}>
          <button
            type="button"
            className={styles.pageBtn}
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            aria-label="Página anterior"
          >
            <span>‹</span>
          </button>

          {getPageNumbers(currentPage, totalPages).map((p, i) => {
            if (p === null)
              return (
                <span key={`ellipsis-${i}`} className={styles.ellipsis}>
                  …
                </span>
              );
            return (
              <button
                key={p}
                type="button"
                className={`${styles.pageBtn} ${p === currentPage ? styles.isActive : ''}`}
                onClick={() => onPageChange(p)}
              >
                {p}
              </button>
            );
          })}

          <button
            type="button"
            className={styles.pageBtn}
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            aria-label="Página siguiente"
          >
            <span>›</span>
          </button>
        </nav>
      )}
    </aside>
  );
}
