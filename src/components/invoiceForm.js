/**
 * Invoice Form Modal Component
 * Handles create and edit operations with dynamic multi-item calculators
 */

import { formatDateInput, hitungSisa, hitungStatusBayar, generateInvoiceNo, formatIDR, formatSAR, formatTanggal } from '../utils/formatter.js';

/**
 * Render the invoice form modal
 * @param {Object|null} invoice - existing invoice data for edit, null for create
 * @returns {string} HTML string
 */
export function renderInvoiceFormModal(invoice = null) {
  const isEdit = !!invoice;
  const title = isEdit ? 'Edit Invoice' : 'Tambah Invoice Baru';
  const submitLabel = isEdit ? 'Simpan Perubahan' : 'Tambah Invoice';

  // Read primary fields
  const f = invoice || {
    tanggalInvoice: new Date().toISOString().split('T')[0],
    noInvoice: generateInvoiceNo(),
    noReceipt: '',
    agenCustomer: '',
    pic: '',
    cabang: '',
    totalIDR: '',
    totalSAR: '',
    kurs: '4290',
    nominalDP: '',
    totalTerbayar: '',
    sisaTagihan: 0,
    batasWaktuDP: '',
    batasWaktuPelunasan: '',
    statusBayar: 'Menunggu Pembayaran',
    metodePembayaran: '',
    statusLayanan: 'Terjadwal',
    catatan: '',
  };

  // Filter out the JSON payload from Notes
  let notesValue = f.catatan || '';
  if (notesValue.includes('__DATA_PESANAN__')) {
    notesValue = notesValue.split('__DATA_PESANAN__')[0].trim();
  }

  return `
    <div class="modal-overlay" id="invoiceModal">
      <div class="modal" style="max-width: 900px; width: 95%;">
        <div class="modal-header">
          <h3>${title}</h3>
          <button class="modal-close" id="modalClose" aria-label="Close">✕</button>
        </div>
        <div class="modal-body">
          <form id="invoiceForm" autocomplete="off">
            ${isEdit ? `<input type="hidden" name="no" value="${invoice.no}" />` : ''}
            
            <div class="form-grid">
              <!-- SECTION 1: Informasi Dasar -->
              <div class="form-section-title">Informasi Dasar</div>

              <div class="form-group">
                <label>Tanggal Invoice <span class="required">*</span></label>
                <input type="date" class="form-input" name="tanggalInvoice"
                       value="${formatDateInput(f.tanggalInvoice)}" required />
              </div>

              <div class="form-group">
                <label>No Invoice <span class="required">*</span></label>
                <input type="text" class="form-input" name="noInvoice"
                       value="${f.noInvoice}" placeholder="INV-XXXXXXXX-XXXX" required />
              </div>

              <div class="form-group">
                <label>No Receipt</label>
                <input type="text" class="form-input" name="noReceipt"
                       value="${f.noReceipt}" placeholder="REC-XXXXXXXX" />
              </div>

              <div class="form-group">
                <label>Agen / Customer <span class="required">*</span></label>
                <input type="text" class="form-input" name="agenCustomer"
                       value="${f.agenCustomer}" placeholder="Nama Agen / Customer" required />
              </div>

              <div class="form-group">
                <label>PIC</label>
                <input type="text" class="form-input" name="pic"
                       value="${f.pic}" placeholder="Person in Charge" />
              </div>

              <div class="form-group">
                <label>Cabang</label>
                <input type="text" class="form-input" name="cabang"
                       value="${f.cabang}" placeholder="Kantor Cabang" />
              </div>

              <!-- SECTION 2: Rincian Item Pesanan -->
              <div class="form-section-title" style="grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                <span>Rincian Item Pesanan</span>
                <button type="button" class="btn btn-secondary" id="btnAddItem" style="padding: 5px 12px; font-size: 0.8rem;">＋ Tambah Item</button>
              </div>
              
              <div id="itemsContainer" style="grid-column: 1 / -1;">
                <!-- Dynamic order items go here -->
              </div>

              <!-- SECTION 3: Batas Waktu -->
              <div class="form-section-title">Batas Waktu Pembayaran</div>

              <div class="form-group">
                <label>Batas Waktu DP</label>
                <input type="date" class="form-input" name="batasWaktuDP"
                       value="${formatDateInput(f.batasWaktuDP)}" />
              </div>

              <div class="form-group">
                <label>Batas Waktu Pelunasan</label>
                <input type="date" class="form-input" name="batasWaktuPelunasan"
                       value="${formatDateInput(f.batasWaktuPelunasan)}" />
              </div>

              <!-- SECTION 4: Keuangan -->
              <div class="form-section-title">Informasi Keuangan</div>

              <div class="form-group">
                <label>Kurs (SAR → IDR)</label>
                <input type="number" class="form-input" name="kurs"
                       value="${f.kurs || '4290'}" placeholder="4290" min="0" id="inputKurs" />
              </div>

              <div class="form-group">
                <label>Total (SAR)</label>
                <input type="number" class="form-input" name="totalSAR"
                       value="${f.totalSAR || ''}" placeholder="0" min="0" step="0.01" id="inputTotalSAR" />
              </div>

              <div class="form-group">
                <label>Total (IDR) <span class="required">*</span></label>
                <input type="number" class="form-input" name="totalIDR"
                       value="${f.totalIDR || ''}" placeholder="0" min="0" required
                       id="inputTotalIDR" />
              </div>

              <div class="form-group">
                <label>Nominal DP</label>
                <input type="number" class="form-input" name="nominalDP"
                       value="${f.nominalDP || ''}" placeholder="0" min="0"
                       id="inputNominalDP" />
              </div>

              <div class="form-group">
                <label>Total Terbayar (Akumulasi)</label>
                <input type="number" class="form-input auto-calculated" name="totalTerbayar"
                       value="${f.totalTerbayar || 0}" readonly
                       id="inputTotalTerbayar" style="background: rgba(124, 58, 237, 0.05);" />
              </div>

              <div class="form-group">
                <label>Tambah Pembayaran Baru (IDR)</label>
                <input type="number" class="form-input" id="inputTambahPembayaran" placeholder="Nominal yang baru dibayar" min="0" />
              </div>

              <div class="form-group">
                <label>Sisa Tagihan (auto)</label>
                <input type="text" class="form-input auto-calculated" name="sisaTagihan"
                       value="${f.sisaTagihan || 0}" readonly
                       id="inputSisaTagihan" />
              </div>

              <div class="form-group">
                <label>Metode Pembayaran</label>
                <input type="text" class="form-input" name="metodePembayaran"
                       value="${f.metodePembayaran}" placeholder="Contoh: Transfer BCA, Cash, dll" />
              </div>

              <!-- SECTION 5: Status -->
              <div class="form-section-title">Status & Catatan</div>

              <div class="form-group">
                <label>Status Bayar</label>
                <select class="form-input" name="statusBayar" id="inputStatusBayar">
                  <option value="Menunggu Pembayaran" ${f.statusBayar === 'Menunggu Pembayaran' ? 'selected' : ''}>Menunggu Pembayaran</option>
                  <option value="DP" ${f.statusBayar === 'DP' ? 'selected' : ''}>DP</option>
                  <option value="Lunas" ${f.statusBayar === 'Lunas' ? 'selected' : ''}>Lunas</option>
                  <option value="Jatuh Tempo" ${f.statusBayar === 'Jatuh Tempo' ? 'selected' : ''}>Jatuh Tempo</option>
                  <option value="Refund Diproses" ${f.statusBayar === 'Refund Diproses' ? 'selected' : ''}>Refund Diproses</option>
                  <option value="Refund Selesai" ${f.statusBayar === 'Refund Selesai' ? 'selected' : ''}>Refund Selesai</option>
                  <option value="Dibatalkan" ${f.statusBayar === 'Dibatalkan' ? 'selected' : ''}>Dibatalkan</option>
                </select>
              </div>

              <div class="form-group">
                <label>Status Layanan</label>
                <select class="form-input" name="statusLayanan">
                  <option value="Menunggu Konfirmasi" ${f.statusLayanan === 'Menunggu Konfirmasi' ? 'selected' : ''}>Menunggu Konfirmasi</option>
                  <option value="Dikonfirmasi" ${f.statusLayanan === 'Dikonfirmasi' ? 'selected' : ''}>Dikonfirmasi</option>
                  <option value="Terjadwal" ${f.statusLayanan === 'Terjadwal' ? 'selected' : ''}>Terjadwal</option>
                  <option value="Sedang Berlangsung" ${f.statusLayanan === 'Sedang Berlangsung' ? 'selected' : ''}>Sedang Berlangsung</option>
                  <option value="Selesai" ${f.statusLayanan === 'Selesai' ? 'selected' : ''}>Selesai</option>
                  <option value="Dibatalkan" ${f.statusLayanan === 'Dibatalkan' ? 'selected' : ''}>Dibatalkan</option>
                  <option value="Kedaluwarsa" ${f.statusLayanan === 'Kedaluwarsa' ? 'selected' : ''}>Kedaluwarsa</option>
                </select>
              </div>

              <div class="form-group" style="grid-column: 1 / -1;">
                <label>Catatan</label>
                <textarea class="form-input" id="inputCatatan" name="catatan" rows="3" placeholder="Catatan tambahan...">${notesValue}</textarea>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="modalCancel">Batal</button>
          <button class="btn btn-primary" id="modalSubmit">${submitLabel}</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * HTML Templates for Dynamic Item Cards and Calculators
 */
function generateItemCardHTML(itemId, itemData = {}) {
  const jenis = itemData.jenisLayanan || '';
  
  return `
    <div class="item-card" data-id="${itemId}">
      <div class="item-card-header">
        <span class="item-card-title">Item Pesanan</span>
        <div style="display: flex; align-items: center; gap: 10px;">
          <span class="item-total-badge" id="itemTotalBadge-${itemId}">Total: -</span>
          <button type="button" class="btn-remove-item" data-id="${itemId}">✕</button>
        </div>
      </div>
      
      <div class="form-grid" style="padding: 0; gap: 12px 16px;">
        <div class="form-group">
          <label>Jenis Layanan</label>
          <select class="form-input item-jenis" data-id="${itemId}">
            <option value="">-- Pilih Layanan --</option>
            <option value="Hotel (HT)" ${jenis === 'Hotel (HT)' ? 'selected' : ''}>Hotel (HT)</option>
            <option value="Restaurant (RT)" ${jenis === 'Restaurant (RT)' ? 'selected' : ''}>Restaurant (RT)</option>
            <option value="Flight (FL)" ${jenis === 'Flight (FL)' ? 'selected' : ''}>Flight (FL)</option>
            <option value="Visa (VIS)" ${jenis === 'Visa (VIS)' ? 'selected' : ''}>Visa (VIS)</option>
            <option value="Full Package (FP)" ${jenis === 'Full Package (FP)' ? 'selected' : ''}>Full Package (FP)</option>
            <option value="Land Arrangement (LA)" ${jenis === 'Land Arrangement (LA)' ? 'selected' : ''}>Land Arrangement (LA)</option>
            <option value="Kereta Cepat (KP)" ${jenis === 'Kereta Cepat (KP)' ? 'selected' : ''}>Kereta Cepat (KP)</option>
          </select>
        </div>
        
        <div class="form-group">
          <label id="lblStart-${itemId}">Tgl Mulai / Check-in</label>
          <input type="date" class="form-input item-start" data-id="${itemId}" value="${formatDateInput(itemData.tanggalKeberangkatan)}" />
        </div>
        
        <div class="form-group" id="groupEnd-${itemId}">
          <label id="lblEnd-${itemId}">Tgl Selesai / Check-out</label>
          <input type="date" class="form-input item-end" data-id="${itemId}" value="${formatDateInput(itemData.tanggalSelesai)}" />
        </div>
        
        <div class="form-group">
          <label>Supplier / Vendor</label>
          <input type="text" class="form-input item-vendor" data-id="${itemId}" value="${itemData.supplierVendor || ''}" placeholder="Supplier..." />
        </div>
        
        <div class="form-group">
          <label id="lblBooking-${itemId}">Booking Code / Voucher</label>
          <input type="text" class="form-input item-booking" data-id="${itemId}" value="${itemData.nomorBooking || ''}" placeholder="Booking..." />
        </div>
        
        <div class="form-group" style="grid-column: 1 / -1;" id="calculatorContainer-${itemId}">
          <!-- Dynamic Calculator Fields -->
        </div>
      </div>
    </div>
  `;
}

function generateCalculatorHTML(itemId, jenis, calcData = {}) {
  if (jenis === 'Hotel (HT)') {
    return `
      <div class="calculator-grid">
        <div class="form-group" style="grid-column: 1 / -1; display: flex; gap: 12px; margin-bottom: 8px;">
          <div style="flex: 2;">
            <label>Hotel Makkah/Madinah</label>
            <input type="text" class="form-input calc-hotel-name" data-id="${itemId}" value="${calcData.hotelName || ''}" placeholder="Nama Hotel..." />
          </div>
          <div style="flex: 1;">
            <label>Meals</label>
            <select class="form-input calc-hotel-meals" data-id="${itemId}">
              <option value="FB" ${calcData.meals === 'FB' ? 'selected' : ''}>FB</option>
              <option value="RO" ${calcData.meals === 'RO' ? 'selected' : ''}>RO</option>
              <option value="MIX" ${calcData.meals === 'MIX' ? 'selected' : ''}>MIX</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Pax</label>
          <input type="number" class="form-input calc-pax" data-id="${itemId}" value="${calcData.pax || ''}" placeholder="Pax" />
        </div>
        <div class="form-group">
          <label>Nights</label>
          <input type="number" class="form-input calc-nights" data-id="${itemId}" value="${calcData.nights || ''}" placeholder="Nights" />
        </div>
        
        <!-- Room Qty & Rates -->
        <div class="form-group">
          <label>Qty DB (Double)</label>
          <input type="number" class="form-input calc-qty-db" data-id="${itemId}" value="${calcData.qtyDB || ''}" placeholder="0" />
        </div>
        <div class="form-group">
          <label>Rate DB (SAR)</label>
          <input type="number" class="form-input calc-rate-db" data-id="${itemId}" value="${calcData.rateDB || ''}" placeholder="0" />
        </div>
        
        <div class="form-group">
          <label>Qty TP (Triple)</label>
          <input type="number" class="form-input calc-qty-tp" data-id="${itemId}" value="${calcData.qtyTP || ''}" placeholder="0" />
        </div>
        <div class="form-group">
          <label>Rate TP (SAR)</label>
          <input type="number" class="form-input calc-rate-tp" data-id="${itemId}" value="${calcData.rateTP || ''}" placeholder="0" />
        </div>
        
        <div class="form-group">
          <label>Qty QD (Quad)</label>
          <input type="number" class="form-input calc-qty-qd" data-id="${itemId}" value="${calcData.qtyQD || ''}" placeholder="0" />
        </div>
        <div class="form-group">
          <label>Rate QD (SAR)</label>
          <input type="number" class="form-input calc-rate-qd" data-id="${itemId}" value="${calcData.rateQD || ''}" placeholder="0" />
        </div>
        
        <div class="form-group">
          <label>Qty QN (Quint)</label>
          <input type="number" class="form-input calc-qty-qn" data-id="${itemId}" value="${calcData.qtyQN || ''}" placeholder="0" />
        </div>
        <div class="form-group">
          <label>Rate QN (SAR)</label>
          <input type="number" class="form-input calc-rate-qn" data-id="${itemId}" value="${calcData.rateQN || ''}" placeholder="0" />
        </div>
      </div>
    `;
  } else if (jenis === 'Restaurant (RT)') {
    return `
      <div class="calculator-grid">
        <div class="form-group">
          <label>Type Meals</label>
          <input type="text" class="form-input calc-rest-type" data-id="${itemId}" value="${calcData.mealsType || 'Fullboard'}" placeholder="Type..." />
        </div>
        <div class="form-group">
          <label>Day</label>
          <input type="number" class="form-input calc-rest-day" data-id="${itemId}" value="${calcData.days || '1'}" placeholder="Days" />
        </div>
        <div class="form-group">
          <label>Frekuensi</label>
          <input type="number" class="form-input calc-rest-freq" data-id="${itemId}" value="${calcData.freq || '3'}" placeholder="Freq" />
        </div>
        <div class="form-group">
          <label>Pax</label>
          <input type="number" class="form-input calc-pax" data-id="${itemId}" value="${calcData.pax || ''}" placeholder="Pax" />
        </div>
        <div class="form-group">
          <label>Price/Meal/Pax (SAR)</label>
          <input type="number" class="form-input calc-price" data-id="${itemId}" value="${calcData.price || ''}" placeholder="SAR" />
        </div>
      </div>
    `;
  } else if (jenis === 'Flight (FL)') {
    return `
      <div class="calculator-grid">
        <div class="form-group" style="grid-column: 1 / -2;">
          <label>Segment</label>
          <input type="text" class="form-input calc-flight-segment" data-id="${itemId}" value="${calcData.segment || ''}" placeholder="e.g. SUBJED - JEDSUB" />
        </div>
        <div class="form-group">
          <label>Type</label>
          <select class="form-input calc-flight-type" data-id="${itemId}">
            <option value="Return" ${calcData.flightType === 'Return' ? 'selected' : ''}>Return</option>
            <option value="One Way" ${calcData.flightType === 'One Way' ? 'selected' : ''}>One Way</option>
            <option value="MIX" ${calcData.flightType === 'MIX' ? 'selected' : ''}>MIX</option>
          </select>
        </div>
        <div class="form-group">
          <label>Pax</label>
          <input type="number" class="form-input calc-pax" data-id="${itemId}" value="${calcData.pax || ''}" placeholder="Pax" />
        </div>
        <div class="form-group">
          <label>Price/Pax (IDR)</label>
          <input type="number" class="form-input calc-price" data-id="${itemId}" value="${calcData.price || ''}" placeholder="IDR" />
        </div>
      </div>
    `;
  } else if (jenis === 'Full Package (FP)' || jenis === 'Land Arrangement (LA)') {
    return `
      <div class="calculator-grid">
        <div class="form-group" style="grid-column: 1 / -2;">
          <label>Group</label>
          <input type="text" class="form-input calc-group-name" data-id="${itemId}" value="${calcData.groupName || ''}" placeholder="Group name..." />
        </div>
        <div class="form-group">
          <label>Pax</label>
          <input type="number" class="form-input calc-pax" data-id="${itemId}" value="${calcData.pax || ''}" placeholder="Pax" />
        </div>
        <div class="form-group">
          <label>Price/Pax (IDR)</label>
          <input type="number" class="form-input calc-price" data-id="${itemId}" value="${calcData.price || ''}" placeholder="IDR" />
        </div>
      </div>
    `;
  } else if (jenis === 'Visa (VIS)') {
    return `
      <div class="calculator-grid">
        <div class="form-group" style="grid-column: 1 / -2;">
          <label>Item</label>
          <input type="text" class="form-input calc-visa-item" data-id="${itemId}" value="${calcData.visaItem || 'Visa + Bus'}" placeholder="Item..." />
        </div>
        <div class="form-group">
          <label>Pax</label>
          <input type="number" class="form-input calc-pax" data-id="${itemId}" value="${calcData.pax || ''}" placeholder="Pax" />
        </div>
        <div class="form-group">
          <label>Price/Pax (SAR)</label>
          <input type="number" class="form-input calc-price" data-id="${itemId}" value="${calcData.price || ''}" placeholder="SAR" />
        </div>
      </div>
    `;
  } else {
    // Default / Lainnya
    return `
      <div class="calculator-grid">
        <div class="form-group" style="grid-column: 1 / -2;">
          <label>Deskripsi Layanan</label>
          <input type="text" class="form-input calc-manual-desc" data-id="${itemId}" value="${calcData.manualDesc || ''}" placeholder="Keterangan..." />
        </div>
        <div class="form-group">
          <label>Pax</label>
          <input type="number" class="form-input calc-pax" data-id="${itemId}" value="${calcData.pax || ''}" placeholder="Pax" />
        </div>
        <div class="form-group">
          <label>Harga per Pax (IDR)</label>
          <input type="number" class="form-input calc-manual-idr" data-id="${itemId}" value="${calcData.manualIDR || ''}" placeholder="IDR" />
        </div>
        <div class="form-group">
          <label>Harga per Pax (SAR)</label>
          <input type="number" class="form-input calc-manual-sar" data-id="${itemId}" value="${calcData.manualSAR || ''}" placeholder="SAR" />
        </div>
      </div>
    `;
  }
}

/**
 * Initialize form events (auto-calculation, submit, close)
 * @param {Function} onSubmit - callback with form data
 * @param {Function} onClose - callback to close modal
 */
export function initFormEvents(onSubmit, onClose, invoice = null) {
  const modal = document.getElementById('invoiceModal');
  const form = document.getElementById('invoiceForm');
  if (!modal || !form) return;

  const isEdit = !!invoice;
  const f = invoice || {};

  // Show modal with animation
  requestAnimationFrame(() => modal.classList.add('active'));

  // Global calculations DOM elements (hoisted to prevent TDZ error in recalculateTotals)
  const inputTotalIDR = document.getElementById('inputTotalIDR');
  const inputTotalSAR = document.getElementById('inputTotalSAR');
  const inputKurs = document.getElementById('inputKurs');
  const inputNominalDP = document.getElementById('inputNominalDP');
  const inputTotalTerbayar = document.getElementById('inputTotalTerbayar');
  const inputSisaTagihan = document.getElementById('inputSisaTagihan');
  const inputStatusBayar = document.getElementById('inputStatusBayar');
  const inputBatasWaktuPelunasan = form.querySelector('[name="batasWaktuPelunasan"]');

  // Items container and state
  const itemsContainer = document.getElementById('itemsContainer');
  const btnAddItem = document.getElementById('btnAddItem');
  
  // Extract items list from notes payload
  let orderItems = [];
  if (isEdit && f.catatan && f.catatan.includes('__DATA_PESANAN__')) {
    try {
      const jsonStr = f.catatan.split('__DATA_PESANAN__')[1].trim();
      orderItems = JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse items data:', e);
    }
  }

  // Fallback for old single-service invoices
  if (isEdit && orderItems.length === 0) {
    orderItems = [{
      id: Date.now(),
      jenisLayanan: f.jenisLayanan || '',
      tanggalKeberangkatan: f.tanggalKeberangkatan || '',
      tanggalSelesai: f.tanggalSelesai || '',
      supplierVendor: f.supplierVendor || '',
      nomorBooking: f.nomorBooking || '',
      detailLayanan: f.detailLayanan || '',
      calcData: {} // Empty calculator data
    }];
  }

  // Add first item if new invoice
  if (!isEdit && orderItems.length === 0) {
    addNewItem();
  } else {
    // Render existing items
    orderItems.forEach(item => {
      renderItemCard(item);
    });
  }

  function addNewItem() {
    const newItem = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      jenisLayanan: '',
      tanggalKeberangkatan: '',
      tanggalSelesai: '',
      supplierVendor: '',
      nomorBooking: '',
      detailLayanan: '',
      calcData: {}
    };
    orderItems.push(newItem);
    renderItemCard(newItem);
    recalculateTotals();
  }

  function renderItemCard(item) {
    const cardHTML = generateItemCardHTML(item.id, item);
    itemsContainer.insertAdjacentHTML('beforeend', cardHTML);
    
    const cardEl = itemsContainer.querySelector(`[data-id="${item.id}"]`);
    const jenisSelect = cardEl.querySelector('.item-jenis');
    
    // Initial calculator render
    updateCalculator(item.id, item.jenisLayanan, item.calcData);
    
    // Bind event listeners
    jenisSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      item.jenisLayanan = val;
      item.calcData = {}; // Clear old calculator data
      
      // Update Labels
      updateItemLabels(item.id, val);
      
      // Re-render Calculator
      updateCalculator(item.id, val, item.calcData);
      recalculateTotals();
    });

    // Run labels updates once initially
    updateItemLabels(item.id, item.jenisLayanan);

    // Bind inputs changes inside item card
    cardEl.addEventListener('input', (e) => {
      const target = e.target;
      
      // Update item values
      if (target.classList.contains('item-start')) item.tanggalKeberangkatan = target.value;
      if (target.classList.contains('item-end')) item.tanggalSelesai = target.value;
      if (target.classList.contains('item-vendor')) item.supplierVendor = target.value;
      if (target.classList.contains('item-booking')) item.nomorBooking = target.value;
      
      // Update calculator fields
      if (target.classList.contains('calc-hotel-name')) item.calcData.hotelName = target.value;
      if (target.classList.contains('calc-hotel-meals')) item.calcData.meals = target.value;
      if (target.classList.contains('calc-pax')) item.calcData.pax = parseInt(target.value) || 0;
      if (target.classList.contains('calc-nights')) item.calcData.nights = parseInt(target.value) || 0;
      if (target.classList.contains('calc-qty-db')) item.calcData.qtyDB = parseInt(target.value) || 0;
      if (target.classList.contains('calc-rate-db')) item.calcData.rateDB = parseFloat(target.value) || 0;
      if (target.classList.contains('calc-qty-tp')) item.calcData.qtyTP = parseInt(target.value) || 0;
      if (target.classList.contains('calc-rate-tp')) item.calcData.rateTP = parseFloat(target.value) || 0;
      if (target.classList.contains('calc-qty-qd')) item.calcData.qtyQD = parseInt(target.value) || 0;
      if (target.classList.contains('calc-rate-qd')) item.calcData.rateQD = parseFloat(target.value) || 0;
      if (target.classList.contains('calc-qty-qn')) item.calcData.qtyQN = parseInt(target.value) || 0;
      if (target.classList.contains('calc-rate-qn')) item.calcData.rateQN = parseFloat(target.value) || 0;
      
      if (target.classList.contains('calc-rest-type')) item.calcData.mealsType = target.value;
      if (target.classList.contains('calc-rest-day')) item.calcData.days = parseInt(target.value) || 0;
      if (target.classList.contains('calc-rest-freq')) item.calcData.freq = parseInt(target.value) || 0;
      if (target.classList.contains('calc-price')) item.calcData.price = parseFloat(target.value) || 0;
      
      if (target.classList.contains('calc-flight-segment')) item.calcData.segment = target.value;
      if (target.classList.contains('calc-flight-type')) item.calcData.flightType = target.value;
      
      if (target.classList.contains('calc-group-name')) item.calcData.groupName = target.value;
      if (target.classList.contains('calc-visa-item')) item.calcData.visaItem = target.value;
      
      if (target.classList.contains('calc-manual-desc')) item.calcData.manualDesc = target.value;
      if (target.classList.contains('calc-manual-idr')) item.calcData.manualIDR = parseFloat(target.value) || 0;
      if (target.classList.contains('calc-manual-sar')) item.calcData.manualSAR = parseFloat(target.value) || 0;

      recalculateTotals();
    });

    // Remove item button handler
    cardEl.querySelector('.btn-remove-item').addEventListener('click', () => {
      if (orderItems.length <= 1) {
        alert('Invoice minimal harus memiliki 1 item pesanan.');
        return;
      }
      cardEl.remove();
      orderItems = orderItems.filter(i => i.id !== item.id);
      recalculateTotals();
    });
  }

  function updateItemLabels(itemId, jenis) {
    const groupEnd = document.getElementById(`groupEnd-${itemId}`);
    const lblStart = document.getElementById(`lblStart-${itemId}`);
    const lblEnd = document.getElementById(`lblEnd-${itemId}`);
    const lblBooking = document.getElementById(`lblBooking-${itemId}`);

    if (groupEnd) groupEnd.style.display = 'block';

    if (jenis === 'Hotel (HT)') {
      if (lblStart) lblStart.textContent = 'Tanggal Check-in';
      if (lblEnd) lblEnd.textContent = 'Tanggal Check-out';
      if (lblBooking) lblBooking.textContent = 'Nomor Voucher / Booking';
    } else if (jenis === 'Restaurant (RT)') {
      if (lblStart) lblStart.textContent = 'Tanggal Booking / Penggunaan';
      if (groupEnd) groupEnd.style.display = 'none';
      if (lblBooking) lblBooking.textContent = 'Nomor Reservasi / Voucher';
    } else if (jenis === 'Flight (FL)') {
      if (lblStart) lblStart.textContent = 'Tanggal Keberangkatan';
      if (lblEnd) lblEnd.textContent = 'Tanggal Kepulangan (Selesai)';
      if (lblBooking) lblBooking.textContent = 'Nomor PNR / Booking';
    } else if (jenis === 'Visa (VIS)') {
      if (lblStart) lblStart.textContent = 'Tanggal Rencana Pergi / Pengajuan';
      if (groupEnd) groupEnd.style.display = 'none';
      if (lblBooking) lblBooking.textContent = 'Nomor Paspor / Booking';
    } else {
      if (lblStart) lblStart.textContent = 'Tgl Mulai / Check-in';
      if (lblEnd) lblEnd.textContent = 'Tgl Selesai / Check-out';
      if (lblBooking) lblBooking.textContent = 'Nomor Booking / PNR / Voucher';
    }
  }

  function updateCalculator(itemId, jenis, calcData) {
    const container = document.getElementById(`calculatorContainer-${itemId}`);
    if (!container) return;
    
    container.innerHTML = generateCalculatorHTML(itemId, jenis, calcData);
    
    // Bind meal type select dynamically inside container if needed
    const mealsSelect = container.querySelector('.calc-hotel-meals');
    if (mealsSelect) {
      mealsSelect.addEventListener('change', (e) => {
        const item = orderItems.find(i => i.id === itemId);
        if (item) {
          item.calcData.meals = e.target.value;
          recalculateTotals();
        }
      });
    }

    const flightTypeSelect = container.querySelector('.calc-flight-type');
    if (flightTypeSelect) {
      flightTypeSelect.addEventListener('change', (e) => {
        const item = orderItems.find(i => i.id === itemId);
        if (item) {
          item.calcData.flightType = e.target.value;
          recalculateTotals();
        }
      });
    }
  }

  // Global calculations (elements declared at top of initFormEvents)

  function recalculateTotals() {
    const kurs = parseFloat(inputKurs?.value) || 4290;
    
    let sumTotalIDR = 0;
    let sumTotalSAR = 0;

    orderItems.forEach(item => {
      let itemTotal = 0;
      let currency = 'IDR';
      const c = item.calcData;

      if (item.jenisLayanan === 'Hotel (HT)') {
        const nights = c.nights || 0;
        const totalRoomsRate = 
          ((c.qtyDB || 0) * (c.rateDB || 0)) +
          ((c.qtyTP || 0) * (c.rateTP || 0)) +
          ((c.qtyQD || 0) * (c.rateQD || 0)) +
          ((c.qtyQN || 0) * (c.rateQN || 0));
        itemTotal = totalRoomsRate * nights;
        currency = 'SAR';
        sumTotalSAR += itemTotal;
        
        // Auto-generate human-readable detail
        const hotelName = c.hotelName || '-';
        const meals = c.meals || 'FB';
        const pax = c.pax || 0;
        const roomStrings = [];
        if (c.qtyDB) roomStrings.push(`${c.qtyDB}xDB`);
        if (c.qtyTP) roomStrings.push(`${c.qtyTP}xTP`);
        if (c.qtyQD) roomStrings.push(`${c.qtyQD}xQD`);
        if (c.qtyQN) roomStrings.push(`${c.qtyQN}xQN`);
        item.detailLayanan = `${hotelName} (${meals}) | ${pax} Pax | ${nights}N | Room: ${roomStrings.join(', ')}`;
        
      } else if (item.jenisLayanan === 'Restaurant (RT)') {
        const days = c.days || 1;
        const freq = c.freq || 3;
        const pax = c.pax || 0;
        const price = c.price || 0;
        itemTotal = days * freq * pax * price;
        currency = 'SAR';
        sumTotalSAR += itemTotal;

        const mType = c.mealsType || 'Fullboard';
        item.detailLayanan = `${mType} | ${pax} Pax | ${days} Hari | Freq: ${freq}x`;

      } else if (item.jenisLayanan === 'Flight (FL)') {
        const pax = c.pax || 0;
        const price = c.price || 0;
        itemTotal = pax * price;
        currency = 'IDR';
        sumTotalIDR += itemTotal;

        const segment = c.segment || '-';
        const fType = c.flightType || 'Return';
        item.detailLayanan = `${segment} (${fType}) | ${pax} Pax`;

      } else if (item.jenisLayanan === 'Full Package (FP)' || item.jenisLayanan === 'Land Arrangement (LA)') {
        const pax = c.pax || 0;
        const price = c.price || 0;
        itemTotal = pax * price;
        currency = 'IDR';
        sumTotalIDR += itemTotal;

        const gName = c.groupName || '-';
        item.detailLayanan = `Group: ${gName} | ${pax} Pax`;

      } else if (item.jenisLayanan === 'Visa (VIS)') {
        const pax = c.pax || 0;
        const price = c.price || 0;
        itemTotal = pax * price;
        currency = 'SAR';
        sumTotalSAR += itemTotal;

        const visaItem = c.visaItem || 'Visa';
        item.detailLayanan = `${visaItem} | ${pax} Pax`;

      } else {
        // Default / Manual
        const pax = c.pax || 0;
        const idr = c.manualIDR || 0;
        const sar = c.manualSAR || 0;
        
        if (idr > 0) {
          itemTotal = pax ? pax * idr : idr;
          currency = 'IDR';
          sumTotalIDR += itemTotal;
        } else {
          itemTotal = pax ? pax * sar : sar;
          currency = 'SAR';
          sumTotalSAR += itemTotal;
        }
        item.detailLayanan = `${c.manualDesc || 'Lainnya'} | ${pax} Pax`;
      }

      // Update item total badge
      const badge = document.getElementById(`itemTotalBadge-${item.id}`);
      if (badge) {
        badge.textContent = currency === 'SAR' ? `Total: ${formatSAR(itemTotal)}` : `Total: ${formatIDR(itemTotal)}`;
      }
    });

    // Calculate aggregated Total IDR (SAR total * kurs + IDR total)
    const overallTotalIDR = sumTotalIDR + (sumTotalSAR * kurs);

    // Set values to form inputs
    if (inputTotalSAR) inputTotalSAR.value = sumTotalSAR > 0 ? sumTotalSAR.toFixed(2) : '';
    if (inputTotalIDR) inputTotalIDR.value = overallTotalIDR > 0 ? Math.round(overallTotalIDR) : '';

    // Calculate balance & status
    const nominalDP = parseFloat(inputNominalDP?.value) || 0;
    const baseTotalTerbayar = invoice ? (parseFloat(invoice.totalTerbayar) || 0) : 0;
    const tambahPembayaran = parseFloat(document.getElementById('inputTambahPembayaran')?.value) || 0;
    const totalTerbayar = baseTotalTerbayar + tambahPembayaran;
    
    if (inputTotalTerbayar) inputTotalTerbayar.value = totalTerbayar;
    
    const deadline = inputBatasWaktuPelunasan?.value || '';

    const sisa = hitungSisa(overallTotalIDR, totalTerbayar);
    if (inputSisaTagihan) inputSisaTagihan.value = sisa;

    const currentStatus = inputStatusBayar?.value;
    const isAutoCalculatedStatus = !currentStatus || ['Menunggu Pembayaran', 'DP', 'Lunas', 'Jatuh Tempo'].includes(currentStatus);

    if (isAutoCalculatedStatus) {
      const status = hitungStatusBayar(overallTotalIDR, nominalDP, totalTerbayar, deadline);
      if (inputStatusBayar) inputStatusBayar.value = status;
    }
  }

  // Bind change events to currency input/kurs change
  const inputTambahPembayaran = document.getElementById('inputTambahPembayaran');
  [inputKurs, inputNominalDP, inputTambahPembayaran, inputBatasWaktuPelunasan].forEach(el => {
    if (el) el.addEventListener('input', recalculateTotals);
  });

  // Bind Add Item button
  btnAddItem.addEventListener('click', addNewItem);

  // Close handlers
  const closeModal = () => {
    modal.classList.remove('active');
    setTimeout(() => onClose(), 300);
  };

  document.getElementById('modalClose')?.addEventListener('click', closeModal);
  document.getElementById('modalCancel')?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Submit
  document.getElementById('modalSubmit')?.addEventListener('click', () => {
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
      if (['totalIDR', 'totalSAR', 'kurs', 'nominalDP', 'totalTerbayar', 'no'].includes(key)) {
        data[key] = parseFloat(value) || 0;
      } else {
        data[key] = value;
      }
    });

    // Compile items details into a single human-readable line for Google Sheets 'Detail Layanan'
    const summaryLines = orderItems.map((item, index) => {
      const startStr = item.tanggalKeberangkatan ? formatTanggal(item.tanggalKeberangkatan) : '';
      const endStr = item.tanggalSelesai ? formatTanggal(item.tanggalSelesai) : '';
      const dateRange = startStr ? ` (${startStr}${endStr ? ' - ' + endStr : ''})` : '';
      return `${index + 1}. [${item.jenisLayanan}] ${item.detailLayanan}${dateRange}`;
    });
    data.detailLayanan = summaryLines.join('\n');

    // Aggregate primary fields based on items list
    const validStarts = orderItems.map(i => i.tanggalKeberangkatan).filter(d => d);
    const validEnds = orderItems.map(i => i.tanggalSelesai).filter(d => d);

    data.tanggalKeberangkatan = validStarts.length > 0 ? validStarts.reduce((a, b) => a < b ? a : b) : '';
    data.tanggalSelesai = validEnds.length > 0 ? validEnds.reduce((a, b) => a > b ? a : b) : '';

    // Primary Service values (pick the first item's type/vendor/booking as representational info)
    if (orderItems.length > 0) {
      data.jenisLayanan = orderItems[0].jenisLayanan || '';
      data.supplierVendor = orderItems.map(i => i.supplierVendor).filter(v => v).join(', ') || '';
      data.nomorBooking = orderItems.map(i => i.nomorBooking).filter(b => b).join(', ') || '';
    }

    // Attach raw items payload to Notes for edit reconstruction
    const userNotes = document.getElementById('inputCatatan').value.trim();
    const jsonStr = JSON.stringify(orderItems);
    data.catatan = userNotes ? `${userNotes}\n\n__DATA_PESANAN__\n${jsonStr}` : `__DATA_PESANAN__\n${jsonStr}`;

    data.sisaTagihan = hitungSisa(data.totalIDR, data.totalTerbayar);
    data.statusBayar = hitungStatusBayar(data.totalIDR, data.nominalDP, data.totalTerbayar, data.batasWaktuPelunasan);

    onSubmit(data);
    closeModal();
  });

  // Run initial calculations
  recalculateTotals();
}
