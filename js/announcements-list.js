(() => {
  const app = document.querySelector('[data-ann-list-app]');
  if (!app) return;

  const listScreen = app.querySelector('[data-ann-list-screen="list"]');
  const editScreen = app.querySelector('[data-ann-list-screen="edit"]');
  const modal = app.querySelector('[data-actions-modal]');
  const popup = app.querySelector('[data-copy-popup]');
  const readonlyTextareas = Array.from(editScreen?.querySelectorAll('.ann-field textarea[readonly]') || []);
  const editPhotoInput = editScreen?.querySelector('[data-ann-edit-photo-input]');
  const editPhotoGrid = editScreen?.querySelector('[data-ann-edit-photo-grid]');
  const editAddPhotoButton = editScreen?.querySelector('[data-ann-edit-add-photo]');
  const editPhotoMaxCount = 10;
  const editPhotoMaxSize = 25 * 1024 * 1024;
  const uploadedEditPhotos = [];
  const modalCloseDelay = 230;
  let actionsCloseTimer = null;
  let popupCloseTimer = null;

  const resetModalStyles = (targetModal) => {
    const sheet = targetModal?.querySelector('[data-ann-swipe-sheet]');
    const backdrop = targetModal?.querySelector('.ann-list-overlay__backdrop, .ann-copy-popup__backdrop');

    if (sheet) {
      sheet.style.transition = '';
      sheet.style.transform = '';
    }

    if (backdrop) {
      backdrop.style.transition = '';
      backdrop.style.opacity = '';
    }
  };

  const syncReadonlyTextareas = () => {
    if (!editScreen || editScreen.hidden) return;

    readonlyTextareas.forEach((textarea) => {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    });
  };

  const openActions = () => {
    if (!modal) return;
    window.clearTimeout(actionsCloseTimer);
    resetModalStyles(modal);
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => modal.classList.add('is-open'));
  };

  const closeActions = () => {
    if (!modal || modal.hidden) return;
    window.clearTimeout(actionsCloseTimer);
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    actionsCloseTimer = window.setTimeout(() => {
      modal.hidden = true;
      resetModalStyles(modal);
    }, modalCloseDelay);
  };

  const showList = () => {
    if (!listScreen || !editScreen) return;
    listScreen.hidden = false;
    editScreen.hidden = true;
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const showEdit = () => {
    if (!listScreen || !editScreen) return;
    closeActions();
    listScreen.hidden = true;
    editScreen.hidden = false;
    requestAnimationFrame(syncReadonlyTextareas);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const openPopup = () => {
    if (!popup) return;
    closeActions();
    window.clearTimeout(popupCloseTimer);
    resetModalStyles(popup);
    popup.hidden = false;
    popup.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => popup.classList.add('is-open'));
  };

  const closePopup = () => {
    if (!popup || popup.hidden) return;
    window.clearTimeout(popupCloseTimer);
    popup.classList.remove('is-open');
    popup.setAttribute('aria-hidden', 'true');
    popupCloseTimer = window.setTimeout(() => {
      popup.hidden = true;
      resetModalStyles(popup);
    }, modalCloseDelay);
  };

  const bindSwipeModal = (targetModal, closeModal) => {
    const sheet = targetModal?.querySelector('[data-ann-swipe-sheet]');
    const backdrop = targetModal?.querySelector('.ann-list-overlay__backdrop, .ann-copy-popup__backdrop');
    if (!targetModal || !sheet) return;

    const swipeThreshold = 90;
    const velocityThreshold = 0.45;
    let startY = 0;
    let currentY = 0;
    let lastY = 0;
    let lastTime = 0;
    let velocityY = 0;
    let dragging = false;
    let pointerId = null;

    const resetSheetPosition = () => {
      sheet.style.transition = 'transform var(--ann-transition)';
      sheet.style.transform = 'translate3d(0, 0, 0)';

      if (backdrop) {
        backdrop.style.transition = 'opacity var(--ann-transition)';
        backdrop.style.opacity = '1';
      }

      window.setTimeout(() => {
        if (!targetModal.hidden && targetModal.classList.contains('is-open')) {
          resetModalStyles(targetModal);
        }
      }, modalCloseDelay);
    };

    const finishSwipe = () => {
      if (!dragging) return;

      dragging = false;
      pointerId = null;

      const shouldClose = currentY > swipeThreshold || (currentY > 24 && velocityY > velocityThreshold);

      if (shouldClose) {
        sheet.style.transition = 'transform var(--ann-transition)';
        sheet.style.transform = `translate3d(0, ${Math.max(sheet.offsetHeight + 40, currentY)}px, 0)`;

        if (backdrop) {
          backdrop.style.transition = 'opacity var(--ann-transition)';
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
      if (targetModal.hidden || !targetModal.classList.contains('is-open')) return;
      if (event.target.closest('button, a, input, textarea, select, label')) return;

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

  const removePhotoIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="24" fill="#F7F8FA" rx="6"></rect>
      <path stroke="#757575" stroke-linecap="round" stroke-width="1.2" d="m16 8-8 8m8 0L8 8"></path>
    </svg>
  `;

  const getEditPhotoCount = () => editPhotoGrid?.querySelectorAll('figure').length || 0;

  const syncEditPhotoControls = () => {
    if (!editAddPhotoButton) return;
    editAddPhotoButton.hidden = getEditPhotoCount() >= editPhotoMaxCount;
  };

  const syncEditPhotoInputFiles = () => {
    if (!editPhotoInput || typeof DataTransfer === 'undefined') return;

    try {
      const dataTransfer = new DataTransfer();
      uploadedEditPhotos.forEach((item) => dataTransfer.items.add(item.file));
      editPhotoInput.files = dataTransfer.files;
    } catch {
      // Some browsers do not allow assigning FileList programmatically.
    }
  };

  const isAllowedEditPhoto = (file) =>
    ['image/jpeg', 'image/png'].includes(file.type) || /\.(jpe?g|png)$/i.test(file.name);

  const removeEditPhoto = (figure) => {
    if (!figure) return;

    const uploadedIndex = uploadedEditPhotos.findIndex((item) => item.figure === figure);
    if (uploadedIndex !== -1) {
      URL.revokeObjectURL(uploadedEditPhotos[uploadedIndex].url);
      uploadedEditPhotos.splice(uploadedIndex, 1);
      syncEditPhotoInputFiles();
    }

    figure.remove();
    syncEditPhotoControls();
  };

  const createEditPhoto = (file) => {
    const figure = document.createElement('figure');
    const image = document.createElement('img');
    const removeButton = document.createElement('button');
    const url = URL.createObjectURL(file);

    image.src = url;
    image.alt = '';

    removeButton.type = 'button';
    removeButton.setAttribute('aria-label', 'Удалить фото');
    removeButton.setAttribute('data-ann-edit-photo-remove', '');
    removeButton.innerHTML = removePhotoIcon;

    figure.append(image, removeButton);
    uploadedEditPhotos.push({ file, figure, url });

    return figure;
  };

  const addEditPhotos = (files) => {
    if (!editPhotoGrid) return;

    const selectedFiles = Array.from(files || []);
    if (!selectedFiles.length) return;

    let skippedCount = 0;

    selectedFiles.forEach((file) => {
      if (getEditPhotoCount() >= editPhotoMaxCount || !isAllowedEditPhoto(file) || file.size > editPhotoMaxSize) {
        skippedCount += 1;
        return;
      }

      editPhotoGrid.appendChild(createEditPhoto(file));
    });

    syncEditPhotoInputFiles();
    syncEditPhotoControls();

    if (skippedCount) {
      window.alert('Можно загрузить до 10 фото в формате JPG или PNG. Максимальный размер фото — 25 МБ.');
    }
  };

  editPhotoInput?.addEventListener('change', () => {
    addEditPhotos(editPhotoInput.files);
  });

  window.addEventListener('beforeunload', () => {
    uploadedEditPhotos.forEach((item) => URL.revokeObjectURL(item.url));
  });

  app.addEventListener('click', (event) => {
    const addPhotoButton = event.target.closest('[data-ann-edit-add-photo]');
    if (addPhotoButton) {
      event.preventDefault();
      editPhotoInput?.click();
      return;
    }

    const removePhotoButton = event.target.closest('[data-ann-edit-photo-remove]');
    if (removePhotoButton) {
      event.preventDefault();
      removeEditPhoto(removePhotoButton.closest('figure'));
      return;
    }

    if (event.target.closest('[data-actions-open]')) {
      event.preventDefault();
      openActions();
      return;
    }

    if (event.target.closest('[data-actions-close]')) {
      event.preventDefault();
      closeActions();
      return;
    }

    if (event.target.closest('[data-edit-open]')) {
      event.preventDefault();
      showEdit();
      return;
    }

    if (event.target.closest('[data-back-list]')) {
      event.preventDefault();
      showList();
      return;
    }

    if (event.target.closest('[data-copy-draft]')) {
      event.preventDefault();
      openPopup();
      return;
    }

    if (event.target.closest('[data-copy-close]')) {
      event.preventDefault();
      closePopup();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeActions();
      closePopup();
    }
  });

  bindSwipeModal(modal, closeActions);
  bindSwipeModal(popup, closePopup);
  syncEditPhotoControls();
  window.addEventListener('resize', syncReadonlyTextareas);
})();
