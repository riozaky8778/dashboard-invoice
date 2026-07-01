/**
 * Rekap Detail Pages
 * Shows aggregated breakdown of all invoices by service type
 */

import { fetchInvoices } from '../api.js';
import { formatIDR, formatSAR, formatTanggal } from '../utils/formatter.js';

const SERVICE_PAGES = {
  'rekap-hotel':       { label: 'Rekap Hotel',       icon: '🏨', jenisLayanan: 'Hotel (HT)' },
  'rekap-restaurant':  { label: 'Rekap Restaurant',  icon: '🍽️', jenisLayanan: 'Restaurant (RT)' },
  'rekap-flight':      { label: 'Rekap Penerbangan', icon: '✈️', jenisLayanan: 'Flight (FL)' },
  'rekap-visa':        { label: 'Rekap Visa',         icon: '🛂', jenisLayanan: 'Visa (VIS)' },
  'rekap-umroh':       { label: 'Rekap Umroh/FP',    icon: '🕌', jenisLayanan: ['Full Package (FP)', 'Land Arrangement (LA)'] },
};

export function getServicePages() {
  return SERVICE_PAGES;
}

function parseOrderItems(catatan) {
  if (!catatan || !catatan.includes('__DATA_PESANAN__')) return [];
  try {
    return JSON.parse(catatan.split('__DATA_PESANAN__')[1].trim());
  } catch (e) {
    return [];
  }
}

function matchesJenis(itemJenis, target) {
  if (Array.isArray(target)) return target.includes(itemJenis);
  return itemJenis === target;
}

export async function renderRekapPage(pageId) {
  const config = SERVICE_PAGES[pageId];
  if (!config) return '<div class="page-content"><p>Halaman tidak ditemukan.</p></div>';

  return `
    <div class="main-content">
      <div style="margin-bottom:24px;">
        <h2 style="font-size:1.5rem;font-weight:800;color:var(--text-primary);display:flex;align-items:center;gap:10px;">
          ${config.icon} ${config.label}
        </h2>
        <p style="color:var(--text-muted);font-size:0.85rem;margin-top:4px;">Rekap seluruh item layanan dari semua invoice</p>
      </div>
      <div id="rekapContent">
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p>Memuat data...</p>
        </div>
      </div>
    </div>
  `;
}

