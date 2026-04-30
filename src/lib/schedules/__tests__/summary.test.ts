import { describe, it, expect } from 'vitest';
import { getScheduleSummary } from '../summary';
import { entry as makeEntry } from '../__tests__/fixtures';

describe('getScheduleSummary', () => {
  it('counts total entries', () => {
    const entries = [
      makeEntry({
        day: 'L',
        start_block: '1',
        end_block: '2',
        subject: 'Cálculo I',
        group: 1,
        professor: 'P',
        room: 'A1',
        majors: ['ICE'],
      }),
      makeEntry({
        day: 'M',
        start_block: '3',
        end_block: '4',
        subject: 'Física I',
        group: 1,
        professor: 'P',
        room: 'B1',
        majors: ['ICE'],
      }),
    ];
    const summary = getScheduleSummary(entries);
    expect(summary.totalEntries).toBe(2);
  });

  it('counts unique professors', () => {
    const entries = [
      makeEntry({
        day: 'L',
        start_block: '1',
        end_block: '2',
        subject: 'A',
        group: 1,
        professor: 'Juan Pérez',
        room: 'A1',
        majors: ['ICE'],
      }),
      makeEntry({
        day: 'M',
        start_block: '3',
        end_block: '4',
        subject: 'B',
        group: 1,
        professor: 'María López',
        room: 'B1',
        majors: ['ICE'],
      }),
      makeEntry({
        day: 'X',
        start_block: '1',
        end_block: '2',
        subject: 'C',
        group: 1,
        professor: 'Juan Pérez',
        room: 'C1',
        majors: ['ICE'],
      }),
    ];
    const summary = getScheduleSummary(entries);
    expect(summary.totalProfessors).toBe(2);
  });

  it('counts unique subjects', () => {
    const entries = [
      makeEntry({
        day: 'L',
        start_block: '1',
        end_block: '2',
        subject: 'Cálculo I',
        group: 1,
        professor: 'P',
        room: 'A1',
        majors: ['ICE'],
      }),
      makeEntry({
        day: 'M',
        start_block: '3',
        end_block: '4',
        subject: 'Física I',
        group: 1,
        professor: 'P',
        room: 'B1',
        majors: ['ICE'],
      }),
      makeEntry({
        day: 'X',
        start_block: '1',
        end_block: '2',
        subject: 'Cálculo I',
        group: 1,
        professor: 'P',
        room: 'C1',
        majors: ['ICE'],
      }),
    ];
    const summary = getScheduleSummary(entries);
    expect(summary.totalSubjects).toBe(2);
  });

  it('counts unique rooms', () => {
    const entries = [
      makeEntry({
        day: 'L',
        start_block: '1',
        end_block: '2',
        subject: 'A',
        group: 1,
        professor: 'P',
        room: 'A101',
        majors: ['ICE'],
      }),
      makeEntry({
        day: 'M',
        start_block: '3',
        end_block: '4',
        subject: 'B',
        group: 1,
        professor: 'P',
        room: 'B202',
        majors: ['ICE'],
      }),
    ];
    const summary = getScheduleSummary(entries);
    expect(summary.totalRooms).toBe(2);
  });

  it('counts unique majors', () => {
    const entries = [
      makeEntry({
        day: 'L',
        start_block: '1',
        end_block: '2',
        subject: 'A',
        group: 1,
        professor: 'P',
        room: 'R',
        majors: ['ICE', 'IMS'],
      }),
      makeEntry({
        day: 'M',
        start_block: '3',
        end_block: '4',
        subject: 'B',
        group: 1,
        professor: 'P',
        room: 'R',
        majors: ['LCM'],
      }),
    ];
    const summary = getScheduleSummary(entries);
    expect(summary.totalMajors).toBe(3);
  });

  it('identifies most popular subject', () => {
    const entries = [
      makeEntry({
        day: 'L',
        start_block: '1',
        end_block: '2',
        subject: 'Cálculo',
        group: 1,
        professor: 'P',
        room: 'R',
        majors: ['ICE'],
      }),
      makeEntry({
        day: 'L',
        start_block: '3',
        end_block: '4',
        subject: 'Cálculo',
        group: 1,
        professor: 'P',
        room: 'R',
        majors: ['ICE'],
      }),
      makeEntry({
        day: 'M',
        start_block: '1',
        end_block: '2',
        subject: 'Física',
        group: 1,
        professor: 'P',
        room: 'R',
        majors: ['ICE'],
      }),
    ];
    const summary = getScheduleSummary(entries);
    expect(summary.mostPopularSubject?.name).toBe('Cálculo');
    expect(summary.mostPopularSubject?.count).toBe(2);
  });

  it('handles empty entries', () => {
    const summary = getScheduleSummary([]);
    expect(summary.totalEntries).toBe(0);
    expect(summary.mostPopularSubject).toBeNull();
  });
});
