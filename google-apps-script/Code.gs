/**
 * ============================================================
 * Google Apps Script - Backend API untuk InvoiceHub
 * ============================================================
 *
 * CARA SETUP:
 * 1. Buka Google Sheets baru
 * 2. Buat header di baris 1 sesuai KOLOM_HEADER di bawah
 * 3. Buka Extensions > Apps Script
 * 4. Copy-paste seluruh kode ini ke Code.gs
 * 5. Deploy > New deployment > Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Copy URL deployment, paste ke src/api.js (APPS_SCRIPT_URL)
 * 7. Set DEMO_MODE = false di src/api.js
 *
 * KOLOM HEADER (baris 1 di Google Sheet):
 * No | Tanggal Invoice | No Invoice | No LOBC | Jenis Otomatis |
 * Status Pesanan | Agen | PIC | Deadline DP | Deadline Pelunasan |
 * Total RP | Total SAR | Kurs | DP | Terbayar | Sisa Keseluruhan | Status Bayar
 */

// ID Spreadsheet Anda (ambil dari URL Google Sheets)
const SPREADSHEET_ID = 'GANTI_DENGAN_SPREADSHEET_ID_ANDA';
const SHEET_NAME = 'Invoice';

// Kolom header mapping (0-indexed)
const COL = {
  no: 0,
  tanggalInvoice: 1,
  noInvoice: 2,
  noReceipt: 3,
  agenCustomer: 4,
  pic: 5,
  cabang: 6,
  jenisLayanan: 7,
  detailLayanan: 8,
  tanggalKeberangkatan: 9,
  tanggalSelesai: 10,
  supplierVendor: 11,
  nomorBooking: 12,
  totalIDR: 13,
  totalSAR: 14,
  kurs: 15,
  nominalDP: 16,
  totalTerbayar: 17,
  sisaTagihan: 18,
  batasWaktuDP: 19,
  batasWaktuPelunasan: 20,
  statusBayar: 21,
  metodePembayaran: 22,
  statusLayanan: 23,
  catatan: 24,
};

const KOLOM_HEADER = [
  'No', 'Tanggal Invoice', 'No Invoice', 'No Receipt', 'Agen / Customer',
  'PIC', 'Cabang', 'Jenis Layanan', 'Detail Layanan', 'Tanggal Keberangkatan / Check-in',
  'Tanggal Selesai / Check-out', 'Supplier / Vendor', 'Nomor Booking / PNR / Voucher',
  'Total (IDR)', 'Total (SAR)', 'Kurs', 'Nominal DP', 'Total Terbayar',
  'Sisa Tagihan', 'Batas Waktu DP', 'Batas Waktu Pelunasan', 'Status Bayar',
  'Metode Pembayaran', 'Status Layanan', 'Catatan'
];

// ============================================================
// Web App Endpoints
// ============================================================

function doGet(e) {
  const action = e.parameter.action || 'getAll';

  try {
    switch (action) {
      case 'getAll':
        return jsonResponse({ status: 'success', data: getAllInvoices() });
      default:
        return jsonResponse({ status: 'error', message: 'Action tidak dikenal' });
    }
  } catch (error) {
    return jsonResponse({ status: 'error', message: error.message });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;

    switch (action) {
      case 'create':
        return jsonResponse({ status: 'success', data: createInvoice(body.data) });
      case 'update':
        return jsonResponse({ status: 'success', data: updateInvoice(body.no, body.data) });
      case 'delete':
        deleteInvoice(body.no);
        return jsonResponse({ status: 'success', message: 'Invoice berhasil dihapus' });
      default:
        return jsonResponse({ status: 'error', message: 'Action tidak dikenal' });
    }
  } catch (error) {
    return jsonResponse({ status: 'error', message: error.message });
  }
}

// ============================================================
// CRUD Operations
// ============================================================

function getSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  return ss.getSheetByName(SHEET_NAME);
}

function getAllInvoices() {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  const data = sheet.getRange(2, 1, lastRow - 1, KOLOM_HEADER.length).getValues();

  return data.map(row => ({
    no: row[COL.no],
    tanggalInvoice: formatDate(row[COL.tanggalInvoice]),
    noInvoice: row[COL.noInvoice],
    noReceipt: row[COL.noReceipt],
    agenCustomer: row[COL.agenCustomer],
    pic: row[COL.pic],
    cabang: row[COL.cabang],
    jenisLayanan: row[COL.jenisLayanan],
    detailLayanan: row[COL.detailLayanan],
    tanggalKeberangkatan: formatDate(row[COL.tanggalKeberangkatan]),
    tanggalSelesai: formatDate(row[COL.tanggalSelesai]),
    supplierVendor: row[COL.supplierVendor],
    nomorBooking: row[COL.nomorBooking],
    totalIDR: Number(row[COL.totalIDR]) || 0,
    totalSAR: Number(row[COL.totalSAR]) || 0,
    kurs: Number(row[COL.kurs]) || 0,
    nominalDP: Number(row[COL.nominalDP]) || 0,
    totalTerbayar: Number(row[COL.totalTerbayar]) || 0,
    sisaTagihan: Number(row[COL.sisaTagihan]) || 0,
    batasWaktuDP: formatDate(row[COL.batasWaktuDP]),
    batasWaktuPelunasan: formatDate(row[COL.batasWaktuPelunasan]),
    statusBayar: row[COL.statusBayar],
    metodePembayaran: row[COL.metodePembayaran],
    statusLayanan: row[COL.statusLayanan],
    catatan: row[COL.catatan],
  })).filter(inv => inv.no); // Filter empty rows
}

