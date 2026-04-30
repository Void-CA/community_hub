import { describe, it, expect } from 'vitest';
import { detectConflicts, findValidPath } from '../engine';
import { entry, section } from './fixtures';

describe('detectConflicts', () => {
  it('returns empty map for non-overlapping sections', () => {
    const s1 = section('Cálculo I::G1', [
      entry({
        day: 'L',
        start_block: '1',
        end_block: '2',
        subject: 'Cálculo I',
        group: 1,
        professor: 'P',
        room: 'A1',
        majors: ['ICE'],
      }),
    ]);
    const s2 = section('Física I::G1', [
      entry({
        day: 'M',
        start_block: '1',
        end_block: '2',
        subject: 'Física I',
        group: 1,
        professor: 'P',
        room: 'A1',
        majors: ['ICE'],
      }),
    ]);

    const conflicts = detectConflicts([s1, s2]);
    expect(conflicts.size).toBe(0);
  });

  it('detects overlapping sections of different subjects', () => {
    const s1 = section('Cálculo I::G1', [
      entry({
        day: 'L',
        start_block: '1',
        end_block: '2',
        subject: 'Cálculo I',
        group: 1,
        professor: 'P',
        room: 'A1',
        majors: ['ICE'],
      }),
    ]);
    const s2 = section('Programación I::G1', [
      entry({
        day: 'L',
        start_block: '1',
        end_block: '2',
        subject: 'Programación I',
        group: 1,
        professor: 'P',
        room: 'A1',
        majors: ['ICE'],
      }),
    ]);

    const conflicts = detectConflicts([s1, s2]);
    expect(conflicts.size).toBe(2);
    expect(conflicts.get(s1.id)).toHaveLength(1);
    expect(conflicts.get(s2.id)).toHaveLength(1);
  });

  it('does NOT flag same subject different group as conflict', () => {
    const s1 = section('Cálculo I::G1', [
      entry({
        day: 'L',
        start_block: '1',
        end_block: '2',
        subject: 'Cálculo I',
        group: 1,
        professor: 'P1',
        room: 'A1',
        majors: ['ICE'],
      }),
    ]);
    const s2 = section('Cálculo I::G2', [
      entry({
        day: 'L',
        start_block: '1',
        end_block: '2',
        subject: 'Cálculo I',
        group: 2,
        professor: 'P2',
        room: 'A2',
        majors: ['ICE'],
      }),
    ]);

    const conflicts = detectConflicts([s1, s2]);
    expect(conflicts.size).toBe(0);
  });

  it('case-insensitive subject comparison', () => {
    const s1 = section('cálculo I::G1', [
      entry({
        day: 'L',
        start_block: '1',
        end_block: '2',
        subject: 'cálculo I',
        group: 1,
        professor: 'P',
        room: 'A1',
        majors: ['ICE'],
      }),
    ]);
    const s2 = section('Cálculo I::G2', [
      entry({
        day: 'L',
        start_block: '1',
        end_block: '2',
        subject: 'Cálculo I',
        group: 2,
        professor: 'P',
        room: 'A1',
        majors: ['ICE'],
      }),
    ]);

    const conflicts = detectConflicts([s1, s2]);
    expect(conflicts.size).toBe(0);
  });

  it('detects partial overlap', () => {
    const s1 = section('Cálculo I::G1', [
      entry({
        day: 'L',
        start_block: '1',
        end_block: '2',
        subject: 'Cálculo I',
        group: 1,
        professor: 'P',
        room: 'A1',
        majors: ['ICE'],
      }),
    ]);
    const s2 = section('Física I::G1', [
      entry({
        day: 'L',
        start_block: '2',
        end_block: '3',
        subject: 'Física I',
        group: 1,
        professor: 'P',
        room: 'A1',
        majors: ['ICE'],
      }),
    ]);

    const conflicts = detectConflicts([s1, s2]);
    expect(conflicts.size).toBe(2);
  });

  it('records conflicts for both sides', () => {
    const s1 = section('A::G1', [
      entry({ day: 'L', start_block: '1', end_block: '2', subject: 'A', group: 1, professor: 'P', room: 'R', majors: ['ICE'] }),
    ]);
    const s2 = section('B::G1', [
      entry({ day: 'L', start_block: '1', end_block: '2', subject: 'B', group: 1, professor: 'P', room: 'R', majors: ['ICE'] }),
    ]);
    const s3 = section('C::G1', [
      entry({ day: 'M', start_block: '1', end_block: '2', subject: 'C', group: 1, professor: 'P', room: 'R', majors: ['ICE'] }),
    ]);

    const conflicts = detectConflicts([s1, s2, s3]);
    // s1 conflicts with s2, s2 conflicts with s1, s3 has no conflicts
    expect(conflicts.get(s1.id)).toHaveLength(1);
    expect(conflicts.get(s2.id)).toHaveLength(1);
    expect(conflicts.has(s3.id)).toBe(false);
  });
});

