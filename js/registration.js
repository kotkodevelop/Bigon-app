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
const clearAddressButton = document.getElementById('clearAddress');
const addressScreen = document.querySelector('[data-screen="address"]');
const addressItems = Array.from(document.querySelectorAll('.address-item'));

const historyStack = ['auth'];
let currentScreen = 'auth';
let isAnimating = false;

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
  current.classList.add('screen--to-left');
  current.classList.remove('screen--active');
  current.setAttribute('aria-hidden', 'true');

  next.classList.add('screen--active');
  next.classList.remove('screen--to-left');
  next.setAttribute('aria-hidden', 'false');
  currentScreen = target;

  window.setTimeout(() => {
    current.classList.remove('screen--to-left');
    isAnimating = false;
  }, 360);
};

const pushAndOpen = (target) => {
  if (target !== currentScreen) {
    historyStack.push(target);
    openScreen(target);
  }
};

const goBack = () => {
  if (historyStack.length <= 1) return;
  historyStack.pop();
  const previous = historyStack[historyStack.length - 1];
  openScreen(previous);
};

const setAddressReady = (ready) => {
  addressScreen?.setAttribute('data-address-ready', String(ready));
};

setActiveTab('login');
updateRoleTitles();
setAddressReady(false);

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const tabName = tab.dataset.authTab;
    setActiveTab(tabName);
    if (tabName === 'register') {
      pushAndOpen('account');
      setActiveTab('login');
    }
  });
});

goButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const target = button.dataset.go;
    if (!target) return;
    updateRoleTitles();
    pushAndOpen(target);

    if (target === 'details') {
      setAddressReady(true);
    }
  });
});

backButtons.forEach((button) => {
  button.addEventListener('click', goBack);
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
    exitModal.hidden = false;
  });
});

closeExitButtons.forEach((button) => {
  button.addEventListener('click', () => {
    exitModal.hidden = true;
  });
});

clearAddressButton?.addEventListener('click', () => {
  addressInput.value = '';
  addressInput.focus();
});

addressItems.forEach((item) => {
  item.addEventListener('click', () => {
    addressInput.value = item.dataset.address || item.textContent.trim();
    setAddressReady(true);
  });
});

addressInput?.addEventListener('input', () => {
  setAddressReady(addressInput.value.trim().length > 3);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !exitModal.hidden) {
    exitModal.hidden = true;
  }
});
