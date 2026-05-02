(() => {
  const app = document.querySelector('[data-add-app]');
  if (!app) return;

  const screens = Array.from(app.querySelectorAll('[data-step]'));
  const goButtons = Array.from(app.querySelectorAll('[data-go-step]'));
  const backButtons = Array.from(app.querySelectorAll('[data-back-step]'));
  const osModal = app.querySelector('[data-os-modal]');
  const osSheet = osModal?.querySelector('.ann-modal-sheet');
  const osBackdrop = osModal?.querySelector('.ann-modal__backdrop');
  const openOsButtons = Array.from(app.querySelectorAll('[data-open-os]'));
  const closeOsButtons = Array.from(app.querySelectorAll('[data-close-os]'));
  const history = ['catalog'];
  let current = 'catalog';
  let closeTimer = null;
  const photoInput = app.querySelector('[data-ann-photo-input]');
  const emptyPhotoButton = app.querySelector('[data-ann-upload-empty]');
  const filledPhotoBlock = app.querySelector('[data-ann-photo-filled]');
  const addPhotoButton = app.querySelector('[data-ann-add-photo]');
  const photoCount = app.querySelector('[data-ann-photo-count]');
  const photoGrid = app.querySelector('[data-ann-photo-grid]');
  const photoMaxCount = 20;
  const photoMaxSize = 15 * 1024 * 1024;
  const photoItems = [];

  app.querySelectorAll('[data-char-textarea]').forEach((textarea) => {
    const limit = Number(textarea.dataset.charLimit) || textarea.maxLength;
    const counter = textarea.closest('.ann-field')?.querySelector('[data-char-counter]');
    if (!counter) return;

    const updateCounter = () => {
      counter.textContent = `Символов ${textarea.value.length} из ${limit}`;
    };

    textarea.addEventListener('input', updateCounter);
    updateCounter();
  });

  const setScreen = (name, push = true) => {
    const next = screens.find((screen) => screen.dataset.step === name);
    const active = screens.find((screen) => screen.classList.contains('is-active'));
    if (!next || next === active) return;

    screens.forEach((screen) => {
      screen.classList.toggle('is-to-left', screen === active);
      screen.classList.remove('is-active');
      screen.setAttribute('aria-hidden', 'true');
    });

    next.classList.add('is-active');
    next.setAttribute('aria-hidden', 'false');
    next.scrollTop = 0;
    current = name;

    if (push && history[history.length - 1] !== name) {
      history.push(name);
    }
  };

  const setChoiceButtonState = (button) => {
    if (!button.matches('button.ann-choice-row')) return;

    const group = button.closest('.ann-choice-list');
    if (!group) return;

    group.querySelectorAll('button.ann-choice-row').forEach((choice) => {
      choice.setAttribute('aria-pressed', choice === button ? 'true' : 'false');
    });
  };

  goButtons.forEach((button) => {
    if (button.matches('button.ann-choice-row')) {
      button.setAttribute('aria-pressed', 'false');
    }

    button.addEventListener('click', () => {
      setChoiceButtonState(button);
      setScreen(button.dataset.goStep);
    });
  });

  backButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (history.length <= 1) {
        setScreen('catalog', false);
        return;
      }
      history.pop();
      setScreen(history[history.length - 1], false);
    });
  });

  const priceModeCopy = {
    fixed: {
      help: 'Цены указаны окончательно или не меняются при обсуждении покупки.',
      placeholder: 'Цена за 1 ед. товара',
    },
    from: {
      help: 'Вы указываете минимальную стоимость, окончательная цена обсуждается с покупателем.',
      placeholder: 'Цена от',
    },
  };

  app.querySelectorAll('[data-price-toggle]').forEach((toggle) => {
    const priceScreen = toggle.closest('[data-step]');
    const priceHelp = priceScreen?.querySelector('[data-price-help]');
    const priceInput = priceScreen?.querySelector('[data-price-input]');

    const updatePriceMode = () => {
      const copy = toggle.checked ? priceModeCopy.fixed : priceModeCopy.from;

      if (priceHelp) {
        priceHelp.textContent = copy.help;
      }

      if (priceInput) {
        priceInput.placeholder = copy.placeholder;
      }
    };

    toggle.addEventListener('change', updatePriceMode);
    updatePriceMode();
  });

  const renderPhotos = () => {
    if (emptyPhotoButton) {
      emptyPhotoButton.hidden = photoItems.length > 0;
    }

    if (filledPhotoBlock) {
      filledPhotoBlock.hidden = photoItems.length === 0;
    }

    if (photoCount) {
      photoCount.textContent = `Загружено ${photoItems.length}`;
    }

    if (addPhotoButton) {
      addPhotoButton.hidden = photoItems.length >= photoMaxCount;
    }

    if (!photoGrid) return;

    photoGrid.innerHTML = '';
    photoItems.forEach((item, index) => {
      const figure = document.createElement('figure');
      const image = document.createElement('img');
      const removeButton = document.createElement('button');

      image.src = item.url;
      image.alt = '';

      removeButton.type = 'button';
      removeButton.setAttribute('aria-label', 'Удалить фото');
      removeButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <rect width="24" height="24" fill="#F7F8FA" rx="6"/>
          <path stroke="#757575" stroke-linecap="round" stroke-width="1.2" d="m16 8-8 8m8 0L8 8"/>
        </svg>
      `;
      removeButton.addEventListener('click', () => {
        URL.revokeObjectURL(item.url);
        photoItems.splice(index, 1);
        renderPhotos();
      });

      figure.append(image, removeButton);
      photoGrid.appendChild(figure);
    });
  };

  const isAllowedPhoto = (file) =>
    ['image/jpeg', 'image/png'].includes(file.type) || /\.(jpe?g|png)$/i.test(file.name);

  const addPhotoFiles = (files) => {
    const nextFiles = Array.from(files || []);
    if (!nextFiles.length) return;

    let skippedCount = 0;

    nextFiles.forEach((file) => {
      if (photoItems.length >= photoMaxCount || !isAllowedPhoto(file) || file.size > photoMaxSize) {
        skippedCount += 1;
        return;
      }

      photoItems.push({
        file,
        url: URL.createObjectURL(file),
      });
    });

    if (skippedCount) {
      window.alert('Можно загрузить до 20 фото в формате JPG или PNG. Максимальный размер фото — 15 МБ.');
    }

    if (photoInput) {
      photoInput.value = '';
    }

    renderPhotos();
  };

  emptyPhotoButton?.addEventListener('click', () => {
    photoInput?.click();
  });

  addPhotoButton?.addEventListener('click', () => {
    photoInput?.click();
  });

  photoInput?.addEventListener('change', () => {
    addPhotoFiles(photoInput.files);
  });

  window.addEventListener('beforeunload', () => {
    photoItems.forEach((item) => URL.revokeObjectURL(item.url));
  });

  renderPhotos();

  const pickupInput = app.querySelector('[data-delivery-pickup]');
  const pickupDetails = app.querySelector('[data-delivery-pickup-fields]');
  const pickupAddressField = app.querySelector('[data-pickup-address-field]');
  const pickupAddressInput = app.querySelector('[data-pickup-address-input]');
  const pickupAddressClear = app.querySelector('[data-pickup-address-clear]');
  const pickupStores = app.querySelector('[data-pickup-stores]');
  const pvzInput = app.querySelector('[data-delivery-pvz]');
  const pvzDetails = app.querySelector('[data-delivery-pvz-fields]');

  const syncPickupDetails = () => {
    if (!pickupInput || !pickupDetails || !pickupAddressField || !pickupStores) return;

    const isPickupChecked = pickupInput.checked;
    const addressLength = pickupAddressInput?.value.trim().length || 0;
    const hasAddress = addressLength > 0;
    const canShowStores = addressLength >= 3;

    pickupDetails.hidden = !isPickupChecked;
    pickupAddressField.hidden = !isPickupChecked || canShowStores;
    pickupStores.hidden = !isPickupChecked || !canShowStores;

    if (pickupAddressClear) {
      pickupAddressClear.hidden = !hasAddress;
    }

    pickupAddressField
      .querySelector('.checkout-search__field')
      ?.classList.toggle('is-filled', hasAddress);
  };

  pickupInput?.addEventListener('change', () => {
    if (!pickupInput.checked && pickupAddressInput) {
      pickupAddressInput.value = '';
    }

    syncPickupDetails();
  });

  pickupAddressInput?.addEventListener('input', syncPickupDetails);
  pickupAddressClear?.addEventListener('click', () => {
    if (!pickupAddressInput) return;

    pickupAddressInput.value = '';
    syncPickupDetails();
    pickupAddressInput.focus();
  });
  syncPickupDetails();

  const syncPvzDetails = () => {
    if (!pvzInput || !pvzDetails) return;
    pvzDetails.hidden = !pvzInput.checked;
  };

  pvzInput?.addEventListener('change', syncPvzDetails);
  syncPvzDetails();

  const resetOsModalStyles = () => {
    if (osSheet) {
      osSheet.style.transition = '';
      osSheet.style.transform = '';
    }

    if (osBackdrop) {
      osBackdrop.style.transition = '';
      osBackdrop.style.opacity = '';
    }
  };

  const openOs = () => {
    if (!osModal) return;
    clearTimeout(closeTimer);
    resetOsModalStyles();
    osModal.hidden = false;
    requestAnimationFrame(() => osModal.classList.add('is-open'));
  };

  const closeOs = () => {
    if (!osModal || osModal.hidden) return;
    clearTimeout(closeTimer);
    osModal.classList.remove('is-open');
    closeTimer = window.setTimeout(() => {
      osModal.hidden = true;
      resetOsModalStyles();
    }, 230);
  };

  const bindOsSwipe = () => {
    if (!osModal || !osSheet) return;

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
      osSheet.style.transition = '';
      osSheet.style.transform = 'translate3d(0, 0, 0)';

      if (osBackdrop) {
        osBackdrop.style.transition = '';
        osBackdrop.style.opacity = '1';
      }

      window.setTimeout(() => {
        if (!osModal.hidden && osModal.classList.contains('is-open')) {
          resetOsModalStyles();
        }
      }, 230);
    };

    const finishSwipe = () => {
      if (!dragging) return;

      dragging = false;
      pointerId = null;

      const shouldClose = currentY > swipeThreshold || (currentY > 24 && velocityY > velocityThreshold);

      if (shouldClose) {
        osSheet.style.transition = 'transform var(--ann-transition)';
        osSheet.style.transform = `translate3d(0, ${Math.max(osSheet.offsetHeight + 40, currentY)}px, 0)`;

        if (osBackdrop) {
          osBackdrop.style.transition = 'opacity var(--ann-transition)';
          osBackdrop.style.opacity = '0';
        }

        closeOs();
      } else {
        resetSheetPosition();
      }

      currentY = 0;
      velocityY = 0;
    };

    osSheet.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      if (osModal.hidden || !osModal.classList.contains('is-open')) return;
      if (event.target.closest('button, a, input, textarea, select, label')) return;

      startY = event.clientY;
      currentY = 0;
      lastY = event.clientY;
      lastTime = performance.now();
      velocityY = 0;
      dragging = true;
      pointerId = event.pointerId;
      osSheet.setPointerCapture(event.pointerId);
    });

    osSheet.addEventListener('pointermove', (event) => {
      if (!dragging || event.pointerId !== pointerId) return;

      const now = performance.now();
      const elapsed = now - lastTime;
      if (elapsed > 0) {
        velocityY = (event.clientY - lastY) / elapsed;
      }

      lastY = event.clientY;
      lastTime = now;
      currentY = Math.max(0, event.clientY - startY);

      osSheet.style.transition = 'none';
      osSheet.style.transform = `translate3d(0, ${currentY}px, 0)`;

      if (osBackdrop) {
        osBackdrop.style.transition = 'none';
        osBackdrop.style.opacity = String(Math.max(0, 1 - currentY / 180));
      }
    });

    const handlePointerEnd = (event) => {
      if (!dragging || event.pointerId !== pointerId) return;

      if (osSheet.hasPointerCapture(event.pointerId)) {
        osSheet.releasePointerCapture(event.pointerId);
      }

      finishSwipe();
    };

    osSheet.addEventListener('pointerup', handlePointerEnd);
    osSheet.addEventListener('pointercancel', handlePointerEnd);
  };

  openOsButtons.forEach((button) => button.addEventListener('click', openOs));
  closeOsButtons.forEach((button) => button.addEventListener('click', closeOs));
  bindOsSwipe();

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeOs();
  });
})();