describe('findValidPath', () => {
  it('returns typed error for empty sections', () => {
    const result = findValidPath([]);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.reason).toBe('NO_SECTIONS');
    }
  });

  it('finds a valid path when no conflicts exist', () => {
    const s1 = section('Cálculo I::G1', [
      entry({ day: 'L', start_block: '1', end_block: '2', subject: 'Cálculo I', group: 1, professor: 'P', room: 'A1', majors: ['ICE'] }),
    ]);
    const s2 = section('Física I::G1', [
      entry({ day: 'M', start_block: '1', end_block: '2', subject: 'Física I', group: 1, professor: 'P', room: 'A1', majors: ['ICE'] }),
    ]);

    const result = findValidPath([s1, s2]);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.sections).toHaveLength(2);
    }
  });

  it('finds a valid path when same-subject sections overlap (different groups)', () => {
    const s1 = section('Cálculo I::G1', [
      entry({ day: 'L', start_block: '1', end_block: '2', subject: 'Cálculo I', group: 1, professor: 'P', room: 'A1', majors: ['ICE'] }),
    ]);
    const s2 = section('Cálculo I::G2', [
      entry({ day: 'L', start_block: '1', end_block: '2', subject: 'Cálculo I', group: 2, professor: 'P', room: 'A2', majors: ['ICE'] }),
    ]);
    const s3 = section('Física I::G1', [
      entry({ day: 'M', start_block: '1', end_block: '2', subject: 'Física I', group: 1, professor: 'P', room: 'A1', majors: ['ICE'] }),
    ]);

    const result = findValidPath([s1, s2, s3]);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.sections.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('chooses non-conflicting section when options exist', () => {
    // Cálculo G1 doesn't conflict with anything
    const calculo1 = section('Cálculo I::G1', [
      entry({ day: 'L', start_block: '1', end_block: '2', subject: 'Cálculo I', group: 1, professor: 'P', room: 'A1', majors: ['ICE'] }),
    ]);
    // Física G1 conflicts with Programación G1
    const fisica1 = section('Física I::G1', [
      entry({ day: 'L', start_block: '1', end_block: '2', subject: 'Física I', group: 1, professor: 'P', room: 'B1', majors: ['ICE'] }),
    ]);
    // Física G2 doesn't conflict
    const fisica2 = section('Física I::G2', [
      entry({ day: 'M', start_block: '1', end_block: '2', subject: 'Física I', group: 2, professor: 'P', room: 'B2', majors: ['ICE'] }),
    ]);

    const result = findValidPath([calculo1, fisica1, fisica2]);
    expect(result.success).toBe(true);
    if (result.success) {
      // Should pick Física G2 to avoid conflict with Cálculo
      const fisicaSection = result.sections.find((s) => s.subject === 'Física I');
      expect(fisicaSection!.group).toBe(2);
    }
  });

  it('returns NO_VALID_PATH when all combinations conflict', () => {
    // Both sections of A and B overlap on Monday block 1
    const a1 = section('A::G1', [
      entry({ day: 'L', start_block: '1', end_block: '2', subject: 'A', group: 1, professor: 'P', room: 'R', majors: ['ICE'] }),
    ]);
    const b1 = section('B::G1', [
      entry({ day: 'L', start_block: '1', end_block: '2', subject: 'B', group: 1, professor: 'P', room: 'R', majors: ['ICE'] }),
    ]);
    // Only one option per subject, and they conflict → no valid path
    const result = findValidPath([a1, b1]);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.reason).toBe('NO_VALID_PATH');
    }
  });

  it('works with single section', () => {
    const s1 = section('Solo::G1', [
      entry({ day: 'L', start_block: '1', end_block: '2', subject: 'Solo', group: 1, professor: 'P', room: 'R', majors: ['ICE'] }),
    ]);
    const result = findValidPath([s1]);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.sections).toHaveLength(1);
    }
  });
});
