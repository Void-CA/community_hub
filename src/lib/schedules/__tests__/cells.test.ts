import { describe, it, expect } from 'vitest';
import { buildTimelineCellIndex } from '../cells';
import { entry, section } from '../__tests__/fixtures';

describe('buildTimelineCellIndex', () => {
  it('creates index entries for each day::block combination', () => {
    const s = section('Cálculo I::G1', [
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

    const index = buildTimelineCellIndex([s]);
    // Block 1 is "1", block 2 is "2" — academic labels
    expect(index.has('L::1')).toBe(true);
    expect(index.has('L::2')).toBe(true);
  });

  it('skips entries with unknown start blocks', () => {
    const s = section('Test::G1', [
      entry({
        day: 'L',
        start_block: 'BloqueX',
        end_block: '2',
        subject: 'Test',
        group: 1,
        professor: 'P',
        room: 'A1',
        majors: ['ICE'],
      }),
    ]);

    const index = buildTimelineCellIndex([s]);
    expect(index.size).toBe(0);
  });

  it('includes conflict information when provided', () => {
    const s1 = section('A::G1', [
      entry({
        day: 'L',
        start_block: '1',
        end_block: '2',
        subject: 'A',
        group: 1,
        professor: 'P',
        room: 'A1',
        majors: ['ICE'],
      }),
    ]);
    const s2 = section('B::G1', [
      entry({
        day: 'L',
        start_block: '1',
        end_block: '2',
        subject: 'B',
        group: 1,
        professor: 'P',
        room: 'A1',
        majors: ['ICE'],
      }),
    ]);

    const conflicts = new Map<string, any>([
      [
        'A::G1',
        [
          {
            type: 'COLLISION',
            groups: ['A::G1', 'B::G1'],
            sharedBlocks: ['L::overlap'],
          },
        ],
      ],
      [
        'B::G1',
        [
          {
            type: 'COLLISION',
            groups: ['A::G1', 'B::G1'],
            sharedBlocks: ['L::overlap'],
          },
        ],
      ],
    ]);

    const index = buildTimelineCellIndex([s1, s2], conflicts);
    const tiles = index.get('L::1');
    expect(tiles).toBeDefined();
    expect(tiles![0].hasConflict).toBe(true);
    expect(tiles![0].conflictWith).toContain('B::G1');
  });

  it('sets rowSpan correctly for multi-block entries', () => {
    const s = section('Cálculo I::G1', [
      entry({
        day: 'L',
        start_block: '1',
        end_block: '4',
        subject: 'Cálculo I',
        group: 1,
        professor: 'P',
        room: 'A1',
        majors: ['ICE'],
      }),
    ]);

    const index = buildTimelineCellIndex([s]);
    const tiles = index.get('L::1');
    expect(tiles![0].rowSpan).toBe(4);
  });

  it('only adds tile data at the start of the range', () => {
    const s = section('Cálculo I::G1', [
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

    const index = buildTimelineCellIndex([s]);
    const startTiles = index.get('L::1');
    const endTiles = index.get('L::2');

    // Both buckets exist (for grid spanning)
    expect(startTiles).toBeDefined();
    expect(endTiles).toBeDefined();
    // But only the start bucket has the tile data
    expect(startTiles).toHaveLength(1);
    expect(endTiles).toHaveLength(0);
  });

  it('handles old block label formats', () => {
    const s = section('Cálculo I::G1', [
      entry({
        day: 'L',
        start_block: 'Morning1',
        end_block: 'Morning2',
        subject: 'Cálculo I',
        group: 1,
        professor: 'P',
        room: 'A1',
        majors: ['ICE'],
      }),
    ]);

    const index = buildTimelineCellIndex([s]);
    expect(index.has('L::1')).toBe(true);
    expect(index.has('L::2')).toBe(true);
  });

  it('indexes multiple entries from the same section', () => {
    const s = section('Cálculo I::G1', [
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
      entry({
        day: 'X',
        start_block: '3',
        end_block: '4',
        subject: 'Cálculo I',
        group: 1,
        professor: 'P1',
        room: 'A1',
        majors: ['ICE'],
      }),
    ]);

    const index = buildTimelineCellIndex([s]);
    expect(index.has('L::1')).toBe(true);
    expect(index.has('X::3')).toBe(true);
  });
});
