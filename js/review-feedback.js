(function () {
  const app = document.querySelector('.review-shell');
  if (!app) return;

  const submitButton = app.querySelector('[data-review-submit]');
  const successModal = app.querySelector('[data-review-success-modal]');
  if (!submitButton || !successModal) return;

  const closeButtons = successModal.querySelectorAll('[data-review-modal-close]');
  let closeTimer = null;
  let openFrame = null;

  const openSuccessModal = () => {
    window.clearTimeout(closeTimer);
    window.cancelAnimationFrame(openFrame);
    app.classList.add('review-page--modal');
    successModal.hidden = false;
    successModal.setAttribute('aria-hidden', 'false');
    openFrame = window.requestAnimationFrame(() => {
      successModal.classList.add('is-open');
    });
  };

  const closeSuccessModal = () => {
    if (successModal.hidden) return;

    window.cancelAnimationFrame(openFrame);
    app.classList.remove('review-page--modal');
    successModal.classList.remove('is-open');
    successModal.setAttribute('aria-hidden', 'true');
    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(() => {
      successModal.hidden = true;
    }, 180);
  };

  submitButton.addEventListener('click', openSuccessModal);

  closeButtons.forEach((button) => {
    button.addEventListener('click', closeSuccessModal);
  });

  app.addEventListener('click', (event) => {
    if (event.target === app && !successModal.hidden) {
      closeSuccessModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !successModal.hidden) {
      closeSuccessModal();
    }
  });
})();
