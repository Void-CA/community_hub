function toArray<T extends Element>(selector: string): T[] {
  return [...document.querySelectorAll(selector)] as T[];
}

export function initProfessorScheduleState() {
  const boot = document.querySelector<HTMLElement>('[data-initial-professor]');
  const initialProfessor = boot?.dataset.initialProfessor ?? '';

  const professorButtons = toArray<HTMLButtonElement>('[data-professor-button]');
  const tiles = toArray<HTMLElement>('[data-schedule-tile]');
  const searchInput = document.getElementById('professor-search') as HTMLInputElement | null;
  const visibleProfessorCount = document.getElementById('visible-professor-count');
  const activeProfessorBadge = document.getElementById('active-professor-badge');
  const activeSessionBadge = document.getElementById('active-session-badge');
  const timelineEmpty = document.getElementById('timeline-empty');
  const periodSelect = document.getElementById('period-select') as HTMLSelectElement | null;

  // Zen Mode toggle
  const zenToggle = document.getElementById('zen-mode-toggle');
  const dashboard = document.querySelector('.dashboard-layout');

  const state = {
    professor: initialProfessor,
  };

  const updateSummary = () => {
    const selectedTiles = tiles.filter(
      (tile) => tile.dataset.sectionId === state.professor
    );

    if (activeProfessorBadge) {
      activeProfessorBadge.textContent = state.professor || 'Sin selección';
    }

    if (activeSessionBadge) {
      activeSessionBadge.textContent = String(selectedTiles.length);
    }

    if (timelineEmpty) {
      timelineEmpty.hidden = Boolean(state.professor);
    }
  };

  const applyState = () => {
    const query = searchInput?.value.trim().toLowerCase() ?? '';
    const visibleButtons: HTMLButtonElement[] = [];

    professorButtons.forEach((button) => {
      const name = button.dataset.professor ?? '';
      const matches = query.length === 0 || name.toLowerCase().includes(query);

      button.hidden = !matches;

      if (matches) {
        visibleButtons.push(button);
      }
    });

    const hasCurrentVisible = visibleButtons.some(
      (button) => (button.dataset.professor ?? '') === state.professor
    );

    if (!hasCurrentVisible && visibleButtons.length > 0) {
      state.professor = visibleButtons[0]?.dataset.professor ?? '';
    }

    professorButtons.forEach((button) => {
      const selected = (button.dataset.professor ?? '') === state.professor;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });

    tiles.forEach((tile) => {
      tile.hidden = tile.dataset.sectionId !== state.professor;
    });

    if (visibleProfessorCount) {
      visibleProfessorCount.textContent = String(
        professorButtons.filter((button) => !button.hidden).length
      );
    }
    
    updateSummary();
  };

  const selectProfessor = (name: string) => {
    state.professor = name;
    applyState();
  };

  professorButtons.forEach((button) => {
    button.addEventListener('click', () =>
      selectProfessor(button.dataset.professor ?? initialProfessor)
    );
  });

  searchInput?.addEventListener('input', applyState);

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
  selectProfessor(initialProfessor);
}
