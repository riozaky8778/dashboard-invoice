/**
 * Invoice Table Page Component
 * Full CRUD table with sorting, filtering, search, and pagination
 */

import { fetchInvoices, createInvoice, updateInvoice, deleteInvoice } from '../api.js';
import {
  formatIDR, formatSAR, formatTanggal,
  getStatusBayarClass, getStatusLayananClass,
  isOverdue, isDeadlineApproaching,
  cleanCatatan,
} from '../utils/formatter.js';
import { renderInvoiceFormModal, initFormEvents } from './invoiceForm.js';
import { showToast, showConfirm } from './toast.js';

let allInvoices = [];
let filteredInvoices = [];
let currentPage = 1;
const PAGE_SIZE = 10;
let sortKey = 'no';
let sortDir = 'desc';
let searchQuery = '';
let filterStatusBayar = '';
let filterStatusLayanan = '';
let filterJenisLayanan = '';

export async function renderInvoiceTable() {
  return `
    <div class="main-content" id="mainContent">
      <div class="page-header animate-in">
        <h2>Data Invoice</h2>
        <p>Kelola semua data invoice dan status pembayaran</p>
      </div>
      <div id="invoiceTableContent">
        <div class="loading-overlay">
          <div class="spinner"></div>
          <div class="loading-text">Memuat data invoice...</div>
        </div>
      </div>
      <div id="modalContainer"></div>
    </div>
  `;
}

