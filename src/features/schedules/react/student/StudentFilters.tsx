import type { ScheduleFiltersProps } from '../shared/types';
import styles from './StudentFilters.module.css';

export function StudentFilters({
  schedulePeriods,
  activePeriodId,
  periodMajors,
  major,
  onMajorChange,
  periodYears,
  year,
  onYearChange,
  selectedCount,
  sessionCount,
}: ScheduleFiltersProps) {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.section}>
          <label className={styles.label}>
            <span>Periodo</span>
            <select
              id="period-select"
              className={styles.select}
              defaultValue={activePeriodId}
              onChange={(e) => {
                const selected = e.target.value;
                const [yearVal, term] = selected.split('-');
                const nextUrl = new URL(window.location.href);
                nextUrl.searchParams.set('year', yearVal ?? '');
                nextUrl.searchParams.set('term', term ?? '');
                window.location.assign(nextUrl.toString());
              }}
            >
              {schedulePeriods.map((period) => (
                <option key={period.id} value={period.id}>
                  {period.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className={`${styles.section} ${styles.flex1}`}>
          <label className={styles.label}>
            <span>Carrera</span>
            <select
              className={`${styles.select} ${styles.majorSelect}`}
              value={major}
              onChange={(e) => onMajorChange(e.target.value)}
            >
              <option value="all">Todas las carreras</option>
              {periodMajors.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className={styles.section}>
          <span className={styles.hint}>Año Académico</span>
          <div className={styles.yearSelector}>
            {periodYears.map((y) => (
              <button
                key={y}
                type="button"
                className={`${styles.yearChip} ${String(y) === year ? styles.yearChipActive : ''}`}
                data-year-button
                data-year={String(y)}
                onClick={() => onYearChange(String(y))}
              >
                {y}°
              </button>
            ))}
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.stats}>
          <div className={styles.statBubble}>
            <span>{selectedCount}</span>
            <label>Materias</label>
          </div>
          <div className={styles.statBubble}>
            <span>{sessionCount}</span>
            <label>Bloques</label>
          </div>
        </div>
      </div>
    </div>
  );
}
