(() => {
  const app = document.querySelector('[data-profile-app]');
  if (!app) return;

  const modal = app.querySelector('[data-loyalty-modal]');
  const sheet = modal?.querySelector('.profile-loyalty-sheet');
  const backdrop = modal?.querySelector('.profile-loyalty-modal__backdrop');
  const openButtons = Array.from(app.querySelectorAll('[data-loyalty-modal-open]'));
  const closeButtons = Array.from(app.querySelectorAll('[data-loyalty-modal-close]'));
  let closeTimer = null;

  // Держим новый файл сразу в состоянии компании, не меняя общий profile.js.
  const companyButton = app.querySelector('[data-profile-type="company"]');
  if (companyButton) {
    companyButton.click();
  }

  const resetModalStyles = () => {
    if (sheet) {
      sheet.style.transform = '';
      sheet.style.transition = '';
    }

    if (backdrop) {
      backdrop.style.opacity = '';
      backdrop.style.transition = '';
    }
  };

  const openModal = () => {
    if (!modal) return;
    window.clearTimeout(closeTimer);
    resetModalStyles();
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => modal.classList.add('is-open'));
  };

  const closeModal = () => {
    if (!modal || modal.hidden) return;
    window.clearTimeout(closeTimer);
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    closeTimer = window.setTimeout(() => {
      modal.hidden = true;
      resetModalStyles();
    }, 230);
  };

  const bindModalSwipe = () => {
    if (!modal || !sheet) return;

    const swipeThreshold = 90;
    const dragStartThreshold = 4;
    const velocityThreshold = 0.45;
    let startY = 0;
    let currentY = 0;
    let lastY = 0;
    let lastTime = 0;
    let velocityY = 0;
    let dragging = false;
    let pointerId = null;

    const resetSheetPosition = () => {
      sheet.style.transition = 'transform var(--profile-ease)';
      sheet.style.transform = 'translate3d(0, 0, 0)';

      if (backdrop) {
        backdrop.style.transition = 'opacity var(--profile-ease)';
        backdrop.style.opacity = '1';
      }

      window.setTimeout(() => {
        if (!modal.hidden && modal.classList.contains('is-open')) {
          resetModalStyles();
        }
      }, 230);
    };

    const finishSwipe = () => {
      if (!dragging) return;

      dragging = false;
      pointerId = null;

      if (currentY <= dragStartThreshold) {
        currentY = 0;
        velocityY = 0;
        return;
      }

      const shouldClose = currentY > swipeThreshold || (currentY > 24 && velocityY > velocityThreshold);

      if (shouldClose) {
        sheet.style.transition = 'transform var(--profile-ease)';
        sheet.style.transform = `translate3d(0, ${Math.max(sheet.offsetHeight + 40, currentY)}px, 0)`;

        if (backdrop) {
          backdrop.style.transition = 'opacity var(--profile-ease)';
          backdrop.style.opacity = '0';
        }

        closeModal();
      } else {
        resetSheetPosition();
      }

      currentY = 0;
      velocityY = 0;
    };

    sheet.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      if (modal.hidden || !modal.classList.contains('is-open')) return;
      if (event.target.closest('button, a, input, textarea, select')) return;

      startY = event.clientY;
      currentY = 0;
      lastY = event.clientY;
      lastTime = performance.now();
      velocityY = 0;
      dragging = true;
      pointerId = event.pointerId;
    });

    sheet.addEventListener('pointermove', (event) => {
      if (!dragging || event.pointerId !== pointerId) return;

      const now = performance.now();
      const elapsed = now - lastTime;
      if (elapsed > 0) {
        velocityY = (event.clientY - lastY) / elapsed;
      }

      lastY = event.clientY;
      lastTime = now;
      currentY = Math.max(0, event.clientY - startY);
      if (currentY <= dragStartThreshold) return;

      if (!sheet.hasPointerCapture(event.pointerId)) {
        sheet.setPointerCapture(event.pointerId);
      }

      sheet.style.transition = 'none';
      sheet.style.transform = `translate3d(0, ${currentY}px, 0)`;

      if (backdrop) {
        backdrop.style.transition = 'none';
        backdrop.style.opacity = String(Math.max(0, 1 - currentY / 180));
      }
    });

    const handlePointerEnd = (event) => {
      if (!dragging || event.pointerId !== pointerId) return;

      if (sheet.hasPointerCapture(event.pointerId)) {
        sheet.releasePointerCapture(event.pointerId);
      }

      finishSwipe();
    };

    sheet.addEventListener('pointerup', handlePointerEnd);
    sheet.addEventListener('pointercancel', handlePointerEnd);
  };

  openButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      openModal();
    });
  });

  closeButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      closeModal();
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
  });

  bindModalSwipe();
})();
