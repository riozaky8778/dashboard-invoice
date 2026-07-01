/**
 * Dashboard Page Component
 * Displays summary cards, charts, and recent invoices
 */

import { fetchInvoices } from '../api.js';
import {
  formatIDR, formatSAR, formatTanggal,
  getStatusBayarClass, getStatusLayananClass
} from '../utils/formatter.js';

export async function renderDashboard() {
  return `
    <div class="main-content" id="mainContent">
      <div class="page-header animate-in">
        <h2>Dashboard</h2>
        <p>Rekapitulasi tagihan, pembayaran, dan status layanan</p>
      </div>
      <div id="dashboardContent">
        <div class="loading-overlay">
          <div class="spinner"></div>
          <div class="loading-text">Memuat data dashboard...</div>
        </div>
      </div>
    </div>
  `;
}

export async function initDashboard() {
  try {
    const invoices = await fetchInvoices();
    const container = document.getElementById('dashboardContent');
    if (!container) return;

    const stats = calculateStats(invoices);
    container.innerHTML = buildDashboardHTML(stats, invoices);
  } catch (error) {
    const container = document.getElementById('dashboardContent');
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

function calculateStats(invoices) {
  // Exclude cancelled invoices from financial metrics
  const activeInvoices = invoices.filter(inv => inv.statusBayar !== 'Dibatalkan' && inv.statusLayanan !== 'Dibatalkan');

  return {
    totalInvoice: invoices.length,
    totalRevenueRP: activeInvoices.reduce((sum, inv) => sum + (inv.totalIDR || 0), 0),
    totalRevenueSAR: activeInvoices.reduce((sum, inv) => sum + (inv.totalSAR || 0), 0),
    totalTerbayar: activeInvoices.reduce((sum, inv) => sum + (inv.totalTerbayar || 0), 0),
    totalSisa: activeInvoices.reduce((sum, inv) => sum + (inv.sisaTagihan || 0), 0),
    
    // Status Bayar Stats
    countLunas: invoices.filter(inv => inv.statusBayar === 'Lunas').length,
    countDP: invoices.filter(inv => inv.statusBayar === 'DP').length,
    countMenungguPembayaran: invoices.filter(inv => inv.statusBayar === 'Menunggu Pembayaran').length,
    countJatuhTempo: invoices.filter(inv => inv.statusBayar === 'Jatuh Tempo').length,
    countRefundDiproses: invoices.filter(inv => inv.statusBayar === 'Refund Diproses').length,
    countRefundSelesai: invoices.filter(inv => inv.statusBayar === 'Refund Selesai').length,
    countBayarDibatalkan: invoices.filter(inv => inv.statusBayar === 'Dibatalkan').length,

    // Status Layanan Stats
    countLayananMenungguKonfirmasi: invoices.filter(inv => inv.statusLayanan === 'Menunggu Konfirmasi' || inv.statusLayanan === 'Menunggu Konfirmasi (opsional)').length,
    countLayananDikonfirmasi: invoices.filter(inv => inv.statusLayanan === 'Dikonfirmasi' || inv.statusLayanan === 'Dikonfirmasi (opsional)').length,
    countLayananTerjadwal: invoices.filter(inv => inv.statusLayanan === 'Terjadwal').length,
    countLayananSedangBerlangsung: invoices.filter(inv => inv.statusLayanan === 'Sedang Berlangsung').length,
    countLayananSelesai: invoices.filter(inv => inv.statusLayanan === 'Selesai').length,
    countLayananDibatalkan: invoices.filter(inv => inv.statusLayanan === 'Dibatalkan').length,
    countLayananKedaluwarsa: invoices.filter(inv => inv.statusLayanan === 'Kedaluwarsa').length,
  };
}

function buildDashboardHTML(stats, invoices) {
  return `
    <!-- Summary Cards -->
    <div class="summary-grid">
      <div class="card summary-card card-purple animate-in">
        <div class="summary-card-icon">📋</div>
        <div class="summary-card-value">${stats.totalInvoice}</div>
        <div class="summary-card-label">Total Invoice</div>
      </div>
      <div class="card summary-card card-blue animate-in">
        <div class="summary-card-icon">💰</div>
        <div class="summary-card-value">${formatIDR(stats.totalRevenueRP)}</div>
        <div class="summary-card-label">Total Revenue (IDR)</div>
      </div>
      <div class="card summary-card card-cyan animate-in">
        <div class="summary-card-icon">🕌</div>
        <div class="summary-card-value">${formatSAR(stats.totalRevenueSAR)}</div>
        <div class="summary-card-label">Total Revenue (SAR)</div>
      </div>
      <div class="card summary-card card-green animate-in">
        <div class="summary-card-icon">✅</div>
        <div class="summary-card-value">${formatIDR(stats.totalTerbayar)}</div>
        <div class="summary-card-label">Total Terbayar</div>
      </div>
      <div class="card summary-card card-yellow animate-in">
        <div class="summary-card-icon">⏳</div>
        <div class="summary-card-value">${formatIDR(stats.totalSisa)}</div>
        <div class="summary-card-label">Sisa Tagihan</div>
      </div>
      <div class="card summary-card card-red animate-in">
        <div class="summary-card-icon">🚨</div>
        <div class="summary-card-value">${stats.countJatuhTempo}</div>
        <div class="summary-card-label">Jatuh Tempo</div>
      </div>
    </div>

    <!-- Charts -->
    <div class="charts-grid">
      <div class="card chart-card animate-in">
        <div class="chart-card-header">
          <h3>Status Pembayaran</h3>
        </div>
        <div class="chart-container">
          ${buildDonutChart(stats)}
        </div>
      </div>
      <div class="card chart-card animate-in">
        <div class="chart-card-header">
          <h3>Status Layanan</h3>
        </div>
        <div class="chart-container">
          ${buildServiceStatusChart(stats)}
        </div>
      </div>
    </div>

    <!-- Recent Invoices -->
    <div class="card table-card animate-in">
      <div class="table-header">
        <h3>Invoice Terbaru</h3>
      </div>
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>No Invoice</th>
              <th>Tanggal</th>
              <th>Agen / Customer</th>
              <th>Total (IDR)</th>
              <th>Status Bayar</th>
              <th>Status Layanan</th>
            </tr>
          </thead>
          <tbody>
            ${invoices.slice(0, 5).map(inv => `
              <tr>
                <td style="font-weight:600;color:var(--text-accent)">${inv.noInvoice}</td>
                <td class="cell-date">${formatTanggal(inv.tanggalInvoice)}</td>
                <td>${inv.agenCustomer || '-'}</td>
                <td class="cell-currency currency-idr">${formatIDR(inv.totalIDR)}</td>
                <td><span class="badge ${getStatusBayarClass(inv.statusBayar)}">${inv.statusBayar}</span></td>
                <td><span class="badge ${getStatusLayananClass(inv.statusLayanan)}">${inv.statusLayanan || '-'}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function buildDonutChart(stats) {
  const data = [
    { label: 'Lunas', value: stats.countLunas, color: '#10b981' },
    { label: 'DP', value: stats.countDP, color: '#f59e0b' },
    { label: 'Menunggu Pembayaran', value: stats.countMenungguPembayaran, color: '#ef4444' },
    { label: 'Jatuh Tempo', value: stats.countJatuhTempo, color: '#dc2626' },
    { label: 'Refund Diproses', value: stats.countRefundDiproses, color: '#06b6d4' },
    { label: 'Refund Selesai', value: stats.countRefundSelesai, color: '#6060a0' },
    { label: 'Dibatalkan', value: stats.countBayarDibatalkan, color: '#4b5563' },
  ].filter(d => d.value > 0 || ['Lunas', 'DP', 'Menunggu Pembayaran', 'Jatuh Tempo'].includes(d.label));

  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) {
    return '<div class="empty-state"><div class="empty-state-icon">📊</div><div class="empty-state-text">Belum ada data</div></div>';
  }

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let cumulativeOffset = 0;

  const segments = data.map(d => {
    const percentage = d.value / total;
    const dashLength = percentage * circumference;
    const dashOffset = cumulativeOffset;
    cumulativeOffset += dashLength;

    return `<circle class="donut-segment"
              cx="90" cy="90" r="${radius}"
              stroke="${d.color}"
              stroke-dasharray="${dashLength} ${circumference - dashLength}"
              stroke-dashoffset="-${dashOffset}" />`;
  }).join('');

  const legend = data.map(d => `
    <div class="donut-legend-item">
      <span class="donut-legend-dot" style="background:${d.color}"></span>
      <span style="color:var(--text-secondary)">${d.label}</span>
      <span class="donut-legend-value">${d.value}</span>
    </div>
  `).join('');

  return `
    <div class="donut-chart">
      <svg class="donut-svg" viewBox="0 0 180 180">
        ${segments}
        <text class="donut-center-text" x="90" y="85" text-anchor="middle"
              fill="var(--text-primary)" font-size="22" font-weight="800">${total}</text>
        <text class="donut-center-text" x="90" y="105" text-anchor="middle"
              fill="var(--text-muted)" font-size="10" font-weight="500">Total</text>
      </svg>
      <div class="donut-legend">
        ${legend}
      </div>
    </div>
  `;
}

function buildServiceStatusChart(stats) {
  const data = [
    { label: 'Konf', value: stats.countLayananMenungguKonfirmasi, color: '#06b6d4' },
    { label: 'Dikonf', value: stats.countLayananDikonfirmasi, color: '#3b82f6' },
    { label: 'Jadwal', value: stats.countLayananTerjadwal, color: '#f59e0b' },
    { label: 'Jalan', value: stats.countLayananSedangBerlangsung, color: '#a78bfa' },
    { label: 'Selesai', value: stats.countLayananSelesai, color: '#10b981' },
    { label: 'Batal', value: stats.countLayananDibatalkan, color: '#ef4444' },
    { label: 'Expired', value: stats.countLayananKedaluwarsa, color: '#6b7280' },
  ];

  const maxValue = Math.max(...data.map(d => d.value), 1);

  const bars = data.map(d => {
    const heightPercent = (d.value / maxValue) * 100;
    return `
      <div class="bar-group">
        <div class="bar-value">${d.value}</div>
        <div class="bar" style="height:${Math.max(heightPercent, 3)}%;background:${d.color}" title="${d.label}: ${d.value}"></div>
        <div class="bar-label" style="font-size:0.65rem" title="${d.label}">${d.label}</div>
      </div>
    `;
  }).join('');

  return `<div class="bar-chart">${bars}</div>`;
}
