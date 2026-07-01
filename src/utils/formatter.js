/**
 * Utility functions for formatting and calculations
 */

/**
 * Format number to Indonesian Rupiah currency
 * @param {number} amount
 * @returns {string} Formatted currency string
 */
export function formatIDR(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format number to Saudi Riyal currency
 * @param {number} amount
 * @returns {string} Formatted currency string
 */
export function formatSAR(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return 'SAR 0';
  return `SAR ${new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}

/**
 * Format date to Indonesian locale
 * @param {string|Date} dateStr
 * @returns {string} Formatted date string
 */
export function formatTanggal(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Format date to input field format (yyyy-mm-dd)
 * @param {string|Date} dateStr
 * @returns {string}
 */
export function formatDateInput(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
}

/**
 * Calculate remaining balance
 * @param {number} totalIDR
 * @param {number} totalTerbayar
 * @returns {number}
 */
export function hitungSisa(totalIDR, totalTerbayar) {
  return (totalIDR || 0) - (totalTerbayar || 0);
}

/**
 * Auto-determine payment status
 * @param {number} totalIDR
 * @param {number} nominalDP
 * @param {number} totalTerbayar
 * @param {string} batasWaktuPelunasan
 * @returns {string}
 */
export function hitungStatusBayar(totalIDR, nominalDP, totalTerbayar, batasWaktuPelunasan) {
  const sisa = hitungSisa(totalIDR, totalTerbayar);

  if (sisa <= 0 && totalIDR > 0) return 'Lunas';

  if (batasWaktuPelunasan) {
    const deadline = new Date(batasWaktuPelunasan);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (deadline < today && sisa > 0) return 'Jatuh Tempo';
  }

  if (totalTerbayar > 0 || nominalDP > 0) return 'DP';

  return 'Menunggu Pembayaran';
}

/**
 * Get CSS class for payment status badge
 * @param {string} status
 * @returns {string}
 */
export function getStatusBayarClass(status) {
  const map = {
    'Lunas': 'badge-success',
    'DP': 'badge-warning',
    'Menunggu Pembayaran': 'badge-danger',
    'Jatuh Tempo': 'badge-critical',
    'Refund Diproses': 'badge-info',
    'Refund Selesai': 'badge-default',
    'Dibatalkan': 'badge-danger',
  };
  return map[status] || 'badge-default';
}

/**
 * Get CSS class for order status badge
 * @param {string} status
 * @returns {string}
 */
export function getStatusPesananClass(status) {
  const map = {
    'Baru': 'badge-info',
    'Proses': 'badge-warning',
    'Selesai': 'badge-success',
    'Batal': 'badge-danger',
  };
  return map[status] || 'badge-default';
}

/**
 * Get CSS class for service status badge
 * @param {string} status
 * @returns {string}
 */
export function getStatusLayananClass(status) {
  const map = {
    'Menunggu Konfirmasi': 'badge-info',
    'Dikonfirmasi': 'badge-info',
    'Terjadwal': 'badge-warning',
    'Sedang Berlangsung': 'badge-warning',
    'Selesai': 'badge-success',
    'Dibatalkan': 'badge-danger',
    'Kedaluwarsa': 'badge-default',
  };
  return map[status] || 'badge-default';
}

/**
 * Parse currency string to number
 * @param {string} str
 * @returns {number}
 */
export function parseCurrency(str) {
  if (typeof str === 'number') return str;
  if (!str) return 0;
  return Number(String(str).replace(/[^0-9.-]/g, '')) || 0;
}

/**
 * Generate a unique invoice number
 * @returns {string}
 */
export function generateInvoiceNo() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = String(Math.floor(Math.random() * 9000) + 1000);
  return `INV-${y}${m}${d}-${rand}`;
}

/**
 * Check if a deadline is approaching (within 3 days)
 * @param {string} dateStr
 * @returns {boolean}
 */
export function isDeadlineApproaching(dateStr) {
  if (!dateStr) return false;
  const deadline = new Date(dateStr);
  const today = new Date();
  const diffDays = (deadline - today) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 3;
}

/**
 * Check if a deadline has passed
 * @param {string} dateStr
 * @returns {boolean}
 */
export function isOverdue(dateStr) {
  if (!dateStr) return false;
  const deadline = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return deadline < today;
}
