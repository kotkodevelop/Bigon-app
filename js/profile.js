(function () {
  const app = document.querySelector('[data-profile-app]');
  if (!app) return;

  const panels = Array.from(app.querySelectorAll('[data-profile-panel]'));
  const deleteModal = app.querySelector('[data-delete-modal]');
  const deleteSheet = deleteModal?.querySelector('.profile-delete-sheet');
  const deleteBackdrop = deleteModal?.querySelector('.profile-delete-modal__backdrop');
  const employeesModal = app.querySelector('[data-employees-modal]');
  const employeesSheet = employeesModal?.querySelector('.profile-employee-sheet');
  const employeesBackdrop = employeesModal?.querySelector('.profile-employees-modal__backdrop');
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
  let employeesModalCloseTimer = null;

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
    closeEmployeesModal();
    closeDeleteModal();
  };

  const openEmployeesModal = () => {
    if (!employeesModal) return;
    window.clearTimeout(employeesModalCloseTimer);
    resetEmployeesModalStyles();
    employeesModal.classList.add('is-open');
    employeesModal.setAttribute('aria-hidden', 'false');
  };

  function closeEmployeesModal() {
    if (!employeesModal) return;
    window.clearTimeout(employeesModalCloseTimer);
    employeesModal.classList.remove('is-open');
    employeesModal.setAttribute('aria-hidden', 'true');

    employeesModalCloseTimer = window.setTimeout(resetEmployeesModalStyles, 240);
  }

  function resetEmployeesModalStyles() {
    if (employeesSheet) {
      employeesSheet.style.opacity = '';
      employeesSheet.style.transform = '';
      employeesSheet.style.transition = '';
    }

    if (employeesBackdrop) {
      employeesBackdrop.style.opacity = '';
      employeesBackdrop.style.transition = '';
    }
  }

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

  const bindEmployeesModalSwipe = () => {
    if (!employeesModal || !employeesSheet) return;

    const swipeThreshold = 90;
    let startY = 0;
    let currentY = 0;
    let dragging = false;
    let pointerId = null;

    const resetSheetPosition = () => {
      employeesSheet.style.transition = '';
      employeesSheet.style.opacity = '1';
      employeesSheet.style.transform = 'translate3d(0, 0, 0)';

      if (employeesBackdrop) {
        employeesBackdrop.style.transition = '';
        employeesBackdrop.style.opacity = '1';
      }

      window.setTimeout(() => {
        if (employeesModal.classList.contains('is-open')) {
          resetEmployeesModalStyles();
        }
      }, 240);
    };

    const finishSwipe = () => {
      if (!dragging) return;

      dragging = false;
      pointerId = null;

      if (currentY > swipeThreshold) {
        employeesSheet.style.transition = 'transform var(--profile-ease), opacity var(--profile-ease)';
        employeesSheet.style.opacity = '0';
        employeesSheet.style.transform = `translate3d(0, ${Math.max(employeesSheet.offsetHeight + 40, currentY)}px, 0)`;

        if (employeesBackdrop) {
          employeesBackdrop.style.transition = 'opacity var(--profile-ease)';
          employeesBackdrop.style.opacity = '0';
        }

        closeEmployeesModal();
      } else {
        resetSheetPosition();
      }

      currentY = 0;
    };

    employeesSheet.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      if (!employeesModal.classList.contains('is-open')) return;
      if (event.target.closest('button, a, input, textarea, select')) return;

      startY = event.clientY;
      currentY = 0;
      dragging = true;
      pointerId = event.pointerId;
      employeesSheet.setPointerCapture(event.pointerId);
    });

    employeesSheet.addEventListener('pointermove', (event) => {
      if (!dragging || event.pointerId !== pointerId) return;

      currentY = Math.max(0, event.clientY - startY);
      employeesSheet.style.transition = 'none';
      employeesSheet.style.opacity = String(Math.max(0.72, 1 - currentY / 360));
      employeesSheet.style.transform = `translate3d(0, ${currentY}px, 0)`;

      if (employeesBackdrop) {
        employeesBackdrop.style.transition = 'none';
        employeesBackdrop.style.opacity = String(Math.max(0, 1 - currentY / 180));
      }
    });

    const handlePointerEnd = (event) => {
      if (pointerId !== null && employeesSheet.hasPointerCapture(event.pointerId)) {
        employeesSheet.releasePointerCapture(event.pointerId);
      }

      finishSwipe();
    };

    employeesSheet.addEventListener('pointerup', handlePointerEnd);
    employeesSheet.addEventListener('pointercancel', handlePointerEnd);
  };

  const updateButtonTextTemporarily = (button, text) => {
    const initialText = button.textContent.trim();
    button.textContent = text;
    window.setTimeout(() => {
      button.textContent = initialText;
    }, 1800);
  };

  const handleEmployeeShareRequest = async (button) => {
    const shareData = {
      title: button.dataset.shareTitle || document.title,
      text: button.dataset.shareText || '',
    };

    if (button.dataset.shareUrl) {
      shareData.url = new URL(button.dataset.shareUrl, window.location.href).href;
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if (error?.name !== 'AbortError') {
          updateButtonTextTemporarily(button, 'Не удалось отправить');
        }
      }
      return;
    }

    if (navigator.clipboard && shareData.text) {
      try {
        await navigator.clipboard.writeText([shareData.text, shareData.url].filter(Boolean).join('\n'));
        updateButtonTextTemporarily(button, 'Текст скопирован');
      } catch {
        updateButtonTextTemporarily(button, 'Поделиться недоступно');
      }
      return;
    }

    updateButtonTextTemporarily(button, 'Поделиться недоступно');
  };

  app.addEventListener('click', (event) => {
    const employeeShareRequestButton = event.target.closest('[data-employee-share-request]');
    if (employeeShareRequestButton && app.contains(employeeShareRequestButton)) {
      event.preventDefault();
      handleEmployeeShareRequest(employeeShareRequestButton);
      return;
    }

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

    if (event.target.closest('[data-employees-modal-open]')) {
      event.preventDefault();
      openEmployeesModal();
      return;
    }

    if (event.target.closest('[data-employees-modal-close]')) {
      event.preventDefault();
      closeEmployeesModal();
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
      closeEmployeesModal();
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
  bindEmployeesModalSwipe();
})();
