const blockedModal = document.getElementById('homeBlockedModal');
const blockedOpenTriggers = Array.from(document.querySelectorAll('[data-open-blocked-modal]'));
const blockedCloseTriggers = Array.from(document.querySelectorAll('[data-close-blocked-modal]'));
const blockedTabs = Array.from(document.querySelectorAll('[data-home-tab]'));
let blockedCloseTimer = null;

const openBlockedModal = () => {
  if (!blockedModal) return;
  window.clearTimeout(blockedCloseTimer);
  blockedModal.hidden = false;
  requestAnimationFrame(() => blockedModal.classList.add('is-open'));
};

const closeBlockedModal = () => {
  if (!blockedModal || blockedModal.hidden) return;
  blockedModal.classList.remove('is-open');
  blockedCloseTimer = window.setTimeout(() => {
    blockedModal.hidden = true;
  }, 230);
};

blockedOpenTriggers.forEach((trigger) => {
  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    openBlockedModal();
  });
});

blockedCloseTriggers.forEach((trigger) => {
  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeBlockedModal();
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeBlockedModal();
});

blockedTabs.forEach((tab) => {
  tab.addEventListener('click', (event) => {
    event.stopPropagation();
    blockedTabs.forEach((item) => item.classList.toggle('is-active', item === tab));
  });
});
