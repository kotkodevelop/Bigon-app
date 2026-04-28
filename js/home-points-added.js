const addedModal = document.getElementById('homeAddedPointsModal');

if (addedModal) {
  const closeAddedModal = (target = addedModal) => {
    const modal = target.currentTarget?.closest('.home-modal') || addedModal;
    if (!modal || modal.hidden) return;

    modal.classList.add('is-closing');
    modal.classList.remove('is-open');

    window.setTimeout(() => {
      modal.hidden = true;
      modal.classList.remove('is-closing');
    }, 230);
  };

  addedModal.querySelectorAll('[data-close-added-modal]').forEach((button) => {
    button.addEventListener('click', closeAddedModal);
  });
}
