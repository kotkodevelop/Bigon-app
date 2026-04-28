const homeModalMap = {
  points: document.getElementById('homePointsModal'),
  qr: document.getElementById('homeQrModal'),
  scan: document.getElementById('homeScanModal'),
};

const homeOpenButtons = Array.from(document.querySelectorAll('[data-open-home-modal]'));
const homeCloseButtons = Array.from(document.querySelectorAll('[data-close-home-modal]'));
const homeTabs = Array.from(document.querySelectorAll('[data-home-tab]'));
const homeSwipePanels = Array.from(document.querySelectorAll('[data-home-swipe-panel]'));
let homeActiveModal = null;
let homeCloseTimer = null;

const resolveHomeModal = (target = homeActiveModal) => {
  if (!target) return homeActiveModal;
  if (target.currentTarget?.closest) {
    return target.currentTarget.closest('.home-modal') || homeActiveModal;
  }
  if (target.classList?.contains('home-modal')) {
    return target;
  }
  if (target.closest) {
    return target.closest('.home-modal') || homeActiveModal;
  }
  return homeActiveModal;
};

const openHomeModal = (name) => {
  const modal = homeModalMap[name];
  if (!modal) return;
  const panel = modal.querySelector('[data-home-swipe-panel]');

  window.clearTimeout(homeCloseTimer);
  if (homeActiveModal && homeActiveModal !== modal) {
    homeActiveModal.classList.remove('is-open');
    homeActiveModal.hidden = true;
  }

  modal.hidden = false;
  if (panel) {
    panel.style.transform = '';
    panel.style.transition = '';
  }
  homeActiveModal = modal;
  requestAnimationFrame(() => modal.classList.add('is-open'));
};

const closeHomeModal = (target = homeActiveModal) => {
  const closingModal = resolveHomeModal(target);
  if (!closingModal) return;
  const panel = closingModal.querySelector('[data-home-swipe-panel]');

  closingModal.classList.remove('is-open');
  if (homeActiveModal === closingModal) {
    homeActiveModal = null;
  }

  homeCloseTimer = window.setTimeout(() => {
    if (panel) {
      panel.style.transform = '';
      panel.style.transition = '';
    }
    closingModal.hidden = true;
  }, 230);
};

const bindHomeSwipeModal = (panel) => {
  const modal = panel.closest('.home-modal');
  if (!modal) return;

  let startY = 0;
  let currentY = 0;
  let dragging = false;
  let pointerId = null;

  const resetPanelPosition = () => {
    panel.style.transform = 'translate3d(0, 0, 0)';
    window.setTimeout(() => {
      if (!modal.hidden) {
        panel.style.transform = '';
      }
    }, 320);
  };

  const move = (clientY) => {
    if (!dragging) return;

    currentY = Math.max(0, clientY - startY);
    panel.style.transition = 'none';
    panel.style.transform = `translate3d(0, ${currentY}px, 0)`;
  };

  const end = () => {
    if (!dragging) return;

    dragging = false;
    pointerId = null;
    panel.style.transition = '';

    if (currentY > 90) {
      panel.style.transform = '';
      closeHomeModal(modal);
    } else {
      resetPanelPosition();
    }

    currentY = 0;
  };

  panel.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    startY = event.clientY;
    currentY = 0;
    dragging = true;
    pointerId = event.pointerId;
    panel.setPointerCapture(event.pointerId);
  });

  panel.addEventListener('pointermove', (event) => {
    if (!dragging || event.pointerId !== pointerId) return;
    move(event.clientY);
  });

  panel.addEventListener('pointerup', (event) => {
    if (pointerId !== null && panel.hasPointerCapture(event.pointerId)) {
      panel.releasePointerCapture(event.pointerId);
    }
    end();
  });

  panel.addEventListener('pointercancel', (event) => {
    if (pointerId !== null && panel.hasPointerCapture(event.pointerId)) {
      panel.releasePointerCapture(event.pointerId);
    }
    end();
  });
};

homeOpenButtons.forEach((button) => {
  button.addEventListener('click', () => openHomeModal(button.dataset.openHomeModal));
});

homeCloseButtons.forEach((button) => {
  button.addEventListener('click', closeHomeModal);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeHomeModal();
});

homeTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    homeTabs.forEach((item) => item.classList.toggle('is-active', item === tab));
  });
});

homeSwipePanels.forEach(bindHomeSwipeModal);
