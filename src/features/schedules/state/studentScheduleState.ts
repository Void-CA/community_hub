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

    return majors.includes(state.major.toLowerCase()) && years.includes(state.year) && (query.length === 0 || search.includes(query));
  };

  const getActiveIds = () => new Set(
    sectionButtons
      .filter((button) => !button.hidden && state.selectedIds.has(button.dataset.sectionId ?? ''))
      .map((button) => button.dataset.sectionId ?? '')
  );

  const updateSummary = () => {
    const activeIds = getActiveIds();
    const selectedTiles = tiles.filter((tile) => activeIds.has(tile.dataset.sectionId ?? ''));
    const selectedProfessors = new Set(selectedTiles.map((tile) => tile.dataset.professor ?? ''));

    if (selectedSectionCount) selectedSectionCount.textContent = String(activeIds.size);
    if (selectedSessionCount) selectedSessionCount.textContent = String(selectedTiles.length);
    if (selectedProfessorCount) selectedProfessorCount.textContent = String(selectedProfessors.size);
  };

  const applySelectionState = () => {
    sectionButtons.forEach((button) => {
      const sectionId = button.dataset.sectionId ?? '';
      const selected = state.selectedIds.has(sectionId);
      const visible = isSectionVisible(button);
      const check = button.querySelector('.section-check');

      button.hidden = !visible;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));

      if (check) {
        check.textContent = selected ? 'Incluida' : 'Disponible';
      }
    });

    const activeIds = getActiveIds();

    tiles.forEach((tile) => {
      tile.hidden = !activeIds.has(tile.dataset.sectionId ?? '');
    });

    if (visibleSectionCount) {
      visibleSectionCount.textContent = String(sectionButtons.filter((button) => !button.hidden).length);
    }

    updateSummary();
  };

  const refreshSelection = () => {
    state.selectedIds = new Set(
      sectionButtons
        .filter((button) => {
          const majors = button.dataset.majorList?.split('|') ?? [];
          const years = button.dataset.yearList?.split('|') ?? [];
          return majors.includes(state.major.toLowerCase()) && years.includes(state.year);
        })
        .map((button) => button.dataset.sectionId ?? '')
    );

    applySelectionState();
  };

  majorButtons.forEach((button) => {
    button.addEventListener('click', () => {
      state.major = button.dataset.major ?? state.major;
      majorButtons.forEach((candidate) => candidate.classList.toggle('is-active', candidate === button));
      refreshSelection();
    });
  });

  yearButtons.forEach((button) => {
    button.addEventListener('click', () => {
      state.year = button.dataset.year ?? state.year;
      yearButtons.forEach((candidate) => candidate.classList.toggle('is-active', candidate === button));
      refreshSelection();
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

  searchInput?.addEventListener('input', applySelectionState);

  periodSelect?.addEventListener('change', () => {
    const selected = periodSelect.value;
    const [year, term] = selected.split('-');
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set('year', year ?? '');
    nextUrl.searchParams.set('term', term ?? '');
    window.location.assign(nextUrl.toString());
  });

  refreshSelection();
}
