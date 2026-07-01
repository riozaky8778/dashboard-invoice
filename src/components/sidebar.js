/**
 * Sidebar Component
 */

export function renderSidebar(activePage = 'dashboard') {
  const mainItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'invoices', icon: '📋', label: 'Data Invoice' },
  ];

  const rekapItems = [
    { id: 'rekap-hotel',      icon: '🏨', label: 'Hotel' },
    { id: 'rekap-restaurant', icon: '🍽️', label: 'Restaurant' },
    { id: 'rekap-flight',     icon: '✈️', label: 'Penerbangan' },
    { id: 'rekap-visa',       icon: '🛂', label: 'Visa' },
    { id: 'rekap-umroh',      icon: '🕌', label: 'Umroh / FP' },
  ];

  const isRekapActive = rekapItems.some(i => i.id === activePage);
  const isDark = document.body?.dataset.theme !== 'light';
  const themeIcon = isDark ? '☀️' : '🌙';
  const themeLabel = isDark ? 'Light Mode' : 'Dark Mode';

  return `
    <button class="sidebar-toggle" id="sidebarToggle" aria-label="Toggle menu">☰</button>
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-brand">
        <div class="sidebar-brand-icon">📄</div>
        <div class="sidebar-brand-text">
          <h1>InvoiceHub</h1>
          <p>Sistem Rekap Invoice</p>
        </div>
      </div>
      <nav class="sidebar-nav">
        ${mainItems.map(item => `
          <div class="sidebar-nav-item ${activePage === item.id ? 'active' : ''}"
               data-page="${item.id}" id="nav-${item.id}">
            <span class="sidebar-nav-icon">${item.icon}</span>
            <span>${item.label}</span>
          </div>
        `).join('')}

        <div class="sidebar-section-label">Rekap per Layanan</div>
        ${rekapItems.map(item => `
          <div class="sidebar-nav-item sidebar-nav-sub ${activePage === item.id ? 'active' : ''}"
               data-page="${item.id}" id="nav-${item.id}">
            <span class="sidebar-nav-icon">${item.icon}</span>
            <span>${item.label}</span>
          </div>
        `).join('')}
      </nav>
      <div class="sidebar-footer">
        <button class="theme-toggle-btn" id="themeToggle" title="${themeLabel}">
          <span class="theme-toggle-icon">${themeIcon}</span>
          <span class="theme-toggle-label">${themeLabel}</span>
          <span class="theme-toggle-track">
            <span class="theme-toggle-thumb"></span>
          </span>
        </button>
        <div class="sidebar-copyright">© 2026 InvoiceHub</div>
      </div>
    </aside>
  `;
}

export function initSidebarEvents(onNavigate) {
  // Nav item clicks
  document.querySelectorAll('.sidebar-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      onNavigate(page);
    });
  });

  // Theme toggle
  const themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const isLight = document.body.dataset.theme === 'light';
      const newTheme = isLight ? 'dark' : 'light';
      document.body.dataset.theme = newTheme;
      localStorage.setItem('invoiceHubTheme', newTheme);
      // Update toggle button
      const icon = themeBtn.querySelector('.theme-toggle-icon');
      const label = themeBtn.querySelector('.theme-toggle-label');
      if (icon) icon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
      if (label) label.textContent = newTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
      themeBtn.title = newTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
    });
  }

  // Mobile toggle
  const toggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  if (toggle && sidebar) {
    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 768 &&
          sidebar.classList.contains('open') &&
          !sidebar.contains(e.target) &&
          e.target !== toggle) {
        sidebar.classList.remove('open');
      }
    });
  }
}
