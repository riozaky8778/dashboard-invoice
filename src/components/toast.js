/**
 * Toast notification system
 */

let toastContainer = null;

function ensureContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    toastContainer.id = 'toastContainer';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

/**
 * Show a toast notification
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 * @param {number} duration - ms
 */
export function showToast(message, type = 'info', duration = 3000) {
  const container = ensureContainer();

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type]}</span>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Show confirm dialog
 * @param {string} title
 * @param {string} message
 * @returns {Promise<boolean>}
 */
export function showConfirm(title, message) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    overlay.innerHTML = `
      <div class="confirm-dialog">
        <div class="confirm-icon">⚠️</div>
        <div class="confirm-title">${title}</div>
        <div class="confirm-message">${message}</div>
        <div class="confirm-actions">
          <button class="btn btn-secondary" id="confirmCancel">Batal</button>
          <button class="btn btn-danger" id="confirmOk">Hapus</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('active'));

    const cleanup = (result) => {
      overlay.classList.remove('active');
      setTimeout(() => overlay.remove(), 300);
      resolve(result);
    };

    overlay.querySelector('#confirmCancel').addEventListener('click', () => cleanup(false));
    overlay.querySelector('#confirmOk').addEventListener('click', () => cleanup(true));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) cleanup(false);
    });
  });
}
