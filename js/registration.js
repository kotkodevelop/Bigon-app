const screens = Array.from(document.querySelectorAll('.screen'));
const tabs = Array.from(document.querySelectorAll('[data-auth-tab]'));
const panels = Array.from(document.querySelectorAll('[data-auth-panel]'));
const goButtons = Array.from(document.querySelectorAll('[data-go]'));
const backButtons = Array.from(document.querySelectorAll('[data-back]'));
const openExitButtons = Array.from(document.querySelectorAll('[data-open-exit]'));
const closeExitButtons = Array.from(document.querySelectorAll('[data-close-exit]'));
const exitModal = document.getElementById('exitModal');
const accountCards = Array.from(document.querySelectorAll('[data-account-card]'));
const accountInputs = Array.from(document.querySelectorAll('input[name="accountType"]'));
const roleTitles = Array.from(document.querySelectorAll('[data-role-title]'));
const addressInput = document.getElementById('addressInput');
const addressSearchInput = document.getElementById('addressSearchInput');
const clearAddressButton = document.getElementById('clearAddress');
const cancelAddressSearchButton = document.getElementById('cancelAddressSearch');
const addressScreen = document.querySelector('[data-screen="address"]');
const addressDefaultView = document.getElementById('addressDefaultView');
const addressSearchView = document.getElementById('addressSearchView');
const addressItems = Array.from(document.querySelectorAll('.address-item'));

const historyStack = ['auth'];
let currentScreen = 'auth';
let isAnimating = false;
let navigationToken = 0;

const setActiveScreenState = (activeScreenName) => {
  screens.forEach((screen) => {
    const isActive = screen.dataset.screen === activeScreenName;
    screen.classList.toggle('screen--active', isActive);
    screen.setAttribute('aria-hidden', String(!isActive));
    screen.style.pointerEvents = isActive ? 'auto' : 'none';
    screen.style.zIndex = isActive ? '2' : '1';
  });
};

const setActiveTab = (name) => {
  tabs.forEach((tab) => {
    tab.classList.toggle('is-active', tab.dataset.authTab === name);
  });

  panels.forEach((panel) => {
    const isActive = panel.dataset.authPanel === name;
    panel.classList.toggle('auth-panel--active', isActive);
    panel.setAttribute('aria-hidden', String(!isActive));
  });
};

const updateRoleTitles = () => {
  const selectedAccount = document.querySelector('input[name="accountType"]:checked')?.value || 'Частное лицо';
  roleTitles.forEach((title) => {
    title.textContent = selectedAccount;
  });
};

const openScreen = (target) => {
  if (isAnimating || target === currentScreen) return;

  const current = screens.find((screen) => screen.dataset.screen === currentScreen);
  const next = screens.find((screen) => screen.dataset.screen === target);
  if (!current || !next) return;

  isAnimating = true;
  navigationToken += 1;
  const token = navigationToken;

  current.classList.add('screen--to-left');
  current.classList.remove('screen--active');
  current.setAttribute('aria-hidden', 'true');
  current.style.pointerEvents = 'none';
  current.style.zIndex = '1';

  next.classList.add('screen--active', 'screen--animating');
  next.classList.remove('screen--to-left');
  next.setAttribute('aria-hidden', 'false');
  next.style.pointerEvents = 'none';
  next.style.zIndex = '2';

  currentScreen = target;

  if (target === 'address') {
    closeAddressSearch();
  }

  window.setTimeout(() => {
    if (token !== navigationToken) return;
    current.classList.remove('screen--to-left');
    next.classList.remove('screen--animating');
    setActiveScreenState(currentScreen);
    isAnimating = false;
  }, 420);
};

const pushAndOpen = (target) => {
  if (target !== currentScreen) {
    historyStack.push(target);
    openScreen(target);
  }
};

const goBack = () => {
  if (historyStack.length <= 1 || isAnimating) return;
  historyStack.pop();
  const previous = historyStack[historyStack.length - 1];
  openScreen(previous);
};

const openAddressSearch = () => {
  if (!addressDefaultView || !addressSearchView || !addressScreen) return;
  addressDefaultView.hidden = true;
  addressSearchView.hidden = false;
  addressScreen.classList.add('screen--search-active');
  if (addressSearchInput) {
    addressSearchInput.value = addressInput?.value || '';
    syncAddressClearState();
    requestAnimationFrame(() => addressSearchInput.focus());
  }
};

const closeAddressSearch = () => {
  if (!addressDefaultView || !addressSearchView || !addressScreen) return;
  addressDefaultView.hidden = false;
  addressSearchView.hidden = true;
  addressScreen.classList.remove('screen--search-active');
  syncAddressClearState();
};

