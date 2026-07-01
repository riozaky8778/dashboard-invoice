(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();function e(e=`dashboard`){return`
    <button class="sidebar-toggle" id="sidebarToggle" aria-label="Toggle menu">☰</button>
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-brand">
        <div class="sidebar-brand-icon">📄</div>
        <div class="sidebar-brand-text">
          <h1>InvoiceHub</h1>
          <p>Sistem Rekap Invoice</p>
        </div>
      </div>
      <nav class="sidebar-nav">
        ${[{id:`dashboard`,icon:`📊`,label:`Dashboard`},{id:`invoices`,icon:`📋`,label:`Data Invoice`}].map(t=>`
          <div class="sidebar-nav-item ${e===t.id?`active`:``}"
               data-page="${t.id}" id="nav-${t.id}">
            <span class="sidebar-nav-icon">${t.icon}</span>
            <span>${t.label}</span>
          </div>
        `).join(``)}
      </nav>
      <div class="sidebar-footer">
        <div>© 2026 InvoiceHub</div>
      </div>
    </aside>
  `}function t(e){document.querySelectorAll(`.sidebar-nav-item`).forEach(t=>{t.addEventListener(`click`,()=>{let n=t.dataset.page;e(n)})});let t=document.getElementById(`sidebarToggle`),n=document.getElementById(`sidebar`);t&&n&&(t.addEventListener(`click`,()=>{n.classList.toggle(`open`)}),document.addEventListener(`click`,e=>{window.innerWidth<=768&&n.classList.contains(`open`)&&!n.contains(e.target)&&e.target!==t&&n.classList.remove(`open`)}))}var n=`https://script.google.com/macros/s/AKfycbxUj8INUNezK8v_7b7dZlv982pzN7jlS2WhloDrZF030JPo_e0hzLrttgxmZubaQVH4yw/exec`,r=null,i=0,a=3e4;async function o(e=!1){let t=Date.now();if(r&&t-i<a&&!e)return[...r];try{let e=await(await fetch(`${n}?action=getAll`)).json();if(e.status===`success`)return r=e.data,i=t,[...r];throw Error(e.message||`Gagal mengambil data`)}catch(e){throw console.error(`fetchInvoices error:`,e),e}}async function s(e){try{let t=await(await fetch(n,{method:`POST`,headers:{"Content-Type":`text/plain`},body:JSON.stringify({action:`create`,data:e})})).json();if(t.status===`success`)return r=null,t.data;throw Error(t.message||`Gagal membuat invoice`)}catch(e){throw console.error(`createInvoice error:`,e),e}}async function c(e,t){try{let i=await(await fetch(n,{method:`POST`,headers:{"Content-Type":`text/plain`},body:JSON.stringify({action:`update`,no:e,data:t})})).json();if(i.status===`success`)return r=null,i.data;throw Error(i.message||`Gagal update invoice`)}catch(e){throw console.error(`updateInvoice error:`,e),e}}async function l(e){try{let t=await(await fetch(n,{method:`POST`,headers:{"Content-Type":`text/plain`},body:JSON.stringify({action:`delete`,no:e})})).json();if(t.status===`success`)return r=null,!0;throw Error(t.message||`Gagal hapus invoice`)}catch(e){throw console.error(`deleteInvoice error:`,e),e}}function u(e){return e==null||isNaN(e)?`Rp 0`:new Intl.NumberFormat(`id-ID`,{style:`currency`,currency:`IDR`,minimumFractionDigits:0,maximumFractionDigits:0}).format(e)}function d(e){return e==null||isNaN(e)?`SAR 0`:`SAR ${new Intl.NumberFormat(`id-ID`,{minimumFractionDigits:0,maximumFractionDigits:2}).format(e)}`}function f(e){if(!e)return`-`;let t=new Date(e);return isNaN(t.getTime())?`-`:new Intl.DateTimeFormat(`id-ID`,{day:`2-digit`,month:`short`,year:`numeric`}).format(t)}function p(e){if(!e)return``;let t=new Date(e);return isNaN(t.getTime())?``:t.toISOString().split(`T`)[0]}function m(e,t){return(e||0)-(t||0)}function h(e,t,n,r){let i=m(e,n);if(i<=0&&e>0)return`Lunas`;if(r){let e=new Date(r),t=new Date;if(t.setHours(0,0,0,0),e<t&&i>0)return`Jatuh Tempo`}return n>0||t>0?`DP`:`Menunggu Pembayaran`}function g(e){return{Lunas:`badge-success`,DP:`badge-warning`,"Menunggu Pembayaran":`badge-danger`,"Jatuh Tempo":`badge-critical`,"Refund Diproses":`badge-info`,"Refund Selesai":`badge-default`,Dibatalkan:`badge-danger`}[e]||`badge-default`}function _(e){return{"Menunggu Konfirmasi":`badge-info`,Dikonfirmasi:`badge-info`,Terjadwal:`badge-warning`,"Sedang Berlangsung":`badge-warning`,Selesai:`badge-success`,Dibatalkan:`badge-danger`,Kedaluwarsa:`badge-default`}[e]||`badge-default`}function v(){let e=new Date;return`INV-${e.getFullYear()}${String(e.getMonth()+1).padStart(2,`0`)}${String(e.getDate()).padStart(2,`0`)}-${String(Math.floor(Math.random()*9e3)+1e3)}`}function y(e){if(!e)return!1;let t=(new Date(e)-new Date)/(1e3*60*60*24);return t>=0&&t<=3}function b(e){if(!e)return!1;let t=new Date(e),n=new Date;return n.setHours(0,0,0,0),t<n}async function x(){return`
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
  `}async function S(){try{let e=await o(),t=document.getElementById(`dashboardContent`);if(!t)return;t.innerHTML=w(C(e),e)}catch(e){let t=document.getElementById(`dashboardContent`);t&&(t.innerHTML=`
        <div class="empty-state">
          <div class="empty-state-icon">❌</div>
          <div class="empty-state-text">Gagal memuat data: ${e.message}</div>
        </div>
      `)}}function C(e){let t=e.filter(e=>e.statusBayar!==`Dibatalkan`&&e.statusLayanan!==`Dibatalkan`);return{totalInvoice:e.length,totalRevenueRP:t.reduce((e,t)=>e+(t.totalIDR||0),0),totalRevenueSAR:t.reduce((e,t)=>e+(t.totalSAR||0),0),totalTerbayar:t.reduce((e,t)=>e+(t.totalTerbayar||0),0),totalSisa:t.reduce((e,t)=>e+(t.sisaTagihan||0),0),countLunas:e.filter(e=>e.statusBayar===`Lunas`).length,countDP:e.filter(e=>e.statusBayar===`DP`).length,countMenungguPembayaran:e.filter(e=>e.statusBayar===`Menunggu Pembayaran`).length,countJatuhTempo:e.filter(e=>e.statusBayar===`Jatuh Tempo`).length,countRefundDiproses:e.filter(e=>e.statusBayar===`Refund Diproses`).length,countRefundSelesai:e.filter(e=>e.statusBayar===`Refund Selesai`).length,countBayarDibatalkan:e.filter(e=>e.statusBayar===`Dibatalkan`).length,countLayananMenungguKonfirmasi:e.filter(e=>e.statusLayanan===`Menunggu Konfirmasi`||e.statusLayanan===`Menunggu Konfirmasi (opsional)`).length,countLayananDikonfirmasi:e.filter(e=>e.statusLayanan===`Dikonfirmasi`||e.statusLayanan===`Dikonfirmasi (opsional)`).length,countLayananTerjadwal:e.filter(e=>e.statusLayanan===`Terjadwal`).length,countLayananSedangBerlangsung:e.filter(e=>e.statusLayanan===`Sedang Berlangsung`).length,countLayananSelesai:e.filter(e=>e.statusLayanan===`Selesai`).length,countLayananDibatalkan:e.filter(e=>e.statusLayanan===`Dibatalkan`).length,countLayananKedaluwarsa:e.filter(e=>e.statusLayanan===`Kedaluwarsa`).length}}function w(e,t){return`
    <!-- Summary Cards -->
    <div class="summary-grid">
      <div class="card summary-card card-purple animate-in">
        <div class="summary-card-icon">📋</div>
        <div class="summary-card-value">${e.totalInvoice}</div>
        <div class="summary-card-label">Total Invoice</div>
      </div>
      <div class="card summary-card card-blue animate-in">
        <div class="summary-card-icon">💰</div>
        <div class="summary-card-value">${u(e.totalRevenueRP)}</div>
        <div class="summary-card-label">Total Revenue (IDR)</div>
      </div>
      <div class="card summary-card card-cyan animate-in">
        <div class="summary-card-icon">🕌</div>
        <div class="summary-card-value">${d(e.totalRevenueSAR)}</div>
        <div class="summary-card-label">Total Revenue (SAR)</div>
      </div>
      <div class="card summary-card card-green animate-in">
        <div class="summary-card-icon">✅</div>
        <div class="summary-card-value">${u(e.totalTerbayar)}</div>
        <div class="summary-card-label">Total Terbayar</div>
      </div>
      <div class="card summary-card card-yellow animate-in">
        <div class="summary-card-icon">⏳</div>
        <div class="summary-card-value">${u(e.totalSisa)}</div>
        <div class="summary-card-label">Sisa Tagihan</div>
      </div>
      <div class="card summary-card card-red animate-in">
        <div class="summary-card-icon">🚨</div>
        <div class="summary-card-value">${e.countJatuhTempo}</div>
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
          ${T(e)}
        </div>
      </div>
      <div class="card chart-card animate-in">
        <div class="chart-card-header">
          <h3>Status Layanan</h3>
        </div>
        <div class="chart-container">
          ${E(e)}
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
            ${t.slice(0,5).map(e=>`
              <tr>
                <td style="font-weight:600;color:var(--text-accent)">${e.noInvoice}</td>
                <td class="cell-date">${f(e.tanggalInvoice)}</td>
                <td>${e.agenCustomer||`-`}</td>
                <td class="cell-currency currency-idr">${u(e.totalIDR)}</td>
                <td><span class="badge ${g(e.statusBayar)}">${e.statusBayar}</span></td>
                <td><span class="badge ${_(e.statusLayanan)}">${e.statusLayanan||`-`}</span></td>
              </tr>
            `).join(``)}
          </tbody>
        </table>
      </div>
    </div>
  `}function T(e){let t=[{label:`Lunas`,value:e.countLunas,color:`#10b981`},{label:`DP`,value:e.countDP,color:`#f59e0b`},{label:`Menunggu Pembayaran`,value:e.countMenungguPembayaran,color:`#ef4444`},{label:`Jatuh Tempo`,value:e.countJatuhTempo,color:`#dc2626`},{label:`Refund Diproses`,value:e.countRefundDiproses,color:`#06b6d4`},{label:`Refund Selesai`,value:e.countRefundSelesai,color:`#6060a0`},{label:`Dibatalkan`,value:e.countBayarDibatalkan,color:`#4b5563`}].filter(e=>e.value>0||[`Lunas`,`DP`,`Menunggu Pembayaran`,`Jatuh Tempo`].includes(e.label)),n=t.reduce((e,t)=>e+t.value,0);if(n===0)return`<div class="empty-state"><div class="empty-state-icon">📊</div><div class="empty-state-text">Belum ada data</div></div>`;let r=2*Math.PI*60,i=0;return`
    <div class="donut-chart">
      <svg class="donut-svg" viewBox="0 0 180 180">
        ${t.map(e=>{let t=e.value/n*r,a=i;return i+=t,`<circle class="donut-segment"
              cx="90" cy="90" r="60"
              stroke="${e.color}"
              stroke-dasharray="${t} ${r-t}"
              stroke-dashoffset="-${a}" />`}).join(``)}
        <text class="donut-center-text" x="90" y="85" text-anchor="middle"
              fill="var(--text-primary)" font-size="22" font-weight="800">${n}</text>
        <text class="donut-center-text" x="90" y="105" text-anchor="middle"
              fill="var(--text-muted)" font-size="10" font-weight="500">Total</text>
      </svg>
      <div class="donut-legend">
        ${t.map(e=>`
    <div class="donut-legend-item">
      <span class="donut-legend-dot" style="background:${e.color}"></span>
      <span style="color:var(--text-secondary)">${e.label}</span>
      <span class="donut-legend-value">${e.value}</span>
    </div>
  `).join(``)}
      </div>
    </div>
  `}function E(e){let t=[{label:`Konf`,value:e.countLayananMenungguKonfirmasi,color:`#06b6d4`},{label:`Dikonf`,value:e.countLayananDikonfirmasi,color:`#3b82f6`},{label:`Jadwal`,value:e.countLayananTerjadwal,color:`#f59e0b`},{label:`Jalan`,value:e.countLayananSedangBerlangsung,color:`#a78bfa`},{label:`Selesai`,value:e.countLayananSelesai,color:`#10b981`},{label:`Batal`,value:e.countLayananDibatalkan,color:`#ef4444`},{label:`Expired`,value:e.countLayananKedaluwarsa,color:`#6b7280`}],n=Math.max(...t.map(e=>e.value),1);return`<div class="bar-chart">${t.map(e=>{let t=e.value/n*100;return`
      <div class="bar-group">
        <div class="bar-value">${e.value}</div>
        <div class="bar" style="height:${Math.max(t,3)}%;background:${e.color}" title="${e.label}: ${e.value}"></div>
        <div class="bar-label" style="font-size:0.65rem" title="${e.label}">${e.label}</div>
      </div>
    `}).join(``)}</div>`}function D(e=null){let t=!!e,n=t?`Edit Invoice`:`Tambah Invoice Baru`,r=t?`Simpan Perubahan`:`Tambah Invoice`,i=e||{tanggalInvoice:new Date().toISOString().split(`T`)[0],noInvoice:v(),noReceipt:``,agenCustomer:``,pic:``,cabang:``,jenisLayanan:``,detailLayanan:``,tanggalKeberangkatan:``,tanggalSelesai:``,supplierVendor:``,nomorBooking:``,totalIDR:``,totalSAR:``,kurs:`4290`,nominalDP:``,totalTerbayar:``,sisaTagihan:0,batasWaktuDP:``,batasWaktuPelunasan:``,statusBayar:`Menunggu Pembayaran`,metodePembayaran:``,statusLayanan:`Terjadwal`,catatan:``};return`
    <div class="modal-overlay" id="invoiceModal">
      <div class="modal">
        <div class="modal-header">
          <h3>${n}</h3>
          <button class="modal-close" id="modalClose" aria-label="Close">✕</button>
        </div>
        <div class="modal-body">
          <form id="invoiceForm" autocomplete="off">
            ${t?`<input type="hidden" name="no" value="${e.no}" />`:``}
            
            <div class="form-grid">
              <!-- SECTION 1: Informasi Dasar -->
              <div class="form-section-title">Informasi Dasar</div>

              <div class="form-group">
                <label>Tanggal Invoice <span class="required">*</span></label>
                <input type="date" class="form-input" name="tanggalInvoice"
                       value="${p(i.tanggalInvoice)}" required />
              </div>

              <div class="form-group">
                <label>No Invoice <span class="required">*</span></label>
                <input type="text" class="form-input" name="noInvoice"
                       value="${i.noInvoice}" placeholder="INV-XXXXXXXX-XXXX" required />
              </div>

              <div class="form-group">
                <label>No Receipt</label>
                <input type="text" class="form-input" name="noReceipt"
                       value="${i.noReceipt}" placeholder="REC-XXXXXXXX" />
              </div>

              <div class="form-group">
                <label>Agen / Customer <span class="required">*</span></label>
                <input type="text" class="form-input" name="agenCustomer"
                       value="${i.agenCustomer}" placeholder="Nama Agen / Customer" required />
              </div>

              <div class="form-group">
                <label>PIC</label>
                <input type="text" class="form-input" name="pic"
                       value="${i.pic}" placeholder="Person in Charge" />
              </div>

              <div class="form-group">
                <label>Cabang</label>
                <input type="text" class="form-input" name="cabang"
                       value="${i.cabang}" placeholder="Kantor Cabang" />
              </div>

              <!-- SECTION 2: Detail Layanan -->
              <div class="form-section-title">Detail Layanan</div>

              <div class="form-group">
                <label>Jenis Layanan</label>
                <select class="form-input" name="jenisLayanan" id="inputJenisLayanan">
                  <option value="" ${i.jenisLayanan?``:`selected`}>-- Pilih Layanan --</option>
                  <option value="Hotel (HT)" ${i.jenisLayanan===`Hotel (HT)`?`selected`:``}>Hotel (HT)</option>
                  <option value="Restaurant (RT)" ${i.jenisLayanan===`Restaurant (RT)`?`selected`:``}>Restaurant (RT)</option>
                  <option value="Flight (FL)" ${i.jenisLayanan===`Flight (FL)`?`selected`:``}>Flight (FL)</option>
                  <option value="Visa (VIS)" ${i.jenisLayanan===`Visa (VIS)`?`selected`:``}>Visa (VIS)</option>
                  <option value="Full Package (FP)" ${i.jenisLayanan===`Full Package (FP)`?`selected`:``}>Full Package (FP)</option>
                  <option value="Land Arrangement (LA)" ${i.jenisLayanan===`Land Arrangement (LA)`?`selected`:``}>Land Arrangement (LA)</option>
                  <option value="Kereta Cepat (KP)" ${i.jenisLayanan===`Kereta Cepat (KP)`?`selected`:``}>Kereta Cepat (KP)</option>
                </select>
              </div>

              <div class="form-group" id="detailLayananWrapper">
                <label>Detail Layanan</label>
                <select class="form-input" id="detailLayananSelect" style="display:none;"></select>
                <input type="text" class="form-input" id="detailLayananInput" name="detailLayanan"
                       value="${i.detailLayanan}" placeholder="Detail..." />
              </div>

              <div class="form-group">
                <label>Tgl Keberangkatan / Check-in</label>
                <input type="date" class="form-input" name="tanggalKeberangkatan"
                       value="${p(i.tanggalKeberangkatan)}" />
              </div>

              <div class="form-group">
                <label>Tgl Selesai / Check-out</label>
                <input type="date" class="form-input" name="tanggalSelesai"
                       value="${p(i.tanggalSelesai)}" />
              </div>

              <div class="form-group">
                <label>Supplier / Vendor</label>
                <input type="text" class="form-input" name="supplierVendor"
                       value="${i.supplierVendor}" placeholder="Nama Supplier / Vendor" />
              </div>

              <div class="form-group">
                <label>Nomor Booking / PNR / Voucher</label>
                <input type="text" class="form-input" name="nomorBooking"
                       value="${i.nomorBooking}" placeholder="Kode Booking / Voucher" />
              </div>

              <!-- SECTION 3: Batas Waktu -->
              <div class="form-section-title">Batas Waktu Pembayaran</div>

              <div class="form-group">
                <label>Batas Waktu DP</label>
                <input type="date" class="form-input" name="batasWaktuDP"
                       value="${p(i.batasWaktuDP)}" />
              </div>

              <div class="form-group">
                <label>Batas Waktu Pelunasan</label>
                <input type="date" class="form-input" name="batasWaktuPelunasan"
                       value="${p(i.batasWaktuPelunasan)}" />
              </div>

              <!-- SECTION 4: Keuangan -->
              <div class="form-section-title">Informasi Keuangan</div>

              <div class="form-group">
                <label>Total (IDR) <span class="required">*</span></label>
                <input type="number" class="form-input" name="totalIDR"
                       value="${i.totalIDR||``}" placeholder="0" min="0" required
                       id="inputTotalIDR" />
              </div>

              <div class="form-group">
                <label>Total (SAR)</label>
                <input type="number" class="form-input" name="totalSAR"
                       value="${i.totalSAR||``}" placeholder="0" min="0" step="0.01" id="inputTotalSAR" />
              </div>

              <div class="form-group">
                <label>Kurs (SAR → IDR)</label>
                <input type="number" class="form-input" name="kurs"
                       value="${i.kurs||`4290`}" placeholder="4290" min="0" id="inputKurs" />
              </div>

              <div class="form-group">
                <label>Nominal DP</label>
                <input type="number" class="form-input" name="nominalDP"
                       value="${i.nominalDP||``}" placeholder="0" min="0"
                       id="inputNominalDP" />
              </div>

              <div class="form-group">
                <label>Total Terbayar</label>
                <input type="number" class="form-input" name="totalTerbayar"
                       value="${i.totalTerbayar||``}" placeholder="0" min="0"
                       id="inputTotalTerbayar" />
              </div>

              <div class="form-group">
                <label>Sisa Tagihan (auto)</label>
                <input type="text" class="form-input auto-calculated" name="sisaTagihan"
                       value="${i.sisaTagihan||0}" readonly
                       id="inputSisaTagihan" />
              </div>

              <div class="form-group">
                <label>Metode Pembayaran</label>
                <input type="text" class="form-input" name="metodePembayaran"
                       value="${i.metodePembayaran}" placeholder="Contoh: Transfer BCA, Cash, dll" />
              </div>

              <!-- SECTION 5: Status -->
              <div class="form-section-title">Status & Catatan</div>

              <div class="form-group">
                <label>Status Bayar</label>
                <select class="form-input" name="statusBayar" id="inputStatusBayar">
                  <option value="Menunggu Pembayaran" ${i.statusBayar===`Menunggu Pembayaran`?`selected`:``}>Menunggu Pembayaran</option>
                  <option value="DP" ${i.statusBayar===`DP`?`selected`:``}>DP</option>
                  <option value="Lunas" ${i.statusBayar===`Lunas`?`selected`:``}>Lunas</option>
                  <option value="Jatuh Tempo" ${i.statusBayar===`Jatuh Tempo`?`selected`:``}>Jatuh Tempo</option>
                  <option value="Refund Diproses" ${i.statusBayar===`Refund Diproses`?`selected`:``}>Refund Diproses</option>
                  <option value="Refund Selesai" ${i.statusBayar===`Refund Selesai`?`selected`:``}>Refund Selesai</option>
                  <option value="Dibatalkan" ${i.statusBayar===`Dibatalkan`?`selected`:``}>Dibatalkan</option>
                </select>
              </div>

              <div class="form-group">
                <label>Status Layanan</label>
                <select class="form-input" name="statusLayanan">
                  <option value="Menunggu Konfirmasi" ${i.statusLayanan===`Menunggu Konfirmasi`?`selected`:``}>Menunggu Konfirmasi</option>
                  <option value="Dikonfirmasi" ${i.statusLayanan===`Dikonfirmasi`?`selected`:``}>Dikonfirmasi</option>
                  <option value="Terjadwal" ${i.statusLayanan===`Terjadwal`?`selected`:``}>Terjadwal</option>
                  <option value="Sedang Berlangsung" ${i.statusLayanan===`Sedang Berlangsung`?`selected`:``}>Sedang Berlangsung</option>
                  <option value="Selesai" ${i.statusLayanan===`Selesai`?`selected`:``}>Selesai</option>
                  <option value="Dibatalkan" ${i.statusLayanan===`Dibatalkan`?`selected`:``}>Dibatalkan</option>
                  <option value="Kedaluwarsa" ${i.statusLayanan===`Kedaluwarsa`?`selected`:``}>Kedaluwarsa</option>
                </select>
              </div>

              <div class="form-group" style="grid-column: 1 / -1;">
                <label>Catatan</label>
                <textarea class="form-input" name="catatan" rows="3" placeholder="Catatan tambahan...">${i.catatan||``}</textarea>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="modalCancel">Batal</button>
          <button class="btn btn-primary" id="modalSubmit">${r}</button>
        </div>
      </div>
    </div>
  `}function O(e,t,n=null){let r=document.getElementById(`invoiceModal`),i=document.getElementById(`invoiceForm`);if(!r||!i)return;let a=n||{};requestAnimationFrame(()=>r.classList.add(`active`));let o=document.getElementById(`inputJenisLayanan`),s=document.getElementById(`detailLayananSelect`),c=document.getElementById(`detailLayananInput`);function l(){let e=o.value,t=a.detailLayanan||``;e===`Hotel (HT)`?(s.innerHTML=`
        <option value="FullBoard (FB)" ${t===`FullBoard (FB)`?`selected`:``}>FullBoard (FB)</option>
        <option value="Room Only (RO)" ${t===`Room Only (RO)`?`selected`:``}>Room Only (RO)</option>
        <option value="MIX" ${t===`MIX`?`selected`:``}>MIX</option>
      `,s.style.display=`block`,s.name=`detailLayanan`,c.style.display=`none`,c.name=``):e===`Restaurant (RT)`?(s.innerHTML=`
        <option value="FullBoard (FB)" ${t===`FullBoard (FB)`?`selected`:``}>FullBoard (FB)</option>
        <option value="Half Board" ${t===`Half Board`?`selected`:``}>Half Board</option>
        <option value="Meals (1)" ${t===`Meals (1)`?`selected`:``}>Meals (1)</option>
        <option value="MIX" ${t===`MIX`?`selected`:``}>MIX</option>
      `,s.style.display=`block`,s.name=`detailLayanan`,c.style.display=`none`,c.name=``):e===`Flight (FL)`?(s.innerHTML=`
        <option value="Return" ${t===`Return`?`selected`:``}>Return</option>
        <option value="One Way" ${t===`One Way`?`selected`:``}>One Way</option>
        <option value="MIX" ${t===`MIX`?`selected`:``}>MIX</option>
      `,s.style.display=`block`,s.name=`detailLayanan`,c.style.display=`none`,c.name=``):(s.style.display=`none`,s.name=``,c.style.display=`block`,c.name=`detailLayanan`)}o?.addEventListener(`change`,l),l();let u=document.getElementById(`inputTotalIDR`),d=document.getElementById(`inputNominalDP`),f=document.getElementById(`inputTotalTerbayar`),p=document.getElementById(`inputSisaTagihan`),g=document.getElementById(`inputStatusBayar`),_=i.querySelector(`[name="batasWaktuPelunasan"]`);function v(){let e=parseFloat(u?.value)||0,t=parseFloat(d?.value)||0,n=parseFloat(f?.value)||0,r=_?.value||``,i=m(e,n);p&&(p.value=i);let a=g?.value;if(!a||[`Menunggu Pembayaran`,`DP`,`Lunas`,`Jatuh Tempo`].includes(a)){let i=h(e,t,n,r);g&&(g.value=i)}}[u,d,f,_].forEach(e=>{e&&e.addEventListener(`input`,v)});let y=()=>{r.classList.remove(`active`),setTimeout(()=>t(),300)};document.getElementById(`modalClose`)?.addEventListener(`click`,y),document.getElementById(`modalCancel`)?.addEventListener(`click`,y),r.addEventListener(`click`,e=>{e.target===r&&y()}),document.getElementById(`modalSubmit`)?.addEventListener(`click`,()=>{if(!i.checkValidity()){i.reportValidity();return}let t=new FormData(i),n={};t.forEach((e,t)=>{[`totalIDR`,`totalSAR`,`kurs`,`nominalDP`,`totalTerbayar`,`no`].includes(t)?n[t]=parseFloat(e)||0:n[t]=e}),n.sisaTagihan=m(n.totalIDR,n.totalTerbayar),n.statusBayar=h(n.totalIDR,n.nominalDP,n.totalTerbayar,n.batasWaktuPelunasan),e(n),y()}),v()}var k=null;function A(){return k||(k=document.createElement(`div`),k.className=`toast-container`,k.id=`toastContainer`,document.body.appendChild(k)),k}function j(e,t=`info`,n=3e3){let r=A(),i={success:`✅`,error:`❌`,info:`ℹ️`},a=document.createElement(`div`);a.className=`toast toast-${t}`,a.innerHTML=`
    <span class="toast-icon">${i[t]}</span>
    <span class="toast-message">${e}</span>
  `,r.appendChild(a),setTimeout(()=>{a.classList.add(`toast-exit`),setTimeout(()=>a.remove(),300)},n)}function M(e,t){return new Promise(n=>{let r=document.createElement(`div`);r.className=`confirm-overlay`,r.innerHTML=`
      <div class="confirm-dialog">
        <div class="confirm-icon">⚠️</div>
        <div class="confirm-title">${e}</div>
        <div class="confirm-message">${t}</div>
        <div class="confirm-actions">
          <button class="btn btn-secondary" id="confirmCancel">Batal</button>
          <button class="btn btn-danger" id="confirmOk">Hapus</button>
        </div>
      </div>
    `,document.body.appendChild(r),requestAnimationFrame(()=>r.classList.add(`active`));let i=e=>{r.classList.remove(`active`),setTimeout(()=>r.remove(),300),n(e)};r.querySelector(`#confirmCancel`).addEventListener(`click`,()=>i(!1)),r.querySelector(`#confirmOk`).addEventListener(`click`,()=>i(!0)),r.addEventListener(`click`,e=>{e.target===r&&i(!1)})})}var N=[],P=[],F=1,I=10,L=`no`,R=`desc`,z=``,B=``,V=``,H=``;async function U(){return`
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
  `}async function W(){try{N=await o(),G(),K()}catch(e){let t=document.getElementById(`invoiceTableContent`);t&&(t.innerHTML=`
        <div class="empty-state">
          <div class="empty-state-icon">❌</div>
          <div class="empty-state-text">Gagal memuat data: ${e.message}</div>
        </div>
      `)}}function G(){P=N.filter(e=>{if(z){let t=z.toLowerCase();if(![e.noInvoice,e.noReceipt,e.agenCustomer,e.pic,e.cabang,e.jenisLayanan,e.detailLayanan,e.supplierVendor,e.nomorBooking,e.statusBayar,e.statusLayanan,e.metodePembayaran,e.catatan].map(e=>(e||``).toLowerCase()).some(e=>e.includes(t)))return!1}return!(B&&e.statusBayar!==B||V&&e.statusLayanan!==V||H&&e.jenisLayanan!==H)}),P.sort((e,t)=>{let n=e[L],r=t[L];return typeof n==`string`&&(n=n.toLowerCase()),typeof r==`string`&&(r=r.toLowerCase()),n<r?R===`asc`?-1:1:n>r?R===`asc`?1:-1:0});let e=Math.ceil(P.length/I);F>e&&(F=1)}function K(){let e=document.getElementById(`invoiceTableContent`);if(!e)return;let t=Math.max(1,Math.ceil(P.length/I)),n=(F-1)*I,r=P.slice(n,n+I);e.innerHTML=`
    <div class="card table-card animate-in">
      <div class="table-header">
        <h3>Semua Invoice (${P.length})</h3>
        <div class="table-actions">
          <div class="search-input-wrapper">
            <span class="search-icon">🔍</span>
            <input type="text" class="search-input" id="searchInput"
                   placeholder="Cari invoice..." value="${z}" />
          </div>
          
          <select class="filter-select" id="filterStatusBayar">
            <option value="">Semua Status Bayar</option>
            <option value="Menunggu Pembayaran" ${B===`Menunggu Pembayaran`?`selected`:``}>Menunggu Pembayaran</option>
            <option value="DP" ${B===`DP`?`selected`:``}>DP</option>
            <option value="Lunas" ${B===`Lunas`?`selected`:``}>Lunas</option>
            <option value="Jatuh Tempo" ${B===`Jatuh Tempo`?`selected`:``}>Jatuh Tempo</option>
            <option value="Refund Diproses" ${B===`Refund Diproses`?`selected`:``}>Refund Diproses</option>
            <option value="Refund Selesai" ${B===`Refund Selesai`?`selected`:``}>Refund Selesai</option>
            <option value="Dibatalkan" ${B===`Dibatalkan`?`selected`:``}>Dibatalkan</option>
          </select>

          <select class="filter-select" id="filterStatusLayanan">
            <option value="">Semua Status Layanan</option>
            <option value="Menunggu Konfirmasi" ${V===`Menunggu Konfirmasi`?`selected`:``}>Menunggu Konfirmasi</option>
            <option value="Dikonfirmasi" ${V===`Dikonfirmasi`?`selected`:``}>Dikonfirmasi</option>
            <option value="Terjadwal" ${V===`Terjadwal`?`selected`:``}>Terjadwal</option>
            <option value="Sedang Berlangsung" ${V===`Sedang Berlangsung`?`selected`:``}>Sedang Berlangsung</option>
            <option value="Selesai" ${V===`Selesai`?`selected`:``}>Selesai</option>
            <option value="Dibatalkan" ${V===`Dibatalkan`?`selected`:``}>Dibatalkan</option>
            <option value="Kedaluwarsa" ${V===`Kedaluwarsa`?`selected`:``}>Kedaluwarsa</option>
          </select>

          <select class="filter-select" id="filterJenisLayanan">
            <option value="">Semua Layanan</option>
            <option value="Hotel (HT)" ${H===`Hotel (HT)`?`selected`:``}>Hotel (HT)</option>
            <option value="Restaurant (RT)" ${H===`Restaurant (RT)`?`selected`:``}>Restaurant (RT)</option>
            <option value="Flight (FL)" ${H===`Flight (FL)`?`selected`:``}>Flight (FL)</option>
            <option value="Visa (VIS)" ${H===`Visa (VIS)`?`selected`:``}>Visa (VIS)</option>
            <option value="Full Package (FP)" ${H===`Full Package (FP)`?`selected`:``}>Full Package (FP)</option>
            <option value="Land Arrangement (LA)" ${H===`Land Arrangement (LA)`?`selected`:``}>Land Arrangement (LA)</option>
            <option value="Kereta Cepat (KP)" ${H===`Kereta Cepat (KP)`?`selected`:``}>Kereta Cepat (KP)</option>
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
              ${q(`no`,`No`)}
              ${q(`tanggalInvoice`,`Tgl Invoice`)}
              ${q(`noInvoice`,`No Invoice`)}
              ${q(`noReceipt`,`No Receipt`)}
              ${q(`agenCustomer`,`Agen / Customer`)}
              ${q(`pic`,`PIC`)}
              ${q(`cabang`,`Cabang`)}
              ${q(`jenisLayanan`,`Jenis Layanan`)}
              ${q(`detailLayanan`,`Detail Layanan`)}
              ${q(`tanggalKeberangkatan`,`Tgl Keberangkatan`)}
              ${q(`tanggalSelesai`,`Tgl Selesai`)}
              ${q(`supplierVendor`,`Supplier / Vendor`)}
              ${q(`nomorBooking`,`PNR / Booking`)}
              ${q(`totalIDR`,`Total (IDR)`)}
              ${q(`totalSAR`,`Total (SAR)`)}
              ${q(`kurs`,`Kurs`)}
              ${q(`nominalDP`,`Nominal DP`)}
              ${q(`totalTerbayar`,`Terbayar`)}
              ${q(`sisaTagihan`,`Sisa Tagihan`)}
              ${q(`batasWaktuDP`,`Batas DP`)}
              ${q(`batasWaktuPelunasan`,`Batas Pelunasan`)}
              ${q(`statusBayar`,`Status Bayar`)}
              ${q(`metodePembayaran`,`Metode Bayar`)}
              ${q(`statusLayanan`,`Status Layanan`)}
              ${q(`catatan`,`Catatan`)}
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${r.length===0?`
              <tr><td colspan="26">
                <div class="empty-state">
                  <div class="empty-state-icon">📭</div>
                  <div class="empty-state-text">Tidak ada invoice ditemukan</div>
                </div>
              </td></tr>
            `:r.map(e=>J(e)).join(``)}
          </tbody>
        </table>
      </div>
      ${P.length>I?`
        <div class="table-footer">
          <div class="table-info">
            Menampilkan ${n+1}-${Math.min(n+I,P.length)}
            dari ${P.length} invoice
          </div>
          <div class="pagination">
            <button class="pagination-btn" data-page="prev" ${F<=1?`disabled`:``}>‹</button>
            ${Y(t)}
            <button class="pagination-btn" data-page="next" ${F>=t?`disabled`:``}>›</button>
          </div>
        </div>
      `:``}
    </div>
  `,X()}function q(e,t){let n=L===e;return`<th class="${n?`sort-active`:``}" data-sort="${e}">
    ${t} <span class="sort-icon">${n?R===`asc`?`↑`:`↓`:`↕`}</span>
  </th>`}function J(e){let t=e.statusBayar===`Jatuh Tempo`?`row-overdue`:``,n=b(e.batasWaktuPelunasan)?`date-overdue`:y(e.batasWaktuPelunasan)?`date-approaching`:``,r=e.sisaTagihan<=0?`sisa-zero`:``;return`
    <tr class="${t}" data-no="${e.no}">
      <td style="font-weight:600;color:var(--text-muted)">${e.no}</td>
      <td class="cell-date">${f(e.tanggalInvoice)}</td>
      <td style="font-weight:600;color:var(--text-accent)">${e.noInvoice}</td>
      <td>${e.noReceipt||`-`}</td>
      <td>${e.agenCustomer||`-`}</td>
      <td>${e.pic||`-`}</td>
      <td>${e.cabang||`-`}</td>
      <td>${e.jenisLayanan||`-`}</td>
      <td>${e.detailLayanan||`-`}</td>
      <td class="cell-date">${f(e.tanggalKeberangkatan)}</td>
      <td class="cell-date">${f(e.tanggalSelesai)}</td>
      <td>${e.supplierVendor||`-`}</td>
      <td><code style="color:var(--text-primary);background:rgba(255,255,255,0.04);padding:2px 6px;border-radius:4px">${e.nomorBooking||`-`}</code></td>
      <td class="cell-currency currency-idr">${u(e.totalIDR)}</td>
      <td class="cell-currency currency-sar">${d(e.totalSAR)}</td>
      <td style="color:var(--text-muted);font-variant-numeric:tabular-nums">${e.kurs||`-`}</td>
      <td class="cell-currency currency-idr">${u(e.nominalDP)}</td>
      <td class="cell-currency currency-idr">${u(e.totalTerbayar)}</td>
      <td class="cell-currency currency-sisa ${r}">${u(e.sisaTagihan)}</td>
      <td class="cell-date">${f(e.batasWaktuDP)}</td>
      <td class="cell-date ${n}">${f(e.batasWaktuPelunasan)}</td>
      <td><span class="badge ${g(e.statusBayar)}">${e.statusBayar}</span></td>
      <td>${e.metodePembayaran||`-`}</td>
      <td><span class="badge ${_(e.statusLayanan)}">${e.statusLayanan||`-`}</span></td>
      <td style="max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${e.catatan||``}">${e.catatan||`-`}</td>
      <td>
        <div class="row-actions">
          <button class="row-action-btn btn-edit" data-no="${e.no}" title="Edit">✏️</button>
          <button class="row-action-btn btn-delete" data-no="${e.no}" title="Hapus">🗑️</button>
        </div>
      </td>
    </tr>
  `}function Y(e){let t=``,n=Math.max(1,F-2),r=Math.min(e,n+5-1);r-n+1<5&&(n=Math.max(1,r-5+1));for(let e=n;e<=r;e++)t+=`<button class="pagination-btn ${e===F?`active`:``}" data-page="${e}">${e}</button>`;return t}function X(){let e=document.getElementById(`searchInput`),t;e?.addEventListener(`input`,e=>{clearTimeout(t),t=setTimeout(()=>{z=e.target.value.trim(),F=1,G(),K()},300)}),document.getElementById(`filterStatusBayar`)?.addEventListener(`change`,e=>{B=e.target.value,F=1,G(),K()}),document.getElementById(`filterStatusLayanan`)?.addEventListener(`change`,e=>{V=e.target.value,F=1,G(),K()}),document.getElementById(`filterJenisLayanan`)?.addEventListener(`change`,e=>{H=e.target.value,F=1,G(),K()}),document.querySelectorAll(`[data-sort]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.sort;L===t?R=R===`asc`?`desc`:`asc`:(L=t,R=`asc`),G(),K()})}),document.querySelectorAll(`.pagination-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.page;t===`prev`?F--:t===`next`?F++:F=parseInt(t),K()})}),document.getElementById(`btnAddInvoice`)?.addEventListener(`click`,()=>{Z(null)}),document.querySelectorAll(`.btn-edit`).forEach(e=>{e.addEventListener(`click`,()=>{let t=parseInt(e.dataset.no),n=N.find(e=>e.no===t);n&&Z(n)})}),document.querySelectorAll(`.btn-delete`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=parseInt(e.dataset.no),n=N.find(e=>e.no===t);if(n&&await M(`Hapus Invoice?`,`Apakah Anda yakin ingin menghapus invoice <strong>${n.noInvoice}</strong>? Tindakan ini tidak dapat dibatalkan.`))try{await l(t),N=N.filter(e=>e.no!==t),G(),K(),j(`Invoice berhasil dihapus`,`success`)}catch(e){j(`Gagal menghapus invoice: `+e.message,`error`)}})})}function Z(e){let t=document.getElementById(`modalContainer`);t&&(t.innerHTML=D(e),O(async t=>{try{if(e){let n=await c(e.no,t),r=N.findIndex(t=>t.no===e.no);r!==-1&&(N[r]=n),j(`Invoice berhasil diupdate`,`success`)}else{let e=await s(t);N.push(e),j(`Invoice baru berhasil ditambahkan`,`success`)}G(),K()}catch(e){j(`Gagal menyimpan invoice: `+e.message,`error`)}},()=>{t.innerHTML=``},e))}var Q=`dashboard`;async function $(){let n=document.getElementById(`app`);if(!n)return;let r=e(Q),i=``;switch(Q){case`dashboard`:i=await x();break;case`invoices`:i=await U();break;default:i=await x()}switch(n.innerHTML=r+i,t(e=>{ee(e)}),Q){case`dashboard`:await S();break;case`invoices`:await W();break}}function ee(e){e!==Q&&(Q=e,window.location.hash=e,$())}window.addEventListener(`hashchange`,()=>{let e=window.location.hash.replace(`#`,``)||`dashboard`;e!==Q&&(Q=e,$())});function te(){let e=window.location.hash.replace(`#`,``);e&&[`dashboard`,`invoices`].includes(e)&&(Q=e),$()}document.addEventListener(`DOMContentLoaded`,te);