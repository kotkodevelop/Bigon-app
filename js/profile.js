(function () {
  const app = document.querySelector('[data-profile-app]');
  if (!app) return;

  const panels = Array.from(app.querySelectorAll('[data-profile-panel]'));
  const deleteModal = app.querySelector('[data-delete-modal]');
  let activePanel = app.dataset.screen || 'profile';

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

  const openDeleteModal = () => {
    if (!deleteModal) return;
    app.classList.add('is-delete-open');
    deleteModal.classList.add('is-open');
    deleteModal.setAttribute('aria-hidden', 'false');
  };

  function closeDeleteModal() {
    if (!deleteModal) return;
    app.classList.remove('is-delete-open');
    deleteModal.classList.remove('is-open');
    deleteModal.setAttribute('aria-hidden', 'true');
  }

  app.addEventListener('click', (event) => {
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
      input.type = input.type === 'password' ? 'text' : 'password';
    }
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
})();
