/**
 * InvoiceHub - Main Entry Point
 * Simple SPA router with sidebar navigation
 */

import './style.css';
import { renderSidebar, initSidebarEvents } from './components/sidebar.js';
import { renderDashboard, initDashboard } from './components/dashboard.js';
import { renderInvoiceTable, initInvoiceTable } from './components/invoiceTable.js';

let currentPage = 'dashboard';

async function renderApp() {
  const app = document.getElementById('app');
  if (!app) return;

  // Render sidebar + page content
  const sidebarHTML = renderSidebar(currentPage);
  let pageHTML = '';

  switch (currentPage) {
    case 'dashboard':
      pageHTML = await renderDashboard();
      break;
    case 'invoices':
      pageHTML = await renderInvoiceTable();
      break;
    default:
      pageHTML = await renderDashboard();
  }

  app.innerHTML = sidebarHTML + pageHTML;

  // Initialize sidebar events
  initSidebarEvents((page) => {
    navigateTo(page);
  });

  // Initialize page-specific logic
  switch (currentPage) {
    case 'dashboard':
      await initDashboard();
      break;
    case 'invoices':
      await initInvoiceTable();
      break;
  }
}

function navigateTo(page) {
  if (page === currentPage) return;
  currentPage = page;

  // Update URL hash
  window.location.hash = page;

  renderApp();
}

// Handle browser back/forward
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.replace('#', '') || 'dashboard';
  if (hash !== currentPage) {
    currentPage = hash;
    renderApp();
  }
});

// Initialize
function init() {
  // Read initial page from hash
  const hash = window.location.hash.replace('#', '');
  if (hash && ['dashboard', 'invoices'].includes(hash)) {
    currentPage = hash;
  }

  renderApp();
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
