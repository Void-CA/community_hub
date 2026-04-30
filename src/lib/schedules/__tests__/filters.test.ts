import { describe, it, expect } from 'vitest';
import { filterEntries, filterScheduleSections, buildScheduleSections } from '../index';
import { entry, section, entries as fx } from './fixtures';

describe('filterEntries', () => {
  const allEntries = [
    fx.calculo1_L1,
    fx.calculo1_L2,
    fx.fisica1_M1,
    fx.ingles1_L1,
  ];

  it('filters by major', () => {
    const result = filterEntries(allEntries, { major: 'ICE' });
    expect(result).toHaveLength(3);
    expect(result.every((e) => e.majors.includes('ICE'))).toBe(true);
  });

  it('filters by group', () => {
    const result = filterEntries(allEntries, { group: 1 });
    expect(result.every((e) => e.group === 1)).toBe(true);
  });

  it('filters by day', () => {
    const result = filterEntries(allEntries, { day: 'L' });
    expect(result.every((e) => e.day === 'L')).toBe(true);
  });

  it('combines multiple filters', () => {
    const result = filterEntries(allEntries, { major: 'ICE', day: 'L' });
    // calculo1_L1 and calculo1_L2 are ICE + Monday
    expect(result).toHaveLength(2);
    expect(result.every((e) => e.majors.includes('ICE') && e.day === 'L')).toBe(true);
  });

  it('returns all entries when no filters', () => {
    expect(filterEntries(allEntries, {})).toHaveLength(4);
  });
});

describe('filterScheduleSections', () => {
  const sections = [
    section('Cálculo I::G1', [fx.calculo1_L1]),
    section('Física I::G1', [fx.fisica1_M1]),
    section('Inglés I::G1', [fx.ingles1_L1]),
  ];

  it('filters by major', () => {
    const result = filterScheduleSections(sections, { major: 'ICE' });
    expect(result).toHaveLength(2);
  });

  it('filters by year', () => {
    const result = filterScheduleSections(sections, { year: '1' });
    expect(result).toHaveLength(3);
  });

  it('filters by search (subject)', () => {
    const result = filterScheduleSections(sections, { search: 'cálculo' });
    expect(result).toHaveLength(1);
    expect(result[0]!.subject).toBe('Cálculo I');
  });

  it('filters by search (professor)', () => {
    const result = filterScheduleSections(sections, { search: 'carlos' });
    expect(result).toHaveLength(1);
    expect(result[0]!.subject).toBe('Física I');
  });

  it('filters by search (room)', () => {
    const result = filterScheduleSections(sections, { search: 'D401' });
    expect(result).toHaveLength(1);
    expect(result[0]!.subject).toBe('Inglés I');
  });

  it('combines major + search', () => {
    const result = filterScheduleSections(sections, { major: 'ICE', search: 'física' });
    expect(result).toHaveLength(1);
  });

  it('returns all when filters empty', () => {
    expect(filterScheduleSections(sections, {})).toHaveLength(3);
  });
});

describe('buildScheduleSections', () => {
  it('groups entries by subject + group', () => {
    const secs = buildScheduleSections([fx.calculo1_L1, fx.calculo1_X1]);
    expect(secs).toHaveLength(1);
    expect(secs[0]!.id).toBe('Cálculo I::G1');
    expect(secs[0]!.entries).toHaveLength(2);
  });

  it('separates different groups of the same subject', () => {
    const secs = buildScheduleSections([fx.calculo1_L1, fx.calculo2_L1]);
    expect(secs).toHaveLength(2);
    expect(secs.map((s) => s.group)).toContain(1);
    expect(secs.map((s) => s.group)).toContain(2);
  });

  it('merges multiple professors when same section has different teachers', () => {
    const e2 = { ...fx.calculo1_L1, professor: 'Otro Profesor', room: 'A101' };
    const secs = buildScheduleSections([fx.calculo1_L1, e2]);
    expect(secs[0]!.professor).toBe('Juan Pérez / Otro Profesor');
  });

  it('merges multiple rooms when same section has different classrooms', () => {
    const e2 = { ...fx.calculo1_L1, room: 'A102', professor: 'Juan Pérez' };
    const secs = buildScheduleSections([fx.calculo1_L1, e2]);
    expect(secs[0]!.room).toBe('A101 / A102');
  });

  it('collects unique majors', () => {
    const e2 = { ...fx.calculo1_L1, majors: ['IMS'] as string[] };
    const secs = buildScheduleSections([fx.calculo1_L1, e2]);
    expect(secs[0]!.majors).toEqual(['ICE', 'IMS']);
  });

  it('sorts entries within sections', () => {
    const secs = buildScheduleSections([fx.calculo1_X1, fx.calculo1_L1, fx.calculo1_L2]);
    const sectionEntries = secs[0]!.entries;
    expect(sectionEntries[0]!.day).toBe('L');
    expect(sectionEntries[2]!.day).toBe('X');
  });
});