const openExitModal = () => {
  if (!exitModal) return;
  exitModal.hidden = false;
  requestAnimationFrame(() => {
    exitModal.classList.add('is-visible');
  });
};

const closeExitModal = () => {
  if (!exitModal || exitModal.hidden) return;
  exitModal.classList.remove('is-visible', 'is-dragging');
  const sheet = exitModal.querySelector('.modal__sheet');
  if (sheet) {
    sheet.style.transform = '';
  }

  window.setTimeout(() => {
    if (!exitModal.classList.contains('is-visible')) {
      exitModal.hidden = true;
    }
  }, 340);
};

setActiveTab('login');
updateRoleTitles();
setActiveScreenState(currentScreen);

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    if (isAnimating) return;
    const tabName = tab.dataset.authTab;
    setActiveTab(tabName);
    if (tabName === 'register') {
      pushAndOpen('account');
      setActiveTab('login');
    }
  });
});

goButtons.forEach((button) => {
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (isAnimating) return;

    const ownerScreen = button.closest('.screen');
    if (!ownerScreen || ownerScreen.dataset.screen !== currentScreen || !ownerScreen.classList.contains('screen--active')) {
      return;
    }

    const target = button.dataset.go;
    if (!target) return;

    updateRoleTitles();
    pushAndOpen(target);
  });
});

backButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const ownerScreen = button.closest('.screen');
    if (!ownerScreen || ownerScreen.dataset.screen !== currentScreen) return;
    if (currentScreen === 'address' && addressSearchView && !addressSearchView.hidden) {
      closeAddressSearch();
      return;
    }
    goBack();
  });
});

accountInputs.forEach((input) => {
  input.addEventListener('change', () => {
    accountCards.forEach((card) => {
      const cardInput = card.querySelector('.account-card__input');
      card.classList.toggle('is-selected', Boolean(cardInput?.checked));
    });
    updateRoleTitles();
  });
});

openExitButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (isAnimating) return;
    openExitModal();
  });
});

closeExitButtons.forEach((button) => {
  button.addEventListener('click', () => {
    closeExitModal();
  });
});

const syncAddressClearState = () => {
  const hasValue = Boolean((addressSearchInput?.value || '').trim().length);
  if (clearAddressButton) {
    clearAddressButton.hidden = !hasValue;
  }
};

const handleAddressFieldOpen = (event) => {
  event.preventDefault();

  if (currentScreen !== 'address') return;
  if (isAnimating) return;
  if (!addressSearchView?.hidden) return;

  openAddressSearch();
};

addressInput?.addEventListener('click', handleAddressFieldOpen);
addressInput?.addEventListener('focus', handleAddressFieldOpen);

clearAddressButton?.addEventListener('click', () => {
  if (!addressSearchInput) return;
  addressSearchInput.value = '';
  if (addressInput) {
    addressInput.value = '';
  }
  syncAddressClearState();
  addressSearchInput.focus();
});

cancelAddressSearchButton?.addEventListener('click', () => {
  closeAddressSearch();
});

addressSearchInput?.addEventListener('input', () => {
  if (addressInput) {
    addressInput.value = addressSearchInput.value;
  }
  syncAddressClearState();
});

addressSearchInput?.addEventListener('focus', () => {
  syncAddressClearState();
});

addressItems.forEach((item) => {
  item.addEventListener('click', () => {
    const selected = item.dataset.address || item.textContent.trim();
    if (addressInput) addressInput.value = selected;
    if (addressSearchInput) addressSearchInput.value = selected;
    closeAddressSearch();
  });
});

const modalSheet = exitModal?.querySelector('.modal__sheet');
const modalHandle = exitModal?.querySelector('.modal__handle');

if (modalSheet && exitModal) {
  let startY = 0;
  let currentY = 0;
  let dragging = false;

  const startDrag = (event) => {
    if (!exitModal.classList.contains('is-visible')) return;
    const target = event.target;
    if (!target.closest('.modal__handle') && !target.closest('.modal__sheet')) return;
    if (target.closest('.modal__actions') || target.closest('.modal__close')) return;

    dragging = true;
    startY = event.clientY;
    currentY = 0;
    exitModal.classList.add('is-dragging');
  };

  const onDrag = (event) => {
    if (!dragging) return;
    currentY = Math.max(0, event.clientY - startY);
    modalSheet.style.transform = `translateY(${currentY}px)`;
  };

  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    exitModal.classList.remove('is-dragging');

    if (currentY > 120) {
      closeExitModal();
      return;
    }

    modalSheet.style.transform = '';
  };

  modalHandle?.addEventListener('pointerdown', startDrag);
  modalSheet.addEventListener('pointerdown', startDrag);
  window.addEventListener('pointermove', onDrag);
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !exitModal.hidden) {
    closeExitModal();
  }
});
