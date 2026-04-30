function toArray<T extends Element>(selector: string): T[] {
  return [...document.querySelectorAll(selector)] as T[];
}

export function initProfessorScheduleState() {
  const boot = document.querySelector<HTMLElement>('[data-initial-professor]');
  const initialProfessor = boot?.dataset.initialProfessor ?? '';

  const pagination = document.querySelector<HTMLElement>('[data-pagination]');
  const totalPagesAttr = parseInt(
    pagination?.getAttribute('data-total-pages') ?? '1',
    10,
  );

  const state: CatalogState = {
    professor: initialProfessor,
    searchQuery: '',
    currentPage: 1,
    totalPages: totalPagesAttr,
  };

  const professorButtons = toArray<HTMLButtonElement>('[data-professor-button]');
  const tiles = toArray<HTMLElement>('.timeline-tile-container');
  const searchInput = document.getElementById(
    'professor-search',
  ) as HTMLInputElement | null;
  const visibleProfessorCount = document.getElementById(
    'visible-professor-count',
  );
  const activeProfessorBadge = document.getElementById(
    'active-professor-badge',
  );
  const activeSessionBadge = document.getElementById('active-session-badge');
  const timelineEmpty = document.getElementById('timeline-empty');
  const periodSelect = document.getElementById(
    'period-select',
  ) as HTMLSelectElement | null;

  // Zen Mode toggle
  const zenToggle = document.getElementById('zen-mode-toggle');
  const dashboard = document.querySelector('.dashboard-layout');

  const updateSummary = () => {
    const selectedTiles = tiles.filter(
      (tile) => tile.dataset.sectionId === state.professor,
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

  const updatePaginationUI = () => {
    if (!pagination) return;

    const numBtns = pagination.querySelectorAll<HTMLButtonElement>(
      '[data-page-number]',
    );
    for (const btn of numBtns) {
      const num = parseInt(btn.getAttribute('data-page-number') ?? '0', 10);
      btn.classList.toggle('is-active', num === state.currentPage);
    }

    const prevBtn = pagination.querySelector<HTMLButtonElement>(
      '[data-page-action="prev"]',
    );
    const nextBtn = pagination.querySelector<HTMLButtonElement>(
      '[data-page-action="next"]',
    );
    if (prevBtn) prevBtn.disabled = state.currentPage === 1;
    if (nextBtn) nextBtn.disabled = state.currentPage === state.totalPages;
  };

  /**
   * Single source of truth for visibility.
   * Combines search filtering + pagination.
   */
  const applyState = () => {
    const query = state.searchQuery;
    const visibleButtons: HTMLButtonElement[] = [];

    for (const button of professorButtons) {
      const name = button.dataset.professor ?? '';
      const btnPage = parseInt(button.getAttribute('data-page-group') ?? '1', 10);

      const matchesSearch =
        query.length === 0 || name.toLowerCase().includes(query.toLowerCase());
      const isOnPage = query.length > 0 || btnPage === state.currentPage;
      const isVisible = matchesSearch && isOnPage;

      // Use class for visibility (scoped CSS compatibility)
      button.classList.toggle('is-page-hidden', !isVisible);

      // Also sync hidden attribute for consistency
      button.hidden = !isVisible;

      if (isVisible) {
        visibleButtons.push(button);
      }
    }

    // If current professor is not visible, select first visible one
    const hasCurrentVisible = visibleButtons.some(
      (button) => (button.dataset.professor ?? '') === state.professor,
    );

    if (!hasCurrentVisible && visibleButtons.length > 0) {
      state.professor = visibleButtons[0]?.dataset.professor ?? '';
    } else if (!hasCurrentVisible && visibleButtons.length === 0) {
      state.professor = '';
    }

    // Update selection state
    for (const button of professorButtons) {
      const selected = (button.dataset.professor ?? '') === state.professor;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    }

    // Update timeline tiles
    for (const tile of tiles) {
      tile.hidden = tile.dataset.sectionId !== state.professor;
    }

    // Update pagination UI
    updatePaginationUI();

    // Update visible count
    if (visibleProfessorCount) {
      visibleProfessorCount.textContent = String(visibleButtons.length);
    }

    updateSummary();
  };

  const selectProfessor = (name: string) => {
    state.professor = name;
    applyState();
  };

  // ── Event listeners ──

  // Professor button clicks
  for (const button of professorButtons) {
    button.addEventListener('click', () =>
      selectProfessor(button.dataset.professor ?? initialProfessor),
    );
  }

  // Search input
  searchInput?.addEventListener('input', () => {
    state.searchQuery = searchInput.value ?? '';
    applyState();
  });

  // Pagination clicks (delegated)
  pagination?.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;

    const pageBtn = target.closest<HTMLButtonElement>('[data-page-number]');
    if (pageBtn) {
      const num = parseInt(pageBtn.getAttribute('data-page-number') ?? '0', 10);
      state.currentPage = num;
      applyState();
      return;
    }

    const actionBtn = target.closest<HTMLButtonElement>('[data-page-action]');
    if (actionBtn) {
      const action = actionBtn.getAttribute('data-page-action');
      if (action === 'prev' && state.currentPage > 1) {
        state.currentPage--;
        applyState();
      } else if (
        action === 'next' &&
        state.currentPage < state.totalPages
      ) {
        state.currentPage++;
        applyState();
      }
    }
  });

  // Zen Mode toggle
  zenToggle?.addEventListener('click', () => {
    dashboard?.classList.toggle('is-zen');
    zenToggle.classList.toggle('is-active');
    const isZen = dashboard?.classList.contains('is-zen');
    zenToggle.textContent = isZen ? 'Ver catálogo' : 'Vista dedicada';
  });

  // Period select
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
