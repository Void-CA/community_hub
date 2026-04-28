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
    sectionButtons.forEach((button) => {
      const visible = isSectionVisible(button);
      button.hidden = !visible;
      if (visible) visibleCount++;
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

      if (check) {
        check.textContent = selected ? 'Incluida' : 'Disponible';
      }
    });

    tiles.forEach((tile) => {
      tile.hidden = !state.selectedIds.has(tile.dataset.sectionId ?? '');
    });

    updateSummary();
  };

  const refreshSelectionByPreset = () => {
    // Only auto-select if we are filtering by a specific major/year
    if (state.major !== 'all' || state.year !== '0') {
      state.selectedIds = new Set(
        sectionButtons
          .filter((button) => {
            const majors = button.dataset.majorList?.split('|') ?? [];
            const years = button.dataset.yearList?.split('|') ?? [];
            const matchesMajor = state.major === 'all' || majors.includes(state.major.toLowerCase());
            const matchesYear = state.year === '0' || years.includes(state.year);
            return matchesMajor && matchesYear;
          })
          .map((button) => button.dataset.sectionId ?? '')
      );
    }

    applyVisibility();
    applySelectionState();
  };

  majorButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const nextMajor = button.dataset.major ?? state.major;
      if (state.major === nextMajor) return;
      
      state.major = nextMajor;
      majorButtons.forEach((candidate) => candidate.classList.toggle('is-active', candidate === button));
      refreshSelectionByPreset();
    });
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
      if (state.selectedIds.has(sectionId)) {
        state.selectedIds.delete(sectionId);
      } else {
        state.selectedIds.add(sectionId);
      }

      applySelectionState();
    });
  });

  searchInput?.addEventListener('input', applyVisibility);

  zenToggle?.addEventListener('click', () => {
    dashboard?.classList.toggle('is-zen');
    zenToggle.classList.toggle('is-active');
    const isZen = dashboard?.classList.contains('is-zen');
    zenToggle.textContent = isZen ? 'Ver catálogo' : 'Vista dedicada';
  });

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