export async function initInvoiceTable() {
  try {
    allInvoices = await fetchInvoices();
    applyFilters();
    renderTable();
  } catch (error) {
    const container = document.getElementById('invoiceTableContent');
    if (container) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">❌</div>
          <div class="empty-state-text">Gagal memuat data: ${error.message}</div>
        </div>
      `;
    }
  }
}

function applyFilters() {
  filteredInvoices = allInvoices.filter(inv => {
    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const searchFields = [
        inv.noInvoice, inv.noReceipt, inv.agenCustomer, inv.pic, inv.cabang,
        inv.jenisLayanan, inv.detailLayanan, inv.supplierVendor, inv.nomorBooking,
        inv.statusBayar, inv.statusLayanan, inv.metodePembayaran, inv.catatan
      ].map(f => (f || '').toLowerCase());
      if (!searchFields.some(f => f.includes(q))) return false;
    }

    // Filter status bayar
    if (filterStatusBayar && inv.statusBayar !== filterStatusBayar) return false;

    // Filter status layanan
    if (filterStatusLayanan && inv.statusLayanan !== filterStatusLayanan) return false;

    // Filter jenis layanan
    if (filterJenisLayanan && inv.jenisLayanan !== filterJenisLayanan) return false;

    return true;
  });

  // Sort
  filteredInvoices.sort((a, b) => {
    let valA = a[sortKey];
    let valB = b[sortKey];

    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    if (valA < valB) return sortDir === 'asc' ? -1 : 1;
    if (valA > valB) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  // Reset to first page when filters change
  const totalPages = Math.ceil(filteredInvoices.length / PAGE_SIZE);
  if (currentPage > totalPages) currentPage = 1;
}

function renderTable() {
  const container = document.getElementById('invoiceTableContent');
  if (!container) return;

  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / PAGE_SIZE));
  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const pageInvoices = filteredInvoices.slice(startIdx, startIdx + PAGE_SIZE);

  container.innerHTML = `
    <div class="card table-card animate-in">
      <div class="table-header">
        <h3>Semua Invoice (${filteredInvoices.length})</h3>
        <div class="table-actions">
          <div class="search-input-wrapper">
            <span class="search-icon">🔍</span>
            <input type="text" class="search-input" id="searchInput"
                   placeholder="Cari invoice..." value="${searchQuery}" />
          </div>
          
          <select class="filter-select" id="filterStatusBayar">
            <option value="">Semua Status Bayar</option>
            <option value="Menunggu Pembayaran" ${filterStatusBayar === 'Menunggu Pembayaran' ? 'selected' : ''}>Menunggu Pembayaran</option>
            <option value="DP" ${filterStatusBayar === 'DP' ? 'selected' : ''}>DP</option>
            <option value="Lunas" ${filterStatusBayar === 'Lunas' ? 'selected' : ''}>Lunas</option>
            <option value="Jatuh Tempo" ${filterStatusBayar === 'Jatuh Tempo' ? 'selected' : ''}>Jatuh Tempo</option>
            <option value="Refund Diproses" ${filterStatusBayar === 'Refund Diproses' ? 'selected' : ''}>Refund Diproses</option>
            <option value="Refund Selesai" ${filterStatusBayar === 'Refund Selesai' ? 'selected' : ''}>Refund Selesai</option>
            <option value="Dibatalkan" ${filterStatusBayar === 'Dibatalkan' ? 'selected' : ''}>Dibatalkan</option>
          </select>

          <select class="filter-select" id="filterStatusLayanan">
            <option value="">Semua Status Layanan</option>
            <option value="Menunggu Konfirmasi" ${filterStatusLayanan === 'Menunggu Konfirmasi' ? 'selected' : ''}>Menunggu Konfirmasi</option>
            <option value="Dikonfirmasi" ${filterStatusLayanan === 'Dikonfirmasi' ? 'selected' : ''}>Dikonfirmasi</option>
            <option value="Terjadwal" ${filterStatusLayanan === 'Terjadwal' ? 'selected' : ''}>Terjadwal</option>
            <option value="Sedang Berlangsung" ${filterStatusLayanan === 'Sedang Berlangsung' ? 'selected' : ''}>Sedang Berlangsung</option>
            <option value="Selesai" ${filterStatusLayanan === 'Selesai' ? 'selected' : ''}>Selesai</option>
            <option value="Dibatalkan" ${filterStatusLayanan === 'Dibatalkan' ? 'selected' : ''}>Dibatalkan</option>
            <option value="Kedaluwarsa" ${filterStatusLayanan === 'Kedaluwarsa' ? 'selected' : ''}>Kedaluwarsa</option>
          </select>

          <select class="filter-select" id="filterJenisLayanan">
            <option value="">Semua Layanan</option>
            <option value="Hotel (HT)" ${filterJenisLayanan === 'Hotel (HT)' ? 'selected' : ''}>Hotel (HT)</option>
            <option value="Restaurant (RT)" ${filterJenisLayanan === 'Restaurant (RT)' ? 'selected' : ''}>Restaurant (RT)</option>
            <option value="Flight (FL)" ${filterJenisLayanan === 'Flight (FL)' ? 'selected' : ''}>Flight (FL)</option>
            <option value="Visa (VIS)" ${filterJenisLayanan === 'Visa (VIS)' ? 'selected' : ''}>Visa (VIS)</option>
            <option value="Full Package (FP)" ${filterJenisLayanan === 'Full Package (FP)' ? 'selected' : ''}>Full Package (FP)</option>
            <option value="Land Arrangement (LA)" ${filterJenisLayanan === 'Land Arrangement (LA)' ? 'selected' : ''}>Land Arrangement (LA)</option>
            <option value="Kereta Cepat (KP)" ${filterJenisLayanan === 'Kereta Cepat (KP)' ? 'selected' : ''}>Kereta Cepat (KP)</option>
          </select>

          <button class="btn btn-primary" id="btnAddInvoice">
            <span>＋</span> Tambah
          </button>
        </div>
      </div>
      
      <div class="data-table-wrapper">
        <table class="data-table" id="invoiceDataTable">
          <thead>
            <tr>
              ${buildTableHeader('no', 'No')}
              ${buildTableHeader('tanggalInvoice', 'Tgl Invoice')}
              ${buildTableHeader('noInvoice', 'No Invoice')}
              ${buildTableHeader('noReceipt', 'No Receipt')}
              ${buildTableHeader('agenCustomer', 'Agen / Customer')}
              ${buildTableHeader('pic', 'PIC')}
              ${buildTableHeader('cabang', 'Cabang')}
              ${buildTableHeader('jenisLayanan', 'Jenis Layanan')}
              ${buildTableHeader('detailLayanan', 'Detail Layanan')}
              ${buildTableHeader('tanggalKeberangkatan', 'Tgl Keberangkatan')}
              ${buildTableHeader('tanggalSelesai', 'Tgl Selesai')}
              ${buildTableHeader('supplierVendor', 'Supplier / Vendor')}
              ${buildTableHeader('nomorBooking', 'PNR / Booking')}
              ${buildTableHeader('totalIDR', 'Total (IDR)')}
              ${buildTableHeader('totalSAR', 'Total (SAR)')}
              ${buildTableHeader('kurs', 'Kurs')}
              ${buildTableHeader('nominalDP', 'Nominal DP')}
              ${buildTableHeader('totalTerbayar', 'Terbayar')}
              ${buildTableHeader('sisaTagihan', 'Sisa Tagihan')}
              ${buildTableHeader('batasWaktuDP', 'Batas DP')}
              ${buildTableHeader('batasWaktuPelunasan', 'Batas Pelunasan')}
              ${buildTableHeader('statusBayar', 'Status Bayar')}
              ${buildTableHeader('metodePembayaran', 'Metode Bayar')}
              ${buildTableHeader('statusLayanan', 'Status Layanan')}
              ${buildTableHeader('catatan', 'Catatan')}
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${pageInvoices.length === 0 ? `
              <tr><td colspan="26">
                <div class="empty-state">
                  <div class="empty-state-icon">📭</div>
                  <div class="empty-state-text">Tidak ada invoice ditemukan</div>
                </div>
              </td></tr>
            ` : pageInvoices.map(inv => renderRow(inv)).join('')}
          </tbody>
        </table>
      </div>
      ${filteredInvoices.length > PAGE_SIZE ? `
        <div class="table-footer">
          <div class="table-info">
            Menampilkan ${startIdx + 1}-${Math.min(startIdx + PAGE_SIZE, filteredInvoices.length)}
            dari ${filteredInvoices.length} invoice
          </div>
          <div class="pagination">
            <button class="pagination-btn" data-page="prev" ${currentPage <= 1 ? 'disabled' : ''}>‹</button>
            ${buildPaginationButtons(totalPages)}
            <button class="pagination-btn" data-page="next" ${currentPage >= totalPages ? 'disabled' : ''}>›</button>
          </div>
        </div>
      ` : ''}
    </div>
  `;

  bindTableEvents();
}

function buildTableHeader(key, label) {
  const isActive = sortKey === key;
  const icon = isActive ? (sortDir === 'asc' ? '↑' : '↓') : '↕';
  return `<th class="${isActive ? 'sort-active' : ''}" data-sort="${key}">
    ${label} <span class="sort-icon">${icon}</span>
  </th>`;
}

function renderRow(inv) {
  const overdueClass = inv.statusBayar === 'Jatuh Tempo' ? 'row-overdue' : '';
  const deadlineClass = isOverdue(inv.batasWaktuPelunasan) ? 'date-overdue' :
                        isDeadlineApproaching(inv.batasWaktuPelunasan) ? 'date-approaching' : '';
  const sisaClass = inv.sisaTagihan <= 0 ? 'sisa-zero' : '';

  // Check if this invoice has multi-item data
  const hasDetailItems = inv.catatan && inv.catatan.includes('__DATA_PESANAN__');
  const detailToggle = hasDetailItems
    ? `<button class="row-action-btn btn-detail" data-no="${inv.no}" title="Lihat Detail" style="font-size:1rem">▶</button>`
    : '';

  return `
    <tr class="invoice-main-row ${overdueClass}" data-no="${inv.no}">
      <td style="font-weight:600;color:var(--text-muted);white-space:nowrap">
        ${detailToggle} ${inv.no}
      </td>
      <td class="cell-date">${formatTanggal(inv.tanggalInvoice)}</td>
      <td style="font-weight:600;color:var(--text-accent)">${inv.noInvoice}</td>
      <td>${inv.noReceipt || '-'}</td>
      <td>${inv.agenCustomer || '-'}</td>
      <td>${inv.pic || '-'}</td>
      <td>${inv.cabang || '-'}</td>
      <td>${inv.jenisLayanan || '-'}</td>
      <td>${inv.detailLayanan || '-'}</td>
      <td class="cell-date">${formatTanggal(inv.tanggalKeberangkatan)}</td>
      <td class="cell-date">${formatTanggal(inv.tanggalSelesai)}</td>
      <td>${inv.supplierVendor || '-'}</td>
      <td><code style="color:var(--text-primary);background:rgba(255,255,255,0.04);padding:2px 6px;border-radius:4px">${inv.nomorBooking || '-'}</code></td>
      <td class="cell-currency currency-idr">${formatIDR(inv.totalIDR)}</td>
      <td class="cell-currency currency-sar">${formatSAR(inv.totalSAR)}</td>
      <td style="color:var(--text-muted);font-variant-numeric:tabular-nums">${inv.kurs || '-'}</td>
      <td class="cell-currency currency-idr">${formatIDR(inv.nominalDP)}</td>
      <td class="cell-currency currency-idr">${formatIDR(inv.totalTerbayar)}</td>
      <td class="cell-currency currency-sisa ${sisaClass}">${formatIDR(inv.sisaTagihan)}</td>
      <td class="cell-date">${formatTanggal(inv.batasWaktuDP)}</td>
      <td class="cell-date ${deadlineClass}">${formatTanggal(inv.batasWaktuPelunasan)}</td>
      <td><span class="badge ${getStatusBayarClass(inv.statusBayar)}">${inv.statusBayar}</span></td>
      <td>${inv.metodePembayaran || '-'}</td>
      <td><span class="badge ${getStatusLayananClass(inv.statusLayanan)}">${inv.statusLayanan || '-'}</span></td>
      <td style="max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${cleanCatatan(inv.catatan)}">${cleanCatatan(inv.catatan) || '-'}</td>
      <td>
        <div class="row-actions">
          <button class="row-action-btn btn-edit" data-no="${inv.no}" title="Edit">✏️</button>
          <button class="row-action-btn btn-delete" data-no="${inv.no}" title="Hapus">🗑️</button>
        </div>
      </td>
    </tr>
    <tr class="detail-expand-row" id="detail-row-${inv.no}" style="display:none;">
      <td colspan="27" style="padding:0;">
        <div class="detail-expand-panel" id="detail-panel-${inv.no}"></div>
      </td>
    </tr>
  `;
}

function parseOrderItems(catatan) {
  if (!catatan || !catatan.includes('__DATA_PESANAN__')) return [];
  try {
    const jsonStr = catatan.split('__DATA_PESANAN__')[1].trim();
    return JSON.parse(jsonStr);
  } catch (e) {
    return [];
  }
}

function renderDetailPanel(inv) {
  const items = parseOrderItems(inv.catatan);
  if (!items.length) return '<p style="padding:16px;color:var(--text-muted)">Tidak ada rincian pesanan.</p>';

  const kurs = parseFloat(inv.kurs) || 4290;
  let html = `<div class="detail-panel-inner">`;

  // Summary header
  html += `
    <div class="detail-panel-header">
      <div>
        <span class="detail-label">Invoice:</span> <strong>${inv.noInvoice}</strong>
        &nbsp;·&nbsp;
        <span class="detail-label">Agen:</span> <strong>${inv.agenCustomer}</strong>
      </div>
      <div style="display:flex;gap:16px;">
        <span><span class="detail-label">Total IDR:</span> <strong class="currency-idr">${formatIDR(inv.totalIDR)}</strong></span>
        <span><span class="detail-label">Total SAR:</span> <strong class="currency-sar">${formatSAR(inv.totalSAR)}</strong></span>
        <span><span class="detail-label">Sisa:</span> <strong style="color:${inv.sisaTagihan > 0 ? 'var(--color-danger)' : 'var(--color-success)'}">${formatIDR(inv.sisaTagihan)}</strong></span>
      </div>
    </div>
  `;

  // Render each item by type
  items.forEach((item, index) => {
    const c = item.calcData || {};
    const jenis = item.jenisLayanan || '-';
    const startDate = item.tanggalKeberangkatan ? formatTanggal(item.tanggalKeberangkatan) : '-';
    const endDate = item.tanggalSelesai ? formatTanggal(item.tanggalSelesai) : '-';

    html += `<div class="detail-section">`;
    html += `<div class="detail-section-title">${jenis}</div>`;

    if (item.jenisLayanan === 'Hotel (HT)') {
      const nights = c.nights || 0;
      const roomTypes = ['DB', 'TP', 'QD', 'QN'];
      const qtys = { DB: c.qtyDB || 0, TP: c.qtyTP || 0, QD: c.qtyQD || 0, QN: c.qtyQN || 0 };
      const rates = { DB: c.rateDB || 0, TP: c.rateTP || 0, QD: c.rateQD || 0, QN: c.rateQN || 0 };
      const totalRoomRate = roomTypes.reduce((sum, t) => sum + (qtys[t] * rates[t]), 0);
      const totalAmount = totalRoomRate * nights;

      html += `
        <table class="detail-table">
          <thead>
            <tr>
              <th>CI</th><th>CO</th><th>Night</th>
              <th>Hotel Makkah/Madinah</th><th>Meals</th><th>Pax</th>
              <th colspan="4" class="group-header">Room Type (Qty)</th>
              <th colspan="4" class="group-header">Room Rate (SAR)</th>
              <th>Amount (SAR)</th>
            </tr>
            <tr class="sub-header">
              <th></th><th></th><th></th><th></th><th></th><th></th>
              <th>DB</th><th>TP</th><th>QD</th><th>QN</th>
              <th>DB</th><th>TP</th><th>QD</th><th>QN</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${startDate}</td>
              <td>${endDate}</td>
              <td>${nights}</td>
              <td>${c.hotelName || '-'}</td>
              <td>${c.meals || 'FB'}</td>
              <td>${c.pax || '-'}</td>
              <td>${qtys.DB || ''}</td><td>${qtys.TP || ''}</td><td>${qtys.QD || ''}</td><td>${qtys.QN || ''}</td>
              <td>${rates.DB ? rates.DB.toLocaleString() : ''}</td>
              <td>${rates.TP ? rates.TP.toLocaleString() : ''}</td>
              <td>${rates.QD ? rates.QD.toLocaleString() : ''}</td>
              <td>${rates.QN ? rates.QN.toLocaleString() : ''}</td>
              <td class="amount-cell">${totalAmount.toLocaleString('id-ID')}</td>
            </tr>
          </tbody>
        </table>
      `;

    } else if (item.jenisLayanan === 'Restaurant (RT)') {
      const days = c.days || 0;
      const freq = c.freq || 0;
      const pax = c.pax || 0;
      const price = c.price || 0;
      const amount = days * freq * pax * price;

      html += `
        <table class="detail-table">
          <thead><tr><th>Date</th><th>Day</th><th>Type</th><th>Frekuensi</th><th>Pax</th><th>Price Meals/Pax (SAR)</th><th>Amount (SAR)</th></tr></thead>
          <tbody>
            <tr>
              <td>${startDate}</td>
              <td>${days}</td>
              <td>${c.mealsType || 'Fullboard'}</td>
              <td>${freq}</td>
              <td>${pax}</td>
              <td>${price.toLocaleString('id-ID')}</td>
              <td class="amount-cell">${amount.toLocaleString('id-ID')}</td>
            </tr>
          </tbody>
        </table>
      `;

    } else if (item.jenisLayanan === 'Flight (FL)') {
      const pax = c.pax || 0;
      const price = c.price || 0;
      const amount = pax * price;

      html += `
        <table class="detail-table">
          <thead><tr><th>Startdate</th><th>Enddate</th><th>Segment</th><th>Type</th><th>Pax</th><th>Price/Pax (IDR)</th><th>Amount (IDR)</th></tr></thead>
          <tbody>
            <tr>
              <td>${startDate}</td>
              <td>${endDate}</td>
              <td>${c.segment || '-'}</td>
              <td>${c.flightType || 'Return'}</td>
              <td>${pax}</td>
              <td>${price.toLocaleString('id-ID')}</td>
              <td class="amount-cell">${amount.toLocaleString('id-ID')}</td>
            </tr>
          </tbody>
        </table>
      `;

    } else if (item.jenisLayanan === 'Full Package (FP)' || item.jenisLayanan === 'Land Arrangement (LA)') {
      const pax = c.pax || 0;
      const price = c.price || 0;
      const amount = pax * price;

      html += `
        <table class="detail-table">
          <thead><tr><th>Date</th><th>Group</th><th>Pax</th><th>Price/Pax (IDR)</th><th>Amount (IDR)</th></tr></thead>
          <tbody>
            <tr>
              <td>${startDate}</td>
              <td>${c.groupName || '-'}</td>
              <td>${pax}</td>
              <td>${price.toLocaleString('id-ID')}</td>
              <td class="amount-cell">${amount.toLocaleString('id-ID')}</td>
            </tr>
          </tbody>
        </table>
      `;

    } else if (item.jenisLayanan === 'Visa (VIS)') {
      const pax = c.pax || 0;
      const price = c.price || 0;
      const amount = pax * price;

      html += `
        <table class="detail-table">
          <thead><tr><th>Startdate</th><th>Enddate</th><th>Item</th><th>Pax</th><th>Price/Pax (SAR)</th><th>Amount (SAR)</th></tr></thead>
          <tbody>
            <tr>
              <td>${startDate}</td>
              <td>${endDate}</td>
              <td>${c.visaItem || 'Visa'}</td>
              <td>${pax}</td>
              <td>${price.toLocaleString('id-ID')}</td>
              <td class="amount-cell">${amount.toLocaleString('id-ID')}</td>
            </tr>
          </tbody>
        </table>
      `;

    } else {
      // Default / Lainnya
      const pax = c.pax || 0;
      const idr = c.manualIDR || 0;
      const sar = c.manualSAR || 0;
      const amount = pax ? (idr ? pax * idr : pax * sar) : (idr || sar);
      const currency = idr ? 'IDR' : 'SAR';

      html += `
        <table class="detail-table">
          <thead><tr><th>Date</th><th>Deskripsi</th><th>Pax</th><th>Harga/Pax (${currency})</th><th>Amount (${currency})</th></tr></thead>
          <tbody>
            <tr>
              <td>${startDate}</td>
              <td>${c.manualDesc || '-'}</td>
              <td>${pax}</td>
              <td>${(idr || sar).toLocaleString('id-ID')}</td>
              <td class="amount-cell">${amount.toLocaleString('id-ID')}</td>
            </tr>
          </tbody>
        </table>
      `;
    }

    if (item.nomorBooking || item.supplierVendor) {
      html += `<div class="detail-meta">`;
      if (item.supplierVendor) html += `<span><span class="detail-label">Vendor:</span> ${item.supplierVendor}</span>`;
      if (item.nomorBooking) html += `<span><span class="detail-label">Booking:</span> <code>${item.nomorBooking}</code></span>`;
      html += `</div>`;
    }

    html += `</div>`; // end detail-section
  });

  html += `</div>`; // end detail-panel-inner
  return html;
}

function buildPaginationButtons(totalPages) {
  let buttons = '';
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    buttons += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }
  return buttons;
}

function bindTableEvents() {
  // Search
  const searchInput = document.getElementById('searchInput');
  let searchTimeout;
  searchInput?.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchQuery = e.target.value.trim();
      currentPage = 1;
      applyFilters();
      renderTable();
    }, 300);
  });

  // Filter status bayar
  document.getElementById('filterStatusBayar')?.addEventListener('change', (e) => {
    filterStatusBayar = e.target.value;
    currentPage = 1;
    applyFilters();
    renderTable();
  });

  // Filter status layanan
  document.getElementById('filterStatusLayanan')?.addEventListener('change', (e) => {
    filterStatusLayanan = e.target.value;
    currentPage = 1;
    applyFilters();
    renderTable();
  });

  // Filter jenis layanan
  document.getElementById('filterJenisLayanan')?.addEventListener('change', (e) => {
    filterJenisLayanan = e.target.value;
    currentPage = 1;
    applyFilters();
    renderTable();
  });

  // Sort
  document.querySelectorAll('[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const key = th.dataset.sort;
      if (sortKey === key) {
        sortDir = sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        sortKey = key;
        sortDir = 'asc';
      }
      applyFilters();
      renderTable();
    });
  });

  // Pagination
  document.querySelectorAll('.pagination-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;
      if (page === 'prev') currentPage--;
      else if (page === 'next') currentPage++;
      else currentPage = parseInt(page);
      renderTable();
    });
  });

  // Add invoice
  document.getElementById('btnAddInvoice')?.addEventListener('click', () => {
    openFormModal(null);
  });

  // Edit buttons
  document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const no = parseInt(btn.dataset.no);
      const invoice = allInvoices.find(inv => inv.no === no);
      if (invoice) openFormModal(invoice);
    });
  });

  // Detail expand buttons
  document.querySelectorAll('.btn-detail').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const no = parseInt(btn.dataset.no);
      const invoice = allInvoices.find(inv => inv.no === no);
      if (!invoice) return;

      const detailRow = document.getElementById(`detail-row-${no}`);
      const detailPanel = document.getElementById(`detail-panel-${no}`);
      if (!detailRow || !detailPanel) return;

      const isOpen = detailRow.style.display !== 'none';
      if (isOpen) {
        detailRow.style.display = 'none';
        btn.textContent = '▶';
        btn.title = 'Lihat Detail';
      } else {
        detailPanel.innerHTML = renderDetailPanel(invoice);
        detailRow.style.display = 'table-row';
        btn.textContent = '▼';
        btn.title = 'Tutup Detail';
      }
    });
  });

  // Delete buttons
  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      const no = parseInt(btn.dataset.no);
      const invoice = allInvoices.find(inv => inv.no === no);
      if (!invoice) return;

      const confirmed = await showConfirm(
        'Hapus Invoice?',
        `Apakah Anda yakin ingin menghapus invoice <strong>${invoice.noInvoice}</strong>? Tindakan ini tidak dapat dibatalkan.`
      );

      if (confirmed) {
        try {
          await deleteInvoice(no);
          allInvoices = allInvoices.filter(inv => inv.no !== no);
          applyFilters();
          renderTable();
          showToast('Invoice berhasil dihapus', 'success');
        } catch (error) {
          showToast('Gagal menghapus invoice: ' + error.message, 'error');
        }
      }
    });
  });
}

function openFormModal(invoice) {
  const modalContainer = document.getElementById('modalContainer');
  if (!modalContainer) return;

  modalContainer.innerHTML = renderInvoiceFormModal(invoice);

  initFormEvents(
    async (data) => {
      try {
        if (invoice) {
          // Update
          const updated = await updateInvoice(invoice.no, data);
          const idx = allInvoices.findIndex(inv => inv.no === invoice.no);
          if (idx !== -1) allInvoices[idx] = updated;
          showToast('Invoice berhasil diupdate', 'success');
        } else {
          // Create
          const created = await createInvoice(data);
          allInvoices.push(created);
          showToast('Invoice baru berhasil ditambahkan', 'success');
        }
        applyFilters();
        renderTable();
      } catch (error) {
        showToast('Gagal menyimpan invoice: ' + error.message, 'error');
      }
    },
    () => {
      modalContainer.innerHTML = '';
    },
    invoice
  );
}
