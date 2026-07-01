/**
 * Invoice Form Modal Component
 * Handles create and edit operations
 */

import { formatDateInput, hitungSisa, hitungStatusBayar, generateInvoiceNo } from '../utils/formatter.js';

/**
 * Render the invoice form modal
 * @param {Object|null} invoice - existing invoice data for edit, null for create
 * @returns {string} HTML string
 */
export function renderInvoiceFormModal(invoice = null) {
  const isEdit = !!invoice;
  const title = isEdit ? 'Edit Invoice' : 'Tambah Invoice Baru';
  const submitLabel = isEdit ? 'Simpan Perubahan' : 'Tambah Invoice';

  const f = invoice || {
    tanggalInvoice: new Date().toISOString().split('T')[0],
    noInvoice: generateInvoiceNo(),
    noReceipt: '',
    agenCustomer: '',
    pic: '',
    cabang: '',
    jenisLayanan: '',
    detailLayanan: '',
    tanggalKeberangkatan: '',
    tanggalSelesai: '',
    supplierVendor: '',
    nomorBooking: '',
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

  return `
    <div class="modal-overlay" id="invoiceModal">
      <div class="modal">
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

              <!-- SECTION 2: Detail Layanan -->
              <div class="form-section-title">Detail Layanan</div>

              <div class="form-group">
                <label>Jenis Layanan</label>
                <select class="form-input" name="jenisLayanan" id="inputJenisLayanan">
                  <option value="" ${!f.jenisLayanan ? 'selected' : ''}>-- Pilih Layanan --</option>
                  <option value="Hotel (HT)" ${f.jenisLayanan === 'Hotel (HT)' ? 'selected' : ''}>Hotel (HT)</option>
                  <option value="Restaurant (RT)" ${f.jenisLayanan === 'Restaurant (RT)' ? 'selected' : ''}>Restaurant (RT)</option>
                  <option value="Flight (FL)" ${f.jenisLayanan === 'Flight (FL)' ? 'selected' : ''}>Flight (FL)</option>
                  <option value="Visa (VIS)" ${f.jenisLayanan === 'Visa (VIS)' ? 'selected' : ''}>Visa (VIS)</option>
                  <option value="Full Package (FP)" ${f.jenisLayanan === 'Full Package (FP)' ? 'selected' : ''}>Full Package (FP)</option>
                  <option value="Land Arrangement (LA)" ${f.jenisLayanan === 'Land Arrangement (LA)' ? 'selected' : ''}>Land Arrangement (LA)</option>
                  <option value="Kereta Cepat (KP)" ${f.jenisLayanan === 'Kereta Cepat (KP)' ? 'selected' : ''}>Kereta Cepat (KP)</option>
                </select>
              </div>

              <div class="form-group" id="detailLayananWrapper">
                <label id="labelDetailLayanan">Detail Layanan</label>
                <select class="form-input" id="detailLayananSelect" style="display:none;"></select>
                <input type="text" class="form-input" id="detailLayananInput" name="detailLayanan"
                       value="${f.detailLayanan}" placeholder="Detail..." />
              </div>

              <div class="form-group" id="groupTanggalKeberangkatan">
                <label id="labelTanggalKeberangkatan">Tgl Keberangkatan / Check-in</label>
                <input type="date" class="form-input" name="tanggalKeberangkatan"
                       value="${formatDateInput(f.tanggalKeberangkatan)}" />
              </div>

              <div class="form-group" id="groupTanggalSelesai">
                <label id="labelTanggalSelesai">Tgl Selesai / Check-out</label>
                <input type="date" class="form-input" name="tanggalSelesai"
                       value="${formatDateInput(f.tanggalSelesai)}" />
              </div>

              <div class="form-group">
                <label>Supplier / Vendor</label>
                <input type="text" class="form-input" name="supplierVendor"
                       value="${f.supplierVendor}" placeholder="Nama Supplier / Vendor" />
              </div>

              <div class="form-group">
                <label id="labelNomorBooking">Nomor Booking / PNR / Voucher</label>
                <input type="text" class="form-input" name="nomorBooking"
                       value="${f.nomorBooking}" placeholder="Kode Booking / Voucher" />
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
                <label>Total (IDR) <span class="required">*</span></label>
                <input type="number" class="form-input" name="totalIDR"
                       value="${f.totalIDR || ''}" placeholder="0" min="0" required
                       id="inputTotalIDR" />
              </div>

              <div class="form-group">
                <label>Total (SAR)</label>
                <input type="number" class="form-input" name="totalSAR"
                       value="${f.totalSAR || ''}" placeholder="0" min="0" step="0.01" id="inputTotalSAR" />
              </div>

              <div class="form-group">
                <label>Kurs (SAR → IDR)</label>
                <input type="number" class="form-input" name="kurs"
                       value="${f.kurs || '4290'}" placeholder="4290" min="0" id="inputKurs" />
              </div>

              <div class="form-group">
                <label>Nominal DP</label>
                <input type="number" class="form-input" name="nominalDP"
                       value="${f.nominalDP || ''}" placeholder="0" min="0"
                       id="inputNominalDP" />
              </div>

              <div class="form-group">
                <label>Total Terbayar</label>
                <input type="number" class="form-input" name="totalTerbayar"
                       value="${f.totalTerbayar || ''}" placeholder="0" min="0"
                       id="inputTotalTerbayar" />
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
                <textarea class="form-input" name="catatan" rows="3" placeholder="Catatan tambahan...">${f.catatan || ''}</textarea>
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
 * Initialize form events (auto-calculation, submit, close)
 * @param {Function} onSubmit - callback with form data
 * @param {Function} onClose - callback to close modal
 */
export function initFormEvents(onSubmit, onClose, invoice = null) {
  const modal = document.getElementById('invoiceModal');
  const form = document.getElementById('invoiceForm');
  if (!modal || !form) return;

  const f = invoice || {};

  // Show modal with animation
  requestAnimationFrame(() => modal.classList.add('active'));

  // Elements for dynamic Detail Layanan and labels
  const jenisSelect = document.getElementById('inputJenisLayanan');
  const detailSelect = document.getElementById('detailLayananSelect');
  const detailInput = document.getElementById('detailLayananInput');
  
  const labelTanggalKeberangkatan = document.getElementById('labelTanggalKeberangkatan');
  const labelTanggalSelesai = document.getElementById('labelTanggalSelesai');
  const groupTanggalSelesai = document.getElementById('groupTanggalSelesai');
  const labelNomorBooking = document.getElementById('labelNomorBooking');

  function updateDetailLayanan() {
    const jenis = jenisSelect.value;
    const currentDetailValue = f.detailLayanan || '';

    // Reset default styling
    if (groupTanggalSelesai) groupTanggalSelesai.style.display = 'block';

    if (jenis === 'Hotel (HT)') {
      // 1. Detail Layanan options
      detailSelect.innerHTML = `
        <option value="FullBoard (FB)" ${currentDetailValue === 'FullBoard (FB)' ? 'selected' : ''}>FullBoard (FB)</option>
        <option value="Room Only (RO)" ${currentDetailValue === 'Room Only (RO)' ? 'selected' : ''}>Room Only (RO)</option>
        <option value="MIX" ${currentDetailValue === 'MIX' ? 'selected' : ''}>MIX</option>
      `;
      detailSelect.style.display = 'block';
      detailSelect.name = 'detailLayanan';
      detailInput.style.display = 'none';
      detailInput.name = '';

      // 2. Custom Labels
      if (labelTanggalKeberangkatan) labelTanggalKeberangkatan.textContent = 'Tanggal Check-in';
      if (labelTanggalSelesai) labelTanggalSelesai.textContent = 'Tanggal Check-out';
      if (labelNomorBooking) labelNomorBooking.textContent = 'Nomor Voucher / Booking';

    } else if (jenis === 'Restaurant (RT)') {
      // 1. Detail Layanan options
      detailSelect.innerHTML = `
        <option value="FullBoard (FB)" ${currentDetailValue === 'FullBoard (FB)' ? 'selected' : ''}>FullBoard (FB)</option>
        <option value="Half Board" ${currentDetailValue === 'Half Board' ? 'selected' : ''}>Half Board</option>
        <option value="Meals (1)" ${currentDetailValue === 'Meals (1)' ? 'selected' : ''}>Meals (1)</option>
        <option value="MIX" ${currentDetailValue === 'MIX' ? 'selected' : ''}>MIX</option>
      `;
      detailSelect.style.display = 'block';
      detailSelect.name = 'detailLayanan';
      detailInput.style.display = 'none';
      detailInput.name = '';

      // 2. Custom Labels & Visibilities
      if (labelTanggalKeberangkatan) labelTanggalKeberangkatan.textContent = 'Tanggal Booking / Penggunaan';
      if (groupTanggalSelesai) groupTanggalSelesai.style.display = 'none'; // Sembunyikan tanggal selesai
      if (labelNomorBooking) labelNomorBooking.textContent = 'Nomor Reservasi / Voucher';

    } else if (jenis === 'Flight (FL)') {
      // 1. Detail Layanan options
      detailSelect.innerHTML = `
        <option value="Return" ${currentDetailValue === 'Return' ? 'selected' : ''}>Return</option>
        <option value="One Way" ${currentDetailValue === 'One Way' ? 'selected' : ''}>One Way</option>
        <option value="MIX" ${currentDetailValue === 'MIX' ? 'selected' : ''}>MIX</option>
      `;
      detailSelect.style.display = 'block';
      detailSelect.name = 'detailLayanan';
      detailInput.style.display = 'none';
      detailInput.name = '';

      // 2. Custom Labels
      if (labelTanggalKeberangkatan) labelTanggalKeberangkatan.textContent = 'Tanggal Keberangkatan';
      if (labelTanggalSelesai) labelTanggalSelesai.textContent = 'Tanggal Kepulangan (Selesai)';
      if (labelNomorBooking) labelNomorBooking.textContent = 'Nomor PNR / Booking';

    } else if (jenis === 'Visa (VIS)') {
      // 1. Input Bebas
      detailSelect.style.display = 'none';
      detailSelect.name = '';
      detailInput.style.display = 'block';
      detailInput.name = 'detailLayanan';

      // 2. Custom Labels & Visibilities
      if (labelTanggalKeberangkatan) labelTanggalKeberangkatan.textContent = 'Tanggal Rencana Pergi / Pengajuan';
      if (groupTanggalSelesai) groupTanggalSelesai.style.display = 'none'; // Sembunyikan tanggal selesai
      if (labelNomorBooking) labelNomorBooking.textContent = 'Nomor Paspor / Booking';

    } else {
      // 1. Input Bebas (Default lainnya)
      detailSelect.style.display = 'none';
      detailSelect.name = '';
      detailInput.style.display = 'block';
      detailInput.name = 'detailLayanan';

      // 2. Default Labels
      if (labelTanggalKeberangkatan) labelTanggalKeberangkatan.textContent = 'Tgl Keberangkatan / Check-in';
      if (labelTanggalSelesai) labelTanggalSelesai.textContent = 'Tgl Selesai / Check-out';
      if (labelNomorBooking) labelNomorBooking.textContent = 'Nomor Booking / PNR / Voucher';
    }
  }

  // Bind change event to Jenis Layanan dropdown
  jenisSelect?.addEventListener('change', updateDetailLayanan);
  updateDetailLayanan(); // Run once initially

  // Auto-calculate sisa tagihan & status bayar
  const inputTotalIDR = document.getElementById('inputTotalIDR');
  const inputNominalDP = document.getElementById('inputNominalDP');
  const inputTotalTerbayar = document.getElementById('inputTotalTerbayar');
  const inputSisaTagihan = document.getElementById('inputSisaTagihan');
  const inputStatusBayar = document.getElementById('inputStatusBayar');
  const inputBatasWaktuPelunasan = form.querySelector('[name="batasWaktuPelunasan"]');

  function recalculate() {
    const totalIDR = parseFloat(inputTotalIDR?.value) || 0;
    const nominalDP = parseFloat(inputNominalDP?.value) || 0;
    const totalTerbayar = parseFloat(inputTotalTerbayar?.value) || 0;
    const deadline = inputBatasWaktuPelunasan?.value || '';

    const sisa = hitungSisa(totalIDR, totalTerbayar);
    if (inputSisaTagihan) inputSisaTagihan.value = sisa;

    const currentStatus = inputStatusBayar?.value;
    const isAutoCalculatedStatus = !currentStatus || ['Menunggu Pembayaran', 'DP', 'Lunas', 'Jatuh Tempo'].includes(currentStatus);

    if (isAutoCalculatedStatus) {
      const status = hitungStatusBayar(totalIDR, nominalDP, totalTerbayar, deadline);
      if (inputStatusBayar) inputStatusBayar.value = status;
    }
  }

  [inputTotalIDR, inputNominalDP, inputTotalTerbayar, inputBatasWaktuPelunasan].forEach(el => {
    if (el) el.addEventListener('input', recalculate);
  });

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
      // Convert numeric fields
      if (['totalIDR', 'totalSAR', 'kurs', 'nominalDP', 'totalTerbayar', 'no'].includes(key)) {
        data[key] = parseFloat(value) || 0;
      } else {
        data[key] = value;
      }
    });

    // Set calculated fields
    data.sisaTagihan = hitungSisa(data.totalIDR, data.totalTerbayar);
    data.statusBayar = hitungStatusBayar(data.totalIDR, data.nominalDP, data.totalTerbayar, data.batasWaktuPelunasan);

    onSubmit(data);
    closeModal();
  });

  // Initial calculation
  recalculate();
}
