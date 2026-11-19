// Buffet ERP Staff Manual client script (offline-ready). The search index is generated into search-index.js.
document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Toggle
  const mobileBtn = document.querySelector('.mobile-menu-btn');
  const sidebar = document.querySelector('.app-sidebar');
  if (mobileBtn && sidebar) {
    mobileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!sidebar.contains(e.target) && !mobileBtn.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    });
  }

  // 2. Image Click to Zoom Modal
  const modal = document.createElement('div');
  modal.className = 'image-modal';
  const modalImg = document.createElement('img');
  modal.appendChild(modalImg);
  document.body.appendChild(modal);

  document.querySelectorAll('figure.step-figure img').forEach(img => {
    img.addEventListener('click', () => {
      modalImg.src = img.src;
      modalImg.alt = img.alt;
      modal.classList.add('active');
    });
  });

  modal.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  // 3. Offline search over the generated index (title, keywords, roles and page text)
  const searchIndex = window.MANUAL_SEARCH_INDEX || [];
  const escapeHtml = text => String(text).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

  const searchInput = document.querySelector('.search-input');
  const searchDropdown = document.querySelector('.search-results-dropdown');

  if (searchInput && searchDropdown) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      if (!q) {
        searchDropdown.classList.remove('active');
        searchDropdown.innerHTML = '';
        return;
      }

      const score = item => (item.title.toLowerCase().includes(q) ? 3 : 0)
        + (item.keywords.includes(q) || item.roles.toLowerCase().includes(q) ? 2 : 0)
        + (item.text.includes(q) ? 1 : 0);
      const matches = searchIndex.map(item => ({ item, rank: score(item) }))
        .filter(m => m.rank > 0).sort((x, y) => y.rank - x.rank).map(m => m.item).slice(0, 8);

      if (matches.length === 0) {
        searchDropdown.innerHTML = `<div class="search-result-item search-result-empty">No page found for "${escapeHtml(q)}"</div>`;
      } else {
        searchDropdown.innerHTML = matches.map(item => `
          <a href="${item.url}" class="search-result-item">
            <div class="search-result-title">${item.title}</div>
            <div class="search-result-snippet">${item.category} • ${item.roles} • ${item.snippet}</div>
          </a>
        `).join('');
      }

      searchDropdown.classList.add('active');
    });

    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
        searchDropdown.classList.remove('active');
      }
    });

    // Keyboard shortcut (⌘K or Ctrl+K)
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
      }
      if (e.key === 'Escape') {
        searchDropdown.classList.remove('active');
      }
    });
  }
});