export async function initRekapPage(pageId) {
  const config = SERVICE_PAGES[pageId];
  const container = document.getElementById('rekapContent');
  if (!container || !config) return;

  try {
    const invoices = await fetchInvoices();

    // Collect matching items from all invoices
    const rows = [];
    invoices.forEach(inv => {
      const items = parseOrderItems(inv.catatan);
      items.forEach(item => {
        if (matchesJenis(item.jenisLayanan, config.jenisLayanan)) {
          rows.push({ inv, item });
        }
      });

      // Fallback for old invoices without JSON data
      if (items.length === 0 && matchesJenis(inv.jenisLayanan, config.jenisLayanan)) {
        rows.push({ inv, item: { jenisLayanan: inv.jenisLayanan, calcData: {}, tanggalKeberangkatan: inv.tanggalKeberangkatan, tanggalSelesai: inv.tanggalSelesai, supplierVendor: inv.supplierVendor, nomorBooking: inv.nomorBooking } });
      }
    });

    if (rows.length === 0) {
      container.innerHTML = `<div class="empty-state"><p>Belum ada data ${config.label}.</p></div>`;
      return;
    }

    // Build stats
    const totalInvoices = new Set(rows.map(r => r.inv.no)).size;

    let statsHTML = `
      <div class="rekap-stats">
        <div class="rekap-stat-card">
          <div class="rekap-stat-value">${totalInvoices}</div>
          <div class="rekap-stat-label">Invoice</div>
        </div>
        <div class="rekap-stat-card">
          <div class="rekap-stat-value">${rows.length}</div>
          <div class="rekap-stat-label">Total Item</div>
        </div>
        ${buildTypeStats(rows, pageId)}
      </div>
    `;

    // Build table
    let tableHTML = buildRekapTable(rows, pageId);

    container.innerHTML = statsHTML + tableHTML;
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><p style="color:var(--color-danger)">Gagal memuat data: ${err.message}</p></div>`;
  }
}

function buildTypeStats(rows, pageId) {
  if (pageId === 'rekap-hotel') {
    const totalPax = rows.reduce((s, r) => s + (r.item.calcData?.pax || 0), 0);
    const totalNights = rows.reduce((s, r) => s + (r.item.calcData?.nights || 0), 0);
    const totalSAR = rows.reduce((r, row) => {
      const c = row.item.calcData || {};
      const nights = c.nights || 0;
      const roomRate = ((c.qtyDB||0)*(c.rateDB||0)) + ((c.qtyTP||0)*(c.rateTP||0)) + ((c.qtyQD||0)*(c.rateQD||0)) + ((c.qtyQN||0)*(c.rateQN||0));
      return r + (roomRate * nights);
    }, 0);
    return `
      <div class="rekap-stat-card"><div class="rekap-stat-value">${totalPax.toLocaleString()}</div><div class="rekap-stat-label">Total Pax</div></div>
      <div class="rekap-stat-card"><div class="rekap-stat-value">${totalNights}</div><div class="rekap-stat-label">Total Malam</div></div>
      <div class="rekap-stat-card"><div class="rekap-stat-value currency-sar">${formatSAR(totalSAR)}</div><div class="rekap-stat-label">Total SAR</div></div>
    `;
  } else if (pageId === 'rekap-restaurant') {
    const totalPax = rows.reduce((s, r) => s + (r.item.calcData?.pax || 0), 0);
    const totalSAR = rows.reduce((s, r) => {
      const c = r.item.calcData || {};
      return s + ((c.days||0)*(c.freq||0)*(c.pax||0)*(c.price||0));
    }, 0);
    return `
      <div class="rekap-stat-card"><div class="rekap-stat-value">${totalPax.toLocaleString()}</div><div class="rekap-stat-label">Total Pax</div></div>
      <div class="rekap-stat-card"><div class="rekap-stat-value currency-sar">${formatSAR(totalSAR)}</div><div class="rekap-stat-label">Total SAR</div></div>
    `;
  } else if (pageId === 'rekap-flight') {
    const totalPax = rows.reduce((s, r) => s + (r.item.calcData?.pax || 0), 0);
    const totalIDR = rows.reduce((s, r) => {
      const c = r.item.calcData || {};
      return s + ((c.pax||0)*(c.price||0));
    }, 0);
    return `
      <div class="rekap-stat-card"><div class="rekap-stat-value">${totalPax.toLocaleString()}</div><div class="rekap-stat-label">Total Pax</div></div>
      <div class="rekap-stat-card"><div class="rekap-stat-value currency-idr">${formatIDR(totalIDR)}</div><div class="rekap-stat-label">Total IDR</div></div>
    `;
  } else if (pageId === 'rekap-visa') {
    const totalPax = rows.reduce((s, r) => s + (r.item.calcData?.pax || 0), 0);
    const totalSAR = rows.reduce((s, r) => {
      const c = r.item.calcData || {};
      return s + ((c.pax||0)*(c.price||0));
    }, 0);
    return `
      <div class="rekap-stat-card"><div class="rekap-stat-value">${totalPax.toLocaleString()}</div><div class="rekap-stat-label">Total Pax</div></div>
      <div class="rekap-stat-card"><div class="rekap-stat-value currency-sar">${formatSAR(totalSAR)}</div><div class="rekap-stat-label">Total SAR</div></div>
    `;
  } else if (pageId === 'rekap-umroh') {
    const totalPax = rows.reduce((s, r) => s + (r.item.calcData?.pax || 0), 0);
    const totalIDR = rows.reduce((s, r) => {
      const c = r.item.calcData || {};
      return s + ((c.pax||0)*(c.price||0));
    }, 0);
    return `
      <div class="rekap-stat-card"><div class="rekap-stat-value">${totalPax.toLocaleString()}</div><div class="rekap-stat-label">Total Pax</div></div>
      <div class="rekap-stat-card"><div class="rekap-stat-value currency-idr">${formatIDR(totalIDR)}</div><div class="rekap-stat-label">Total IDR</div></div>
    `;
  }
  return '';
}

function buildRekapTable(rows, pageId) {
  if (pageId === 'rekap-hotel') {
    let total = 0;
    const bodyRows = rows.map(({ inv, item }) => {
      const c = item.calcData || {};
      const nights = c.nights || 0;
      const qtys = { DB: c.qtyDB||0, TP: c.qtyTP||0, QD: c.qtyQD||0, QN: c.qtyQN||0 };
      const rates = { DB: c.rateDB||0, TP: c.rateTP||0, QD: c.rateQD||0, QN: c.rateQN||0 };
      const roomRate = Object.keys(qtys).reduce((s, t) => s + (qtys[t] * rates[t]), 0);
      const amount = roomRate * nights;
      total += amount;
      return `<tr>
        <td><span class="badge badge-purple">${inv.noInvoice}</span></td>
        <td>${inv.agenCustomer || '-'}</td>
        <td>${formatTanggal(item.tanggalKeberangkatan)}</td>
        <td>${formatTanggal(item.tanggalSelesai)}</td>
        <td>${nights}</td>
        <td>${c.hotelName || '-'}</td>
        <td>${c.meals || '-'}</td>
        <td>${c.pax || '-'}</td>
        <td>${qtys.DB||''}</td><td>${qtys.TP||''}</td><td>${qtys.QD||''}</td><td>${qtys.QN||''}</td>
        <td>${rates.DB ? rates.DB.toLocaleString() : ''}</td>
        <td>${rates.TP ? rates.TP.toLocaleString() : ''}</td>
        <td>${rates.QD ? rates.QD.toLocaleString() : ''}</td>
        <td>${rates.QN ? rates.QN.toLocaleString() : ''}</td>
        <td class="amount-cell currency-sar">${amount.toLocaleString('id-ID')}</td>
      </tr>`;
    }).join('');
    return `
      <div class="rekap-table-wrap">
        <table class="rekap-table">
          <thead>
            <tr>
              <th rowspan="2">No Invoice</th>
              <th rowspan="2">Agen</th>
              <th rowspan="2">CI</th>
              <th rowspan="2">CO</th>
              <th rowspan="2">Night</th>
              <th rowspan="2">Hotel</th>
              <th rowspan="2">Meals</th>
              <th rowspan="2">Pax</th>
              <th colspan="4" class="group-header">Room Type (Qty)</th>
              <th colspan="4" class="group-header">Room Rate (SAR)</th>
              <th rowspan="2">Amount (SAR)</th>
            </tr>
            <tr class="sub-header">
              <th>DB</th><th>TP</th><th>QD</th><th>QN</th>
              <th>DB</th><th>TP</th><th>QD</th><th>QN</th>
            </tr>
          </thead>
          <tbody>${bodyRows}</tbody>
          <tfoot>
            <tr>
              <td colspan="16" style="text-align:right;font-weight:700;color:var(--text-muted)">TOTAL</td>
              <td class="amount-cell currency-sar" style="font-weight:700">${total.toLocaleString('id-ID')}</td>
            </tr>
          </tfoot>
        </table>
      </div>`;

  } else if (pageId === 'rekap-restaurant') {
    let total = 0;
    const bodyRows = rows.map(({ inv, item }) => {
      const c = item.calcData || {};
      const amount = (c.days||0)*(c.freq||0)*(c.pax||0)*(c.price||0);
      total += amount;
      return `<tr>
        <td><span class="badge badge-purple">${inv.noInvoice}</span></td>
        <td>${inv.agenCustomer || '-'}</td>
        <td>${formatTanggal(item.tanggalKeberangkatan)}</td>
        <td>${c.days||'-'}</td>
        <td>${c.mealsType || 'Fullboard'}</td>
        <td>${c.freq||'-'}</td>
        <td>${c.pax||'-'}</td>
        <td>${c.price ? c.price.toLocaleString('id-ID') : '-'}</td>
        <td class="amount-cell currency-sar">${amount.toLocaleString('id-ID')}</td>
      </tr>`;
    }).join('');
    return `
      <div class="rekap-table-wrap">
        <table class="rekap-table">
          <thead><tr>
            <th>No Invoice</th><th>Agen</th><th>Date</th><th>Day</th>
            <th>Type</th><th>Frekuensi</th><th>Pax</th>
            <th>Price/Meal/Pax (SAR)</th><th>Amount (SAR)</th>
          </tr></thead>
          <tbody>${bodyRows}</tbody>
          <tfoot><tr>
            <td colspan="8" style="text-align:right;font-weight:700;color:var(--text-muted)">TOTAL</td>
            <td class="amount-cell currency-sar" style="font-weight:700">${total.toLocaleString('id-ID')}</td>
          </tr></tfoot>
        </table>
      </div>`;

  } else if (pageId === 'rekap-flight') {
    let total = 0;
    const bodyRows = rows.map(({ inv, item }) => {
      const c = item.calcData || {};
      const amount = (c.pax||0)*(c.price||0);
      total += amount;
      return `<tr>
        <td><span class="badge badge-purple">${inv.noInvoice}</span></td>
        <td>${inv.agenCustomer || '-'}</td>
        <td>${formatTanggal(item.tanggalKeberangkatan)}</td>
        <td>${formatTanggal(item.tanggalSelesai)}</td>
        <td>${c.segment || '-'}</td>
        <td>${c.flightType || 'Return'}</td>
        <td>${c.pax||'-'}</td>
        <td>${c.price ? c.price.toLocaleString('id-ID') : '-'}</td>
        <td class="amount-cell currency-idr">${amount.toLocaleString('id-ID')}</td>
      </tr>`;
    }).join('');
    return `
      <div class="rekap-table-wrap">
        <table class="rekap-table">
          <thead><tr>
            <th>No Invoice</th><th>Agen</th><th>Startdate</th><th>Enddate</th>
            <th>Segment</th><th>Type</th><th>Pax</th>
            <th>Price/Pax (IDR)</th><th>Amount (IDR)</th>
          </tr></thead>
          <tbody>${bodyRows}</tbody>
          <tfoot><tr>
            <td colspan="8" style="text-align:right;font-weight:700;color:var(--text-muted)">TOTAL</td>
            <td class="amount-cell currency-idr" style="font-weight:700">${total.toLocaleString('id-ID')}</td>
          </tr></tfoot>
        </table>
      </div>`;

  } else if (pageId === 'rekap-visa') {
    let total = 0;
    const bodyRows = rows.map(({ inv, item }) => {
      const c = item.calcData || {};
      const amount = (c.pax||0)*(c.price||0);
      total += amount;
      return `<tr>
        <td><span class="badge badge-purple">${inv.noInvoice}</span></td>
        <td>${inv.agenCustomer || '-'}</td>
        <td>${formatTanggal(item.tanggalKeberangkatan)}</td>
        <td>${c.visaItem || 'Visa'}</td>
        <td>${c.pax||'-'}</td>
        <td>${c.price ? c.price.toLocaleString('id-ID') : '-'}</td>
        <td class="amount-cell currency-sar">${amount.toLocaleString('id-ID')}</td>
      </tr>`;
    }).join('');
    return `
      <div class="rekap-table-wrap">
        <table class="rekap-table">
          <thead><tr>
            <th>No Invoice</th><th>Agen</th><th>Startdate</th>
            <th>Item</th><th>Pax</th>
            <th>Price/Pax (SAR)</th><th>Amount (SAR)</th>
          </tr></thead>
          <tbody>${bodyRows}</tbody>
          <tfoot><tr>
            <td colspan="6" style="text-align:right;font-weight:700;color:var(--text-muted)">TOTAL</td>
            <td class="amount-cell currency-sar" style="font-weight:700">${total.toLocaleString('id-ID')}</td>
          </tr></tfoot>
        </table>
      </div>`;

  } else if (pageId === 'rekap-umroh') {
    let total = 0;
    const bodyRows = rows.map(({ inv, item }) => {
      const c = item.calcData || {};
      const amount = (c.pax||0)*(c.price||0);
      total += amount;
      return `<tr>
        <td><span class="badge badge-purple">${inv.noInvoice}</span></td>
        <td>${inv.agenCustomer || '-'}</td>
        <td>${formatTanggal(item.tanggalKeberangkatan)}</td>
        <td>${formatTanggal(item.tanggalSelesai)}</td>
        <td>${item.jenisLayanan || '-'}</td>
        <td>${c.groupName || '-'}</td>
        <td>${c.pax||'-'}</td>
        <td>${c.price ? c.price.toLocaleString('id-ID') : '-'}</td>
        <td class="amount-cell currency-idr">${amount.toLocaleString('id-ID')}</td>
      </tr>`;
    }).join('');
    return `
      <div class="rekap-table-wrap">
        <table class="rekap-table">
          <thead><tr>
            <th>No Invoice</th><th>Agen</th><th>Startdate</th><th>Enddate</th>
            <th>Jenis</th><th>Group</th><th>Pax</th>
            <th>Price/Pax (IDR)</th><th>Amount (IDR)</th>
          </tr></thead>
          <tbody>${bodyRows}</tbody>
          <tfoot><tr>
            <td colspan="8" style="text-align:right;font-weight:700;color:var(--text-muted)">TOTAL</td>
            <td class="amount-cell currency-idr" style="font-weight:700">${total.toLocaleString('id-ID')}</td>
          </tr></tfoot>
        </table>
      </div>`;
  }
  return '';
}
