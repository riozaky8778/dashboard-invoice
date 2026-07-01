/**
 * InvoiceHub - Main Entry Point
 * Simple SPA router with sidebar navigation
 */

import './style.css';
import { renderSidebar, initSidebarEvents } from './components/sidebar.js';
import { renderDashboard, initDashboard } from './components/dashboard.js';
import { renderInvoiceTable, initInvoiceTable } from './components/invoiceTable.js';
import { renderRekapPage, initRekapPage } from './components/rekapDetail.js';

const VALID_PAGES = ['dashboard', 'invoices', 'rekap-hotel', 'rekap-restaurant', 'rekap-flight', 'rekap-visa', 'rekap-umroh'];
const REKAP_PAGES = ['rekap-hotel', 'rekap-restaurant', 'rekap-flight', 'rekap-visa', 'rekap-umroh'];

let currentPage = 'dashboard';

async function renderApp() {
  const app = document.getElementById('app');
  if (!app) return;

  // Render sidebar + page content
  const sidebarHTML = renderSidebar(currentPage);
  let pageHTML = '';

  if (REKAP_PAGES.includes(currentPage)) {
    pageHTML = await renderRekapPage(currentPage);
  } else {
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
  }

  app.innerHTML = sidebarHTML + pageHTML;

  // Initialize sidebar events
  initSidebarEvents((page) => {
    navigateTo(page);
  });

  // Initialize page-specific logic
  if (REKAP_PAGES.includes(currentPage)) {
    await initRekapPage(currentPage);
  } else {
    switch (currentPage) {
      case 'dashboard':
        await initDashboard();
        break;
      case 'invoices':
        await initInvoiceTable();
        break;
    }
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
  if (hash && VALID_PAGES.includes(hash)) {
    currentPage = hash;
  }

  renderApp();
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
