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
    // We could show a toast or a banner here.
  }

  const majorButtons = toArray<HTMLButtonElement>('[data-major-button]');
  const yearButtons = toArray<HTMLButtonElement>('[data-year-button]');
  const sectionButtons = toArray<SectionButton>('[data-section-toggle]');
  const tiles = toArray<HTMLElement>('[data-schedule-tile]');

  const searchInput = document.getElementById('section-search') as HTMLInputElement | null;
  const periodSelect = document.getElementById('period-select') as HTMLSelectElement | null;
  const visibleSectionCount = document.getElementById('visible-section-count');
  const selectedSectionCount = document.getElementById('selected-section-count');
  const selectedSessionCount = document.getElementById('selected-session-count');
  const selectedProfessorCount = document.getElementById('selected-professor-count');

  // Zen Mode toggle
  const zenToggle = document.getElementById('zen-mode-toggle');
  const dashboard = document.querySelector('.dashboard-grid');

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
    const selectedProfessors = new Set(selectedTiles.map((tile) => tile.dataset.professor ?? ''));

    if (selectedSectionCount) selectedSectionCount.textContent = String(state.selectedIds.size);
    if (selectedSessionCount) selectedSessionCount.textContent = String(selectedTiles.length);
    if (selectedProfessorCount) selectedProfessorCount.textContent = String(selectedProfessors.size);
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
      const check = button.querySelector('.section-check');

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

    cellGroups.forEach((group, key) => {
      const parentCell = group[0]?.parentElement;
      if (parentCell) {
        parentCell.classList.toggle('has-multiple', group.length > 1);
      }

      if (group.length > 1) {
        group.forEach((tile) => tile.classList.add('has-conflict'));
      }
    });

    // Cleanup cells that no longer have multiple tiles
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

    // Catalog compatibility highlighting
    sectionButtons.forEach((button) => {
      const sectionId = button.dataset.sectionId ?? '';
      if (state.selectedIds.has(sectionId)) {
        button.classList.remove('is-ghosted');
        return;
      }

      // We need to check if THIS section conflicts with already selected ones
      // Since we don't have all entry data on the button easily (except search string),
      // we might need to look at the tiles associated with this sectionId.
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

  // Only auto-select if we are filtering by a specific major/year
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

          // Only pick the first group we encounter for each subject (usually G1 due to sorting)
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
