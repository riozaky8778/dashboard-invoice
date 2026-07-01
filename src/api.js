/**
 * API layer for communicating with Google Apps Script backend
 * Includes demo mode with mock data for testing without backend
 */

// ============================================================
// KONFIGURASI: Ganti URL ini dengan URL Web App Apps Script Anda
// ============================================================
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxUj8INUNezK8v_7b7dZlv982pzN7jlS2WhloDrZF030JPo_e0hzLrttgxmZubaQVH4yw/exec';

// Demo mode: true = pakai data dummy, false = koneksi ke Apps Script
const DEMO_MODE = false;

// Cache State
let invoicesCache = null;
let lastFetchTime = 0;
const CACHE_TTL = 30000; // Cache 30 detik untuk transisi halaman cepat

// ============================================================
// Demo Data (kosong - koneksi ke Apps Script aktif)
// ============================================================
let demoData = [];

let nextId = 1;

// ============================================================
// API Functions
// ============================================================

/**
 * Fetch all invoices
 * @returns {Promise<Array>}
 */
export async function fetchInvoices(forceRefresh = false) {
  if (DEMO_MODE) {
    await delay(300);
    return [...demoData];
  }

  const now = Date.now();
  if (invoicesCache && (now - lastFetchTime < CACHE_TTL) && !forceRefresh) {
    return [...invoicesCache];
  }

  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?action=getAll`);
    const result = await response.json();
    if (result.status === 'success') {
      invoicesCache = result.data;
      lastFetchTime = now;
      return [...invoicesCache];
    }
    throw new Error(result.message || 'Gagal mengambil data');
  } catch (error) {
    console.error('fetchInvoices error:', error);
    throw error;
  }
}

/**
 * Create a new invoice
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function createInvoice(data) {
  if (DEMO_MODE) {
    await delay(300);
    const newInvoice = { ...data, no: nextId++ };
    demoData.push(newInvoice);
    return newInvoice;
  }

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'create', data }),
    });
    const result = await response.json();
    if (result.status === 'success') {
      invoicesCache = null; // Reset cache agar ambil data terbaru
      return result.data;
    }
    throw new Error(result.message || 'Gagal membuat invoice');
  } catch (error) {
    console.error('createInvoice error:', error);
    throw error;
  }
}

/**
 * Update an existing invoice
 * @param {number} no - Invoice number (row identifier)
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function updateInvoice(no, data) {
  if (DEMO_MODE) {
    await delay(300);
    const index = demoData.findIndex(inv => inv.no === no);
    if (index === -1) throw new Error('Invoice tidak ditemukan');
    demoData[index] = { ...demoData[index], ...data, no };
    return demoData[index];
  }

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'update', no, data }),
    });
    const result = await response.json();
    if (result.status === 'success') {
      invoicesCache = null; // Reset cache
      return result.data;
    }
    throw new Error(result.message || 'Gagal update invoice');
  } catch (error) {
    console.error('updateInvoice error:', error);
    throw error;
  }
}

/**
 * Delete an invoice
 * @param {number} no
 * @returns {Promise<boolean>}
 */
export async function deleteInvoice(no) {
  if (DEMO_MODE) {
    await delay(200);
    demoData = demoData.filter(inv => inv.no !== no);
    return true;
  }

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'delete', no }),
    });
    const result = await response.json();
    if (result.status === 'success') {
      invoicesCache = null; // Reset cache
      return true;
    }
    throw new Error(result.message || 'Gagal hapus invoice');
  } catch (error) {
    console.error('deleteInvoice error:', error);
    throw error;
  }
}

/**
 * Helper: simulate network delay for demo mode
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
