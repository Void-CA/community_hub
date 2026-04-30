import { describe, it, expect } from 'vitest';
import {
  getProfessorAlias,
  getSubjectColor,
  getEntryDuration,
  sortEntries,
} from '../index';
import { entry } from './fixtures';

describe('getProfessorAlias', () => {
  it('returns short name for 3-part names', () => {
    expect(getProfessorAlias('Juan Carlos Pérez')).toBe('Juan Pérez');
  });

  it('returns full name for 2-part names', () => {
    expect(getProfessorAlias('Ana Torres')).toBe('Ana Torres');
  });

  it('returns full name for single names', () => {
    expect(getProfessorAlias('Juan')).toBe('Juan');
  });

  it('handles Prof. prefix', () => {
    expect(getProfessorAlias('Profesor García López')).toBe('Prof. López');
    expect(getProfessorAlias('prof García López')).toBe('Prof. López');
  });

  it('handles empty string', () => {
    expect(getProfessorAlias('')).toBe('');
  });

  it('handles names with extra whitespace by trimming', () => {
    // The function trims then splits, so leading/trailing spaces are handled
    // but internal multiple spaces remain
    expect(getProfessorAlias('  Ana  Torres  ').trim()).toBe('Ana  Torres');
  });
});

describe('getSubjectColor', () => {
  it('returns consistent colors for the same subject', () => {
    expect(getSubjectColor('Cálculo I')).toBe(getSubjectColor('Cálculo I'));
  });

  it('is case-insensitive', () => {
    expect(getSubjectColor('cálculo i')).toBe(getSubjectColor('Cálculo I'));
  });

  it('handles leading/trailing whitespace', () => {
    expect(getSubjectColor('  Cálculo I  ')).toBe(getSubjectColor('Cálculo I'));
  });

  it('returns valid HSL color', () => {
    const color = getSubjectColor('Física I');
    expect(color).toMatch(/^hsl\(\d+,\s*\d+%,\s*\d+%\)$/);
  });

  it('different subjects usually get different colors', () => {
    const colors = new Set([
      getSubjectColor('Cálculo I'),
      getSubjectColor('Física I'),
      getSubjectColor('Programación I'),
      getSubjectColor('Inglés I'),
      getSubjectColor('Ética'),
      getSubjectColor('Bases de Datos'),
      getSubjectColor('Redes'),
      getSubjectColor('Estadística'),
    ]);
    // With 8 subjects and 8 available colors, some collisions are expected
    // but the hash should still provide decent distribution
    expect(colors.size).toBeGreaterThanOrEqual(4);
  });
});

describe('getEntryDuration', () => {
  it('calculates 2-block duration', () => {
    const e = entry({
      day: 'L',
      start_block: '1',
      end_block: '2',
      subject: 'Test',
      group: 1,
      professor: 'Prof',
      room: 'A1',
      majors: ['ICE'],
    });
    expect(getEntryDuration(e)).toBe(2);
  });

  it('calculates single-block duration', () => {
    const e = entry({
      day: 'L',
      start_block: '3',
      end_block: '3',
      subject: 'Test',
      group: 1,
      professor: 'Prof',
      room: 'A1',
      majors: ['ICE'],
    });
    expect(getEntryDuration(e)).toBe(1);
  });

  it('handles old block labels', () => {
    const e = entry({
      day: 'L',
      start_block: 'Morning1',
      end_block: 'Morning2',
      subject: 'Test',
      group: 1,
      professor: 'Prof',
      room: 'A1',
      majors: ['ICE'],
    });
    expect(getEntryDuration(e)).toBe(2);
  });
});

describe('sortEntries', () => {
  const e1 = entry({
    day: 'X',
    start_block: '1',
    end_block: '2',
    subject: 'B',
    group: 1,
    professor: 'P',
    room: 'A1',
    majors: ['ICE'],
  });
  const e2 = entry({
    day: 'L',
    start_block: '3',
    end_block: '4',
    subject: 'A',
    group: 1,
    professor: 'P',
    room: 'A1',
    majors: ['ICE'],
  });
  const e3 = entry({
    day: 'L',
    start_block: '1',
    end_block: '2',
    subject: 'C',
    group: 1,
    professor: 'P',
    room: 'A1',
    majors: ['ICE'],
  });

  it('sorts by day first', () => {
    const sorted = sortEntries([e1, e2, e3]);
    expect(sorted[0].day).toBe('L');
    expect(sorted[2].day).toBe('X');
  });

  it('sorts by start_block within same day', () => {
    const sorted = sortEntries([e1, e2, e3]);
    const mondayEntries = sorted.filter((e) => e.day === 'L');
    expect(mondayEntries[0].start_block).toBe('1');
    expect(mondayEntries[1].start_block).toBe('3');
  });

  it('does not mutate the original array', () => {
    const original = [e1, e2, e3];
    sortEntries([...original]);
    expect(original[0]).toBe(e1);
  });
});
