import { describe, it, expect } from 'vitest';
import { groupSectionsBySubject } from '../organizer';
import { entry, section } from '../__tests__/fixtures';

describe('groupSectionsBySubject', () => {
  it('groups sections by subject name', () => {
    const sections = [
      section('Cálculo I::G1', [
        entry({ day: 'L', start_block: '1', end_block: '2', subject: 'Cálculo I', group: 1, professor: 'P', room: 'A1', majors: ['ICE'] }),
      ]),
      section('Física I::G1', [
        entry({ day: 'M', start_block: '1', end_block: '2', subject: 'Física I', group: 1, professor: 'P', room: 'B1', majors: ['ICE'] }),
      ]),
    ];

    const result = groupSectionsBySubject(sections);
    expect(result).toHaveLength(2);
    expect(result[0]!.subject).toBe('Cálculo I');
    expect(result[1]!.subject).toBe('Física I');
  });

  it('collects multiple group options per subject', () => {
    const sections = [
      section('Cálculo I::G1', [
        entry({ day: 'L', start_block: '1', end_block: '2', subject: 'Cálculo I', group: 1, professor: 'P1', room: 'A1', majors: ['ICE'] }),
      ]),
      section('Cálculo I::G2', [
        entry({ day: 'L', start_block: '3', end_block: '4', subject: 'Cálculo I', group: 2, professor: 'P2', room: 'A2', majors: ['ICE'] }),
      ]),
    ];

    const result = groupSectionsBySubject(sections);
    expect(result).toHaveLength(1);
    expect(result[0]!.options).toHaveLength(2);
    expect(result[0]!.options.map((o) => o.groupNumber)).toEqual([1, 2]);
  });

  it('sorts groups by group number within each subject', () => {
    const sections = [
      section('Math::G3', [entry({ day: 'L', start_block: '1', end_block: '2', subject: 'Math', group: 3, professor: 'P', room: 'R', majors: ['ICE'] })]),
      section('Math::G1', [entry({ day: 'L', start_block: '3', end_block: '4', subject: 'Math', group: 1, professor: 'P', room: 'R', majors: ['ICE'] })]),
      section('Math::G2', [entry({ day: 'M', start_block: '1', end_block: '2', subject: 'Math', group: 2, professor: 'P', room: 'R', majors: ['ICE'] })]),
    ];

    const result = groupSectionsBySubject(sections);
    expect(result[0]!.options.map((o) => o.groupNumber)).toEqual([1, 2, 3]);
  });

  it('sorts subjects alphabetically', () => {
    const sections = [
      section('Zebra::G1', [entry({ day: 'L', start_block: '1', end_block: '2', subject: 'Zebra', group: 1, professor: 'P', room: 'R', majors: ['ICE'] })]),
      section('Alpha::G1', [entry({ day: 'L', start_block: '3', end_block: '4', subject: 'Alpha', group: 1, professor: 'P', room: 'R', majors: ['ICE'] })]),
    ];

    const result = groupSectionsBySubject(sections);
    expect(result[0]!.subject).toBe('Alpha');
    expect(result[1]!.subject).toBe('Zebra');
  });

  it('includes groupId and full section reference', () => {
    const s = section('Test::G1', [entry({ day: 'L', start_block: '1', end_block: '2', subject: 'Test', group: 1, professor: 'P', room: 'R', majors: ['ICE'] })]);
    const result = groupSectionsBySubject([s]);
    expect(result[0]!.options[0]!.groupId).toBe('Test::G1');
    expect(result[0]!.options[0]!.section).toBe(s);
  });

  it('handles empty input', () => {
    expect(groupSectionsBySubject([])).toEqual([]);
  });
});
