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
        <div>© 2026 InvoiceHub</div>
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