function createInvoice(data) {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();
  const newNo = lastRow < 2 ? 1 : sheet.getRange(lastRow, 1).getValue() + 1;

  // Auto-calculate
  const totalIDR = Number(data.totalIDR) || 0;
  const totalTerbayar = Number(data.totalTerbayar) || 0;
  const nominalDP = Number(data.nominalDP) || 0;
  const sisa = totalIDR - totalTerbayar;
  const statusBayar = data.statusBayar || hitungStatusBayar(totalIDR, nominalDP, totalTerbayar, data.batasWaktuPelunasan);

  const newRow = [
    newNo,
    data.tanggalInvoice || new Date(),
    data.noInvoice || '',
    data.noReceipt || '',
    data.agenCustomer || '',
    data.pic || '',
    data.cabang || '',
    data.jenisLayanan || '',
    data.detailLayanan || '',
    data.tanggalKeberangkatan || '',
    data.tanggalSelesai || '',
    data.supplierVendor || '',
    data.nomorBooking || '',
    totalIDR,
    Number(data.totalSAR) || 0,
    Number(data.kurs) || 0,
    nominalDP,
    totalTerbayar,
    sisa,
    data.batasWaktuDP || '',
    data.batasWaktuPelunasan || '',
    statusBayar,
    data.metodePembayaran || '',
    data.statusLayanan || 'Terjadwal',
    data.catatan || '',
  ];

  sheet.appendRow(newRow);

  return {
    ...data,
    no: newNo,
    sisaTagihan: sisa,
    statusBayar: statusBayar,
  };
}

function updateInvoice(no, data) {
  const sheet = getSheet();
  const rowIndex = findRowByNo(sheet, no);
  if (rowIndex === -1) throw new Error('Invoice tidak ditemukan');

  const totalIDR = Number(data.totalIDR) || 0;
  const totalTerbayar = Number(data.totalTerbayar) || 0;
  const nominalDP = Number(data.nominalDP) || 0;
  const sisa = totalIDR - totalTerbayar;
  const statusBayar = data.statusBayar || hitungStatusBayar(totalIDR, nominalDP, totalTerbayar, data.batasWaktuPelunasan);

  const updatedRow = [
    no,
    data.tanggalInvoice || '',
    data.noInvoice || '',
    data.noReceipt || '',
    data.agenCustomer || '',
    data.pic || '',
    data.cabang || '',
    data.jenisLayanan || '',
    data.detailLayanan || '',
    data.tanggalKeberangkatan || '',
    data.tanggalSelesai || '',
    data.supplierVendor || '',
    data.nomorBooking || '',
    totalIDR,
    Number(data.totalSAR) || 0,
    Number(data.kurs) || 0,
    nominalDP,
    totalTerbayar,
    sisa,
    data.batasWaktuDP || '',
    data.batasWaktuPelunasan || '',
    statusBayar,
    data.metodePembayaran || '',
    data.statusLayanan || '',
    data.catatan || '',
  ];

  sheet.getRange(rowIndex, 1, 1, KOLOM_HEADER.length).setValues([updatedRow]);

  return {
    ...data,
    no: no,
    sisaTagihan: sisa,
    statusBayar: statusBayar,
  };
}

function deleteInvoice(no) {
  const sheet = getSheet();
  const rowIndex = findRowByNo(sheet, no);
  if (rowIndex === -1) throw new Error('Invoice tidak ditemukan');
  sheet.deleteRow(rowIndex);
}

// ============================================================
// Helper Functions
// ============================================================

function findRowByNo(sheet, no) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;

  const nos = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (let i = 0; i < nos.length; i++) {
    if (nos[i][0] == no) return i + 2; // +2 because 1-indexed + header
  }
  return -1;
}

function formatDate(value) {
  if (!value) return '';
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return String(value);
}

function hitungStatusBayar(totalRP, dp, terbayar, deadlinePelunasan) {
  const sisa = totalRP - terbayar;

  if (sisa <= 0 && totalRP > 0) return 'Lunas';

  if (deadlinePelunasan) {
    const deadline = new Date(deadlinePelunasan);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (deadline < today && sisa > 0) return 'Jatuh Tempo';
  }

  if (terbayar > 0 || dp > 0) return 'DP';

  return 'Menunggu Pembayaran';
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// Setup Helper - Jalankan sekali untuk membuat header
// ============================================================
function setupSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  // Set header
  sheet.getRange(1, 1, 1, KOLOM_HEADER.length).setValues([KOLOM_HEADER]);

  // Format header
  const headerRange = sheet.getRange(1, 1, 1, KOLOM_HEADER.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#4a148c');
  headerRange.setFontColor('#ffffff');

  // Auto-resize columns
  for (let i = 1; i <= KOLOM_HEADER.length; i++) {
    sheet.autoResizeColumn(i);
  }

  Logger.log('Sheet setup selesai!');
}
