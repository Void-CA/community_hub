import type { SubjectFiltersProps } from '../shared/types';
import styles from './SubjectFilters.module.css';

export function SubjectFilters({
  schedulePeriods,
  activePeriodId,
  subjectName,
  totalEntries,
  sessionCount,
}: SubjectFiltersProps) {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.section}>
          <span className={styles.label}>
            <span>Periodo</span>
          </span>
          <select
            id="period-select"
            className={styles.select}
            defaultValue={activePeriodId}
            onChange={(e) => {
              const value = e.target.value;
              const [year, term] = value.split('-');
              const nextUrl = new URL(window.location.href);
              nextUrl.searchParams.set('year', year ?? '');
              nextUrl.searchParams.set('term', term ?? '');
              window.location.assign(nextUrl.toString());
            }}
          >
            {schedulePeriods.map((period) => (
              <option
                key={period.id}
                value={period.id}
                selected={period.id === activePeriodId}
              >
                {period.label}
              </option>
            ))}
          </select>
        </div>

        <div className={`${styles.section} ${styles.flex1}`}>
          <span className={styles.hint}>Asignatura Activa</span>
          <p className={styles.subjectName}>{subjectName || 'Sin selección'}</p>
        </div>

        <div className={styles.divider} />

        <div className={styles.stats}>
          <div className={styles.statBubble}>
            <span>{totalEntries}</span>
            <label>Totales</label>
          </div>
          <div className={styles.statBubble}>
            <span>{sessionCount}</span>
            <label>Sesiones</label>
          </div>
        </div>
      </div>
    </div>
  );
}
