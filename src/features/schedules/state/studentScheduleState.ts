type SectionButton = HTMLButtonElement;

type State = {
  major: string;
  year: string;
  selectedIds: Set<string>;
};

function toArray<T extends Element>(selector: string): T[] {
  return [...document.querySelectorAll(selector)] as T[];
}

export function initStudentScheduleState() {
  const boot = document.querySelector<HTMLElement>('[data-initial-major]');
  const initialMajor = boot?.dataset.initialMajor ?? 'all';
  const initialYear = boot?.dataset.initialYear ?? '0';
  const integrityError = boot?.dataset.integrityError === 'true';

  if (integrityError) {
    console.warn('Integrity Error: No conflict-free path found for this major/year combination.');
  }

  const majorSelect = document.getElementById('major-select') as HTMLSelectElement | null;
  const yearButtons = toArray<HTMLButtonElement>('[data-year-button]');
  const sectionButtons = toArray<SectionButton>('[data-section-toggle]');
  const tiles = toArray<HTMLElement>('[data-schedule-tile]');

  const searchInput = document.getElementById('section-search') as HTMLInputElement | null;
  const periodSelect = document.getElementById('period-select') as HTMLSelectElement | null;
  const visibleSectionCount = document.getElementById('visible-section-count');
  const selectedSectionCount = document.getElementById('selected-section-count');
  const selectedSessionCount = document.getElementById('selected-session-count');

  const state: State = {
    major: initialMajor,
    year: initialYear,
    selectedIds: new Set<string>(),
  };

  const isSectionVisible = (button: SectionButton) => {
    const majors = button.dataset.majorList?.split('|') ?? [];
    const years = button.dataset.yearList?.split('|') ?? [];
    const query = searchInput?.value.trim().toLowerCase() ?? '';
    const search = button.dataset.search ?? '';

    const matchesMajor = state.major === 'all' || majors.includes(state.major.toLowerCase());
    const matchesYear = state.year === '0' || years.includes(state.year);
    const matchesSearch = query.length === 0 || search.includes(query);

    return matchesMajor && matchesYear && matchesSearch;
  };

  const updateSummary = () => {
    const selectedTiles = tiles.filter((tile) => state.selectedIds.has(tile.dataset.sectionId ?? ''));
    if (selectedSectionCount) selectedSectionCount.textContent = String(state.selectedIds.size);
    if (selectedSessionCount) selectedSessionCount.textContent = String(selectedTiles.length);
  };

  const applyVisibility = () => {
    let visibleCount = 0;
    const containers = toArray<HTMLElement>('[data-subject-container]');

    containers.forEach((container) => {
      const buttons = [...container.querySelectorAll<SectionButton>('[data-section-toggle]')];
      let hasVisibleButton = false;

      buttons.forEach((button) => {
        const visible = isSectionVisible(button);
        button.hidden = !visible;
        if (visible) {
          hasVisibleButton = true;
          visibleCount++;
        }
      });

      container.hidden = !hasVisibleButton;
    });

    if (visibleSectionCount) {
      visibleSectionCount.textContent = String(visibleCount);
    }
  };

  const applySelectionState = () => {
    sectionButtons.forEach((button) => {
      const sectionId = button.dataset.sectionId ?? '';
      const selected = state.selectedIds.has(sectionId);
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });

    const activeTiles = tiles.filter((tile) => state.selectedIds.has(tile.dataset.sectionId ?? ''));
    
    tiles.forEach((tile) => {
      tile.hidden = !state.selectedIds.has(tile.dataset.sectionId ?? '');
      tile.classList.remove('has-conflict');
    });

    // Conflict detection
    const cellGroups = new Map<string, HTMLElement[]>();
    activeTiles.forEach((tile) => {
      const day = tile.dataset.day;
      const block = tile.dataset.block;
      const key = `${day}-${block}`;
      const group = cellGroups.get(key) ?? [];
      group.push(tile);
      cellGroups.set(key, group);
    });

    cellGroups.forEach((group) => {
      const parentCell = group[0]?.parentElement;
      if (parentCell) {
        parentCell.classList.toggle('has-multiple', group.length > 1);
      }
      if (group.length > 1) {
        group.forEach((tile) => tile.classList.add('has-conflict'));
      }
    });

    // Cleanup cells
    toArray<HTMLElement>('.timeline-cell.has-multiple').forEach((cell) => {
      const visibleChildren = [...cell.children].filter((child) => !(child as HTMLElement).hidden);
      if (visibleChildren.length <= 1) {
        cell.classList.remove('has-multiple');
      }
    });

    const occupiedSlots = new Set<string>();
    activeTiles.forEach((tile) => {
      const day = tile.dataset.day;
      const block = tile.dataset.block;
      occupiedSlots.add(`${day}-${block}`);
    });

    // Catalog compatibility
    sectionButtons.forEach((button) => {
      const sectionId = button.dataset.sectionId ?? '';
      if (state.selectedIds.has(sectionId)) {
        button.classList.remove('is-ghosted');
        return;
      }

      const sectionTiles = tiles.filter(t => t.dataset.sectionId === sectionId);
      const conflictsWithSelection = sectionTiles.some(t => {
        const key = `${t.dataset.day}-${t.dataset.block}`;
        return occupiedSlots.has(key);
      });

      button.classList.toggle('is-ghosted', conflictsWithSelection);
      button.classList.toggle('is-compatible', !conflictsWithSelection && state.selectedIds.size > 0);
    });

    updateSummary();
  };

  const refreshSelectionByPreset = () => {
    if (state.major !== 'all' || state.year !== '0') {
      const subjectSelected = new Set<string>();
      state.selectedIds = new Set(
        sectionButtons
          .filter((button) => {
            const majors = button.dataset.majorList?.split('|') ?? [];
            const years = button.dataset.yearList?.split('|') ?? [];
            const matchesMajor = state.major === 'all' || majors.includes(state.major.toLowerCase());
            const matchesYear = state.year === '0' || years.includes(state.year);
            
            if (!matchesMajor || !matchesYear) return false;

            const subject = button.dataset.subject ?? '';
            if (subjectSelected.has(subject)) return false;
            
            subjectSelected.add(subject);
            return true;
          })
          .map((button) => button.dataset.sectionId ?? '')
      );
    }

    applyVisibility();
    applySelectionState();
  };

  majorSelect?.addEventListener('change', () => {
    state.major = majorSelect.value;
    refreshSelectionByPreset();
  });

  yearButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const nextYear = button.dataset.year ?? state.year;
      if (state.year === nextYear) return;
      state.year = nextYear;
      yearButtons.forEach((candidate) => candidate.classList.toggle('is-active', candidate === button));
      refreshSelectionByPreset();
    });
  });

  sectionButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const sectionId = button.dataset.sectionId ?? '';
      const subject = button.dataset.subject ?? '';

      if (state.selectedIds.has(sectionId)) {
        state.selectedIds.delete(sectionId);
      } else {
        sectionButtons.forEach((other) => {
          if (other.dataset.subject === subject && other !== button) {
            state.selectedIds.delete(other.dataset.sectionId ?? '');
          }
        });
        state.selectedIds.add(sectionId);
      }

      applySelectionState();
    });
  });

  searchInput?.addEventListener('input', applyVisibility);

  periodSelect?.addEventListener('change', () => {
    const selected = periodSelect.value;
    const [year, term] = selected.split('-');
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set('year', year ?? '');
    nextUrl.searchParams.set('term', term ?? '');
    window.location.assign(nextUrl.toString());
  });

  // Initial setup
  refreshSelectionByPreset();
}
