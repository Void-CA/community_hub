import { useMemo, useRef, useEffect, useCallback } from 'react';
import { dayOrder } from '@/lib/schedules/constants';
import type { SubjectCatalogProps } from '../shared/types';
import styles from './SubjectCatalog.module.css';

export function SubjectCatalog({
  visibleNames,
  totalCount,
  subjectSchedules,
  selectedSubject,
  onSelectSubject,
  searchQuery,
  onSearchChange,
  currentPage,
  totalPages,
  onPageChange,
  isCatalogOpen,
}: SubjectCatalogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Auto-focus search when catalog opens
  useEffect(() => {
    if (isCatalogOpen && inputRef.current) {
      const timer = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [isCatalogOpen]);

  // Pre-compute workload per subject (for visible names only)
  const workloadMap = useMemo(() => {
    const map = new Map<
      string,
      { groups: number; days: number; byDay: Record<string, number> }
    >();
    for (const name of visibleNames) {
      const schedule = subjectSchedules[name];
      if (!schedule) continue;
      const entries = dayOrder.flatMap(
        (day) => schedule.by_day[day] ?? [],
      );
      const days = new Set(entries.map((e) => e.day)).size;
      const groups = new Set(entries.map((e) => e.group)).size;
      const byDay: Record<string, number> = {};
      for (const day of dayOrder) {
        byDay[day] = (schedule.by_day[day] ?? []).length;
      }
      map.set(name, { groups, days, byDay });
    }
    return map;
  }, [visibleNames, subjectSchedules]);

  const getPageNumbers = useCallback(
    (current: number, total: number): (number | null)[] => {
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
    },
    [],
  );

  const dayCodes = ['L', 'M', 'X', 'J', 'V'];

  // Keyboard navigation: arrow keys to move through list
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>(
        '[data-subject-card]',
      );
      if (!buttons || buttons.length === 0) return;

      const currentIndex = Array.from(buttons).findIndex(
        (btn) => btn.dataset.subject === selectedSubject,
      );

      let nextIndex = -1;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        nextIndex =
          currentIndex < buttons.length - 1 ? currentIndex + 1 : 0;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        nextIndex =
          currentIndex > 0 ? currentIndex - 1 : buttons.length - 1;
      } else if (e.key === 'Enter' && currentIndex >= 0) {
        e.preventDefault();
        onSelectSubject(selectedSubject);
        return;
      }

      if (nextIndex >= 0) {
        const target = buttons[nextIndex];
        const name = target.dataset.subject ?? '';
        target.scrollIntoView({ block: 'nearest' });
        target.focus();
        onSelectSubject(name);
      }
    },
    [selectedSubject, onSelectSubject],
  );

  const hasResults = visibleNames.length > 0;

  return (
    <aside className={styles.catalog} onKeyDown={handleKeyDown}>
      <div className={styles.head}>
        <div>
          <p className={styles.eyebrow}>Catálogo</p>
          <h2>Asignaturas</h2>
        </div>
        <p className={styles.count}>
          <span>{totalCount}</span> disponibles
        </p>
      </div>

      <label className={styles.searchBox}>
        <span className={styles.srOnly}>Buscar asignatura</span>
        <div className={styles.searchInputWrapper}>
          <svg
            className={styles.searchIcon}
            viewBox="0 0 20 20"
            fill="none"
            width="16"
            height="16"
            aria-hidden="true"
          >
            <circle
              cx="9"
              cy="9"
              r="6.5"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M14 14l4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <input
            ref={inputRef}
            type="search"
            placeholder="Buscar por nombre…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={styles.searchInput}
            autoComplete="off"
          />
          {searchQuery && (
            <button
              type="button"
              className={styles.clearButton}
              onClick={() => onSearchChange('')}
              aria-label="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>
      </label>

      {hasResults ? (
        <>
          <div ref={listRef} className={styles.list}>
            {visibleNames.map((name) => {
              const workload = workloadMap.get(name);
              const isSelected = name === selectedSubject;

              return (
                <button
                  key={name}
                  type="button"
                  className={`${styles.card} ${isSelected ? styles.isSelected : ''}`}
                  data-subject-card
                  data-subject={name}
                  aria-pressed={isSelected}
                  onClick={() => onSelectSubject(name)}
                >
                  <div className={styles.cardTop}>
                    <div>
                      <h4>{name}</h4>
                      {workload && (
                        <p className={styles.subtitle}>
                          {workload.groups}{' '}
                          {workload.groups === 1 ? 'grupo' : 'grupos'}{' '}
                          en {workload.days}{' '}
                          {workload.days === 1 ? 'día' : 'días'}
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
        </>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg viewBox="0 0 24 24" fill="none" width="32" height="32" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M16.5 16.5l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <p className={styles.emptyTitle}>
            {searchQuery
              ? `No se encontró "${searchQuery}"`
              : 'Sin resultados'}
          </p>
          <p className={styles.emptyDesc}>
            {searchQuery
              ? 'Probá con otro nombre o término de búsqueda.'
              : 'No hay asignaturas disponibles para este período.'}
          </p>
        </div>
      )}
    </aside>
  );
}
