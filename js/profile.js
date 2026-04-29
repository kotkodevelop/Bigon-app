(function () {
  const app = document.querySelector('[data-profile-app]');
  if (!app) return;

  const panels = Array.from(app.querySelectorAll('[data-profile-panel]'));
  const deleteModal = app.querySelector('[data-delete-modal]');
  const deleteSheet = deleteModal?.querySelector('.profile-delete-sheet');
  const deleteBackdrop = deleteModal?.querySelector('.profile-delete-modal__backdrop');
  const passwordFields = Array.from(app.querySelectorAll('.profile-field--password'));
  const profileTypeButtons = Array.from(app.querySelectorAll('[data-profile-type]'));
  const profileAvatar = app.querySelector('[data-profile-avatar]');
  const profileName = app.querySelector('[data-profile-name]');
  const profileDate = app.querySelector('[data-profile-date]');
  const tariffPlans = Array.from(app.querySelectorAll('[data-tariff-plan]'));
  const tariffAgree = app.querySelector('[data-tariff-agree]');
  const tariffSubmit = app.querySelector('[data-tariff-submit]');
  let activePanel = app.dataset.screen || 'profile';
  let profileType = 'private';
  let deleteCloseTimer = null;

  const getPasswordMask = (value) => '*'.repeat(value.length);

  const syncPasswordMask = (field) => {
    const input = field.querySelector('input');
    const mask = field.querySelector('.profile-password-mask');
    if (!input || !mask) return;
    mask.textContent = getPasswordMask(input.value);
  };

  const setPasswordVisibility = (field, shouldShow) => {
    const input = field.querySelector('input');
    if (!input) return;

    const mask = field.querySelector('.profile-password-mask');
    const eye = field.querySelector('.profile-eye');

    input.type = shouldShow ? 'text' : 'password';
    input.dataset.passwordHidden = shouldShow ? 'false' : 'true';
    input.classList.toggle('is-password-masked', !shouldShow);

    if (mask) {
      mask.hidden = shouldShow;
      if (!shouldShow) syncPasswordMask(field);
    }

    if (eye) {
      eye.setAttribute('aria-label', shouldShow ? 'Скрыть пароль' : 'Показать пароль');
      const icon = eye.querySelector('img');
      if (icon) {
        icon.src = shouldShow ? './assets/profile/eye.svg' : './assets/profile/eye-off.svg';
      }
    }
  };

  passwordFields.forEach((field) => {
    const input = field.querySelector('input');
    if (!input) return;

    setPasswordVisibility(field, input.dataset.passwordHidden === 'false');
    input.addEventListener('input', () => syncPasswordMask(field));
  });

  const setProfileType = (type) => {
    if (!type || type === profileType) return;

    profileType = type;
    const isCompany = type === 'company';
    app.classList.toggle('is-company-mode', isCompany);

    profileTypeButtons.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.profileType === type);
    });

    if (profileAvatar) {
      profileAvatar.src = isCompany ? profileAvatar.dataset.companySrc : profileAvatar.dataset.privateSrc;
      profileAvatar.alt = isCompany ? 'Eco Life' : 'Даниил';
    }

    if (profileName) {
      profileName.textContent = isCompany ? profileName.dataset.companyValue : profileName.dataset.privateValue;
    }

    if (profileDate) {
      profileDate.textContent = isCompany ? profileDate.dataset.companyValue : profileDate.dataset.privateValue;
    }
  };

  const setPanel = (name) => {
    if (!name || name === activePanel) return;

    panels.forEach((panel) => {
      const isTarget = panel.dataset.profilePanel === name;
      panel.classList.toggle('is-active', isTarget);
    });

    activePanel = name;
    app.dataset.screen = name;
    closeDeleteModal();
  };

  const resetDeleteModalStyles = () => {
    if (deleteSheet) {
      deleteSheet.style.transform = '';
      deleteSheet.style.transition = '';
    }

    if (deleteBackdrop) {
      deleteBackdrop.style.opacity = '';
      deleteBackdrop.style.transition = '';
    }
  };

  const openDeleteModal = () => {
    if (!deleteModal) return;
    window.clearTimeout(deleteCloseTimer);
    resetDeleteModalStyles();
    app.classList.add('is-delete-open');
    deleteModal.classList.add('is-open');
    deleteModal.setAttribute('aria-hidden', 'false');
  };

  function closeDeleteModal() {
    if (!deleteModal) return;
    window.clearTimeout(deleteCloseTimer);
    app.classList.remove('is-delete-open');
    deleteModal.classList.remove('is-open');
    deleteModal.setAttribute('aria-hidden', 'true');

    deleteCloseTimer = window.setTimeout(resetDeleteModalStyles, 240);
  }

  const bindDeleteModalSwipe = () => {
    if (!deleteModal || !deleteSheet) return;

    const swipeThreshold = 90;
    let startY = 0;
    let currentY = 0;
    let dragging = false;
    let pointerId = null;

    const resetSheetPosition = () => {
      deleteSheet.style.transition = '';
      deleteSheet.style.transform = 'translate3d(0, 0, 0)';

      if (deleteBackdrop) {
        deleteBackdrop.style.transition = '';
        deleteBackdrop.style.opacity = '1';
      }

      window.setTimeout(() => {
        if (deleteModal.classList.contains('is-open')) {
          resetDeleteModalStyles();
        }
      }, 240);
    };

    const finishSwipe = () => {
      if (!dragging) return;

      dragging = false;
      pointerId = null;

      if (currentY > swipeThreshold) {
        deleteSheet.style.transition = 'transform var(--profile-ease)';
        deleteSheet.style.transform = `translate3d(0, ${Math.max(deleteSheet.offsetHeight + 40, currentY)}px, 0)`;

        if (deleteBackdrop) {
          deleteBackdrop.style.transition = 'opacity var(--profile-ease)';
          deleteBackdrop.style.opacity = '0';
        }

        closeDeleteModal();
      } else {
        resetSheetPosition();
      }

      currentY = 0;
    };

    deleteSheet.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      if (!deleteModal.classList.contains('is-open')) return;
      if (event.target.closest('button, a, input, textarea, select')) return;

      startY = event.clientY;
      currentY = 0;
      dragging = true;
      pointerId = event.pointerId;
      deleteSheet.setPointerCapture(event.pointerId);
    });

    deleteSheet.addEventListener('pointermove', (event) => {
      if (!dragging || event.pointerId !== pointerId) return;

      currentY = Math.max(0, event.clientY - startY);
      deleteSheet.style.transition = 'none';
      deleteSheet.style.transform = `translate3d(0, ${currentY}px, 0)`;

      if (deleteBackdrop) {
        deleteBackdrop.style.transition = 'none';
        deleteBackdrop.style.opacity = String(Math.max(0, 1 - currentY / 180));
      }
    });

    const handlePointerEnd = (event) => {
      if (pointerId !== null && deleteSheet.hasPointerCapture(event.pointerId)) {
        deleteSheet.releasePointerCapture(event.pointerId);
      }

      finishSwipe();
    };

    deleteSheet.addEventListener('pointerup', handlePointerEnd);
    deleteSheet.addEventListener('pointercancel', handlePointerEnd);
  };

  app.addEventListener('click', (event) => {
    const typeButton = event.target.closest('[data-profile-type]');
    if (typeButton && app.contains(typeButton)) {
      event.preventDefault();
      setProfileType(typeButton.dataset.profileType);
      return;
    }

    const tariffPlan = event.target.closest('[data-tariff-plan]');
    if (tariffPlan && app.contains(tariffPlan)) {
      event.preventDefault();
      tariffPlans.forEach((plan) => {
        const isActive = plan === tariffPlan;
        plan.classList.toggle('is-active', isActive);
        plan.setAttribute('aria-checked', isActive ? 'true' : 'false');
      });
      return;
    }

    const gotoButton = event.target.closest('[data-profile-goto]');
    if (gotoButton && app.contains(gotoButton)) {
      event.preventDefault();
      setPanel(gotoButton.dataset.profileGoto);
      return;
    }

    if (event.target.closest('[data-delete-open]')) {
      event.preventDefault();
      openDeleteModal();
      return;
    }

    if (event.target.closest('[data-delete-close]')) {
      event.preventDefault();
      closeDeleteModal();
      return;
    }

    const eye = event.target.closest('.profile-eye');
    if (eye) {
      event.preventDefault();
      const field = eye.closest('.profile-field--password');
      const input = field ? field.querySelector('input') : null;
      if (!input) return;
      setPasswordVisibility(field, input.dataset.passwordHidden !== 'false');
    }
  });

  tariffAgree?.addEventListener('change', () => {
    if (tariffSubmit) tariffSubmit.disabled = !tariffAgree.checked;
  });

  app.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeDeleteModal();
      return;
    }

    if (event.key !== 'Enter' && event.key !== ' ') return;
    const interactiveCard = event.target.closest('.profile-card[data-profile-goto]');
    if (!interactiveCard) return;
    event.preventDefault();
    setPanel(interactiveCard.dataset.profileGoto);
  });

  bindDeleteModalSwipe();
})();
