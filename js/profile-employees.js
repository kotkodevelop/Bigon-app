(function () {
  const app = document.querySelector('.employees-page');
  if (!app) return;

  const modals = Array.from(app.querySelectorAll('[data-employee-modal]'));
  const draggableSheetSelector = [
    '.employee-actions-sheet',
    '.employee-card-sheet',
    '.employee-delete-sheet',
    '.employee-success-card',
  ].join(', ');
  const closeTimers = new WeakMap();

  const getModalSheet = (modal) => modal.querySelector(draggableSheetSelector);
  const getModalBackdrop = (modal) => modal.querySelector('.employee-overlay__backdrop');

  const resetModalStyles = (modal) => {
    const sheet = getModalSheet(modal);
    const backdrop = getModalBackdrop(modal);

    if (sheet) {
      sheet.style.opacity = '';
      sheet.style.transform = '';
      sheet.style.transition = '';
    }

    if (backdrop) {
      backdrop.style.opacity = '';
      backdrop.style.transition = '';
    }
  };

  const scheduleModalReset = (modal) => {
    window.clearTimeout(closeTimers.get(modal));

    const timer = window.setTimeout(() => {
      if (!modal.classList.contains('is-open')) {
        resetModalStyles(modal);
      }
    }, 240);

    closeTimers.set(modal, timer);
  };

  const closeModal = (modal) => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    scheduleModalReset(modal);
  };

  const closeAll = (exceptModal = null) => {
    modals.forEach((modal) => {
      if (modal !== exceptModal) closeModal(modal);
    });
  };

  const openModal = (name) => {
    const target = modals.find((modal) => modal.dataset.employeeModal === name);
    if (!target) return;

    closeAll(target);
    window.clearTimeout(closeTimers.get(target));
    resetModalStyles(target);
    target.classList.add('is-open');
    target.setAttribute('aria-hidden', 'false');
  };

  const bindModalSwipe = (modal) => {
    const sheet = getModalSheet(modal);
    if (!sheet) return;

    const backdrop = getModalBackdrop(modal);
    const isCenteredCard = sheet.classList.contains('employee-success-card');
    const swipeThreshold = isCenteredCard ? 70 : 90;
    const velocityThreshold = 0.45;
    let startY = 0;
    let currentY = 0;
    let lastY = 0;
    let lastTime = 0;
    let velocityY = 0;
    let dragging = false;
    let pointerId = null;
    let frame = null;

    const getOpenTransform = () => (isCenteredCard ? 'translate3d(0, 0, 0) scale(1)' : 'translate3d(0, 0, 0)');

    const getDragTransform = (distance) => {
      if (!isCenteredCard) return `translate3d(0, ${distance}px, 0)`;

      const scale = Math.max(0.97, 1 - distance / 1800);
      return `translate3d(0, ${distance}px, 0) scale(${scale})`;
    };

    const applyDragStyles = () => {
      frame = null;

      const backdropOpacity = Math.max(0, 1 - currentY / 190);
      const sheetOpacity = Math.max(isCenteredCard ? 0.5 : 0.72, 1 - currentY / 360);

      sheet.style.transition = 'none';
      sheet.style.opacity = String(sheetOpacity);
      sheet.style.transform = getDragTransform(currentY);

      if (backdrop) {
        backdrop.style.transition = 'none';
        backdrop.style.opacity = String(backdropOpacity);
      }
    };

    const requestDragFrame = () => {
      if (frame !== null) return;
      frame = window.requestAnimationFrame(applyDragStyles);
    };

    const resetSheetPosition = () => {
      sheet.style.transition = 'transform var(--profile-ease), opacity var(--profile-ease)';
      sheet.style.opacity = '1';
      sheet.style.transform = getOpenTransform();

      if (backdrop) {
        backdrop.style.transition = 'opacity var(--profile-ease)';
        backdrop.style.opacity = '1';
      }

      window.setTimeout(() => {
        if (modal.classList.contains('is-open')) {
          resetModalStyles(modal);
        }
      }, 240);
    };

    const finishSwipe = () => {
      if (!dragging) return;

      dragging = false;
      pointerId = null;

      if (frame !== null) {
        window.cancelAnimationFrame(frame);
        applyDragStyles();
      }

      const shouldClose = currentY > swipeThreshold || (currentY > 24 && velocityY > velocityThreshold);

      if (shouldClose) {
        const closeDistance = isCenteredCard
          ? Math.max(window.innerHeight, currentY)
          : Math.max(sheet.offsetHeight + 40, currentY);

        sheet.style.transition = 'transform var(--profile-ease), opacity var(--profile-ease)';
        sheet.style.opacity = '0';
        sheet.style.transform = getDragTransform(closeDistance);

        if (backdrop) {
          backdrop.style.transition = 'opacity var(--profile-ease)';
          backdrop.style.opacity = '0';
        }

        closeModal(modal);
      } else {
        resetSheetPosition();
      }

      currentY = 0;
      velocityY = 0;
    };

    sheet.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      if (!modal.classList.contains('is-open')) return;
      if (event.target.closest('button, a, input, textarea, select')) return;

      startY = event.clientY;
      currentY = 0;
      lastY = event.clientY;
      lastTime = performance.now();
      velocityY = 0;
      dragging = true;
      pointerId = event.pointerId;
      sheet.setPointerCapture(event.pointerId);
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
      requestDragFrame();
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

  app.addEventListener('click', (event) => {
    const opener = event.target.closest('[data-employee-open]');
    if (opener) {
      event.preventDefault();
      openModal(opener.dataset.employeeOpen);
      return;
    }

    if (event.target.closest('[data-open-delete]')) {
      event.preventDefault();
      openModal('delete');
      return;
    }

    if (event.target.closest('[data-open-access-success]')) {
      event.preventDefault();
      openModal('access-success');
      return;
    }

    if (event.target.closest('[data-open-delete-success]')) {
      event.preventDefault();
      openModal('delete-success');
      return;
    }

    if (event.target.closest('[data-employee-close]')) {
      event.preventDefault();
      closeAll();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeAll();
  });

  modals.forEach(bindModalSwipe);
})();
