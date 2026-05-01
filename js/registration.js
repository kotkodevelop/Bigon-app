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
const dateMaskInputs = Array.from(document.querySelectorAll('[data-date-mask]'));
const timeMaskedInputs = new WeakMap();

const logoModal = document.getElementById('logoModal');
const openLogoModalButton = document.getElementById('openLogoModal');
const closeLogoButtons = Array.from(document.querySelectorAll('[data-close-logo]'));
const saveLogoButton = document.querySelector('[data-save-logo]');
const uploadBox = document.querySelector('.upload-box');
const logoFileInput = document.getElementById('logoFileInput');
const logoPreview = document.getElementById('logoPreview');

const scheduleModal = document.getElementById('scheduleModal');
const openScheduleModalButton = document.getElementById('openScheduleModal');
const sameTimeToggle = document.getElementById('sameTimeToggle');
const scheduleList = document.getElementById('scheduleList');
const sameTimeRow = document.getElementById('sameTimeRow');
const saveScheduleButton = document.querySelector('[data-save-schedule]');
const weekChips = Array.from(document.querySelectorAll('.week-chips .chip'));
const storeSchedulePreview = document.getElementById('storeSchedulePreview');
const editScheduleButton = document.getElementById('editScheduleButton');

const processingInfoModal = document.getElementById('processingInfoModal');
const openProcessingInfoButton = document.getElementById('openProcessingInfo');
const closeProcessingInfoButtons = Array.from(
  document.querySelectorAll('[data-close-processing-info]')
);
const processingDesignSheet = processingInfoModal?.querySelector('.modal__sheet--processing-design');
const processingDesignContent = processingInfoModal?.querySelector('.processing-design__content');

const pickupToggle = document.getElementById('pickupToggle');
const addStoreButton = document.getElementById('addStoreButton');
const saveStoreButton = document.getElementById('saveStoreButton');
const storeCard = document.getElementById('storeCard');
const storeAddressInput = document.getElementById('storeAddressInput');
const storePhoneInput = document.getElementById('storePhoneInput');
const addStorePhotosButton = document.getElementById('addStorePhotosButton');
const storePhotosInput = document.getElementById('storePhotosInput');
const storePhotoPreview = document.getElementById('storePhotoPreview');
const storeCardThumb = document.getElementById('storeCardThumb');
const storeCardAddress = document.getElementById('storeCardAddress');
const storeCardPhone = document.getElementById('storeCardPhone');
const storeCardSchedule = document.getElementById('storeCardSchedule');
const editStoreButton = document.getElementById('editStoreButton');
const deleteStoreButton = document.getElementById('deleteStoreButton');

const innInput = document.getElementById('innInput');
const companyAutoFill = document.getElementById('companyAutoFill');

const historyStack = ['auth'];
let currentScreen = 'auth';
let isAnimating = false;
let navLockedUntil = 0;
let isEditingStore = false;
let savedStoreData = null;
let savedScheduleData = null;
let logoPreviewUrl = '';
const storePhotoUrls = [];

const companyStepMap = {
  'company-person': 1,
  'company-address': 2,
  'company-details': 3,
  'company-requisites': 4,
  'company-bank': 5,
  'company-data': 6,
  'company-sphere': 7,
  'company-stores': 8,
  'company-processing': 9,
};

const canNavigate = () => Date.now() >= navLockedUntil;
const lockNavigation = (ms = 700) => {
  navLockedUntil = Date.now() + ms;
};

const getSelectedAccount = () =>
  document.querySelector('input[name="accountType"]:checked')?.value || 'Частное лицо';

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
  const selected = getSelectedAccount();
  roleTitles.forEach((title) => {
    title.textContent = selected;
  });
};

const renderCompanyProgress = () => {
  document.querySelectorAll('.progress--company').forEach((progress) => {
    const owner = progress.closest('.screen')?.dataset.screen;
    const ownerIndex = companyStepMap[owner] || 0;

    progress.innerHTML = Array.from({ length: 9 }, (_, index) => {
      const active = index < ownerIndex ? ' is-active' : '';
      return `<span class="progress__item${active}"></span>`;
    }).join('');
  });
};

const dateMask = '__.__.____';
const dateMaskDigitPositions = [0, 1, 3, 4, 6, 7, 8, 9];

const getDateDigits = (value) => (value || '').replace(/\D/g, '').slice(0, 8);

const getMaskedDateValue = (digits) => {
  const chars = dateMask.split('');

  getDateDigits(digits)
    .split('')
    .forEach((digit, index) => {
      chars[dateMaskDigitPositions[index]] = digit;
    });

  return chars.join('');
};

const getDateDigitIndex = (position) =>
  dateMaskDigitPositions.filter((digitPosition) => digitPosition < position).length;

const getDateCaretPosition = (digitIndex) =>
  dateMaskDigitPositions[digitIndex] ?? dateMask.length;

const setDateMaskValue = (input, digits, caretDigitIndex = getDateDigits(digits).length) => {
  const value = getDateDigits(digits);
  input.dataset.dateDigits = value;
  input.value = getMaskedDateValue(value);

  if (document.activeElement === input) {
    const caretPosition = getDateCaretPosition(Math.min(caretDigitIndex, 8));
    input.setSelectionRange(caretPosition, caretPosition);
  }
};

const replaceDateMaskRange = (input, insertValue = '') => {
  const digits = input.dataset.dateDigits || getDateDigits(input.value);
  const selectionStart = input.selectionStart ?? 0;
  const selectionEnd = input.selectionEnd ?? selectionStart;
  let startIndex = getDateDigitIndex(selectionStart);
  let endIndex = getDateDigitIndex(selectionEnd);
  const insertDigits = getDateDigits(insertValue);

  startIndex = Math.min(startIndex, digits.length);
  endIndex = Math.min(Math.max(endIndex, startIndex), digits.length);

  if (insertDigits.length && startIndex === endIndex && startIndex < digits.length) {
    endIndex = Math.min(startIndex + insertDigits.length, digits.length);
  }

  const nextDigits = `${digits.slice(0, startIndex)}${insertDigits}${digits.slice(endIndex)}`.slice(0, 8);

  setDateMaskValue(input, nextDigits, startIndex + insertDigits.length);
};

const removeDateMaskRange = (input, direction) => {
  const digits = input.dataset.dateDigits || getDateDigits(input.value);
  const selectionStart = input.selectionStart ?? 0;
  const selectionEnd = input.selectionEnd ?? selectionStart;
  let startIndex = Math.min(getDateDigitIndex(selectionStart), digits.length);
  let endIndex = Math.min(getDateDigitIndex(selectionEnd), digits.length);

  if (startIndex === endIndex) {
    if (direction === 'backward' && startIndex > 0) {
      startIndex -= 1;
    } else if (direction === 'forward' && endIndex < digits.length) {
      endIndex += 1;
    }
  }

  const nextDigits = `${digits.slice(0, startIndex)}${digits.slice(endIndex)}`;
  setDateMaskValue(input, nextDigits, startIndex);
};

const bindDateMask = (input) => {
  input.addEventListener('focus', () => {
    const digits = input.dataset.dateDigits || getDateDigits(input.value);
    setDateMaskValue(input, digits);
  });

  input.addEventListener('blur', () => {
    const digits = input.dataset.dateDigits || getDateDigits(input.value);

    if (!digits.length) {
      input.dataset.dateDigits = '';
      input.value = '';
      return;
    }

    setDateMaskValue(input, digits);
  });

  input.addEventListener('beforeinput', (event) => {
    if (event.inputType === 'insertText') {
      event.preventDefault();
      if (getDateDigits(event.data).length) {
        replaceDateMaskRange(input, event.data);
      }
      return;
    }

    if (event.inputType === 'insertFromPaste' && event.data) {
      event.preventDefault();
      replaceDateMaskRange(input, event.data);
      return;
    }

    if (event.inputType === 'deleteContentBackward') {
      event.preventDefault();
      removeDateMaskRange(input, 'backward');
      return;
    }

    if (event.inputType === 'deleteContentForward') {
      event.preventDefault();
      removeDateMaskRange(input, 'forward');
    }
  });

  input.addEventListener('keydown', (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;

    if (/^\d$/.test(event.key)) {
      event.preventDefault();
      replaceDateMaskRange(input, event.key);
      return;
    }

    if (event.key === 'Backspace') {
      event.preventDefault();
      removeDateMaskRange(input, 'backward');
      return;
    }

    if (event.key === 'Delete') {
      event.preventDefault();
      removeDateMaskRange(input, 'forward');
      return;
    }

    if (event.key.length === 1) {
      event.preventDefault();
    }
  });

  input.addEventListener('paste', (event) => {
    event.preventDefault();
    replaceDateMaskRange(input, event.clipboardData?.getData('text') || '');
  });

  input.addEventListener('input', () => {
    setDateMaskValue(input, input.value);
  });

  input.addEventListener('click', () => {
    const digits = input.dataset.dateDigits || getDateDigits(input.value);
    const caretPosition = getDateCaretPosition(Math.min(digits.length, 8));
    const selectionStart = input.selectionStart ?? 0;
    const digitIndex = getDateDigitIndex(selectionStart);

    if (!dateMaskDigitPositions.includes(selectionStart) || digitIndex > digits.length) {
      input.setSelectionRange(caretPosition, caretPosition);
    }
  });
};

const bindTimeMask = (input) => {
  input.placeholder = '__:__';
  input.inputMode = 'numeric';
  input.autocomplete = 'off';

  if (!window.IMask || timeMaskedInputs.has(input)) {
    return;
  }

  timeMaskedInputs.set(input, window.IMask(input, {
    mask: '00:00',
    lazy: false,
    placeholderChar: '_',
  }));
};

const bindTimeMasks = (root = document) => {
  root.querySelectorAll('[data-time-mask]').forEach(bindTimeMask);
};

const getTimeValue = (input, fallback) => {
  const value = input?.value?.trim() || '';
  return /^\d{2}:\d{2}$/.test(value) ? value : fallback;
};

const openScreen = (target) => {
  if (isAnimating || !canNavigate() || target === currentScreen) return;

  const current = screens.find((screen) => screen.dataset.screen === currentScreen);
  const next = screens.find((screen) => screen.dataset.screen === target);

  if (!current || !next) return;

  isAnimating = true;
  lockNavigation();

  current.classList.add('screen--to-left');
  current.classList.remove('screen--active');
  current.setAttribute('aria-hidden', 'true');

  next.classList.add('screen--active', 'screen--animating');
  next.classList.remove('screen--to-left');
  next.setAttribute('aria-hidden', 'false');

  currentScreen = target;
  renderCompanyProgress();

  if (target !== 'address') closeAddressSearch('person');
  if (target !== 'company-address') closeAddressSearch('company');
  if (target !== 'company-store-form') closeAddressSearch('store');

  window.setTimeout(() => {
    current.classList.remove('screen--to-left');
    next.classList.remove('screen--animating');
    isAnimating = false;
  }, 360);
};

const pushAndOpen = (target) => {
  if (!target || target === currentScreen) return;
  historyStack.push(target);
  openScreen(target);
};

const goBack = () => {
  if (historyStack.length <= 1 || isAnimating) return;
  historyStack.pop();
  openScreen(historyStack[historyStack.length - 1]);
};

const routeTarget = (target) => {
  if (target === 'person' && getSelectedAccount() === 'Компания') {
    return 'company-person';
  }
  return target;
};

const getAddressConfig = (prefix) => {
  if (prefix === 'company') {
    return {
      input: document.getElementById('companyAddressInput'),
      searchInput: document.getElementById('companyAddressSearchInput'),
      clearButton: document.getElementById('companyClearAddress'),
      cancelButton: document.getElementById('companyCancelAddressSearch'),
      defaultView: document.getElementById('companyAddressDefaultView'),
      searchView: document.getElementById('companyAddressSearchView'),
      screen: document.querySelector('[data-screen="company-address"]'),
      footer: document.getElementById('companyAddressFooter'),
      items: Array.from(document.querySelectorAll('.company-address-item')),
    };
  }

  if (prefix === 'store') {
    return {
      input: document.getElementById('storeAddressInput'),
      searchInput: document.getElementById('storeAddressSearchInput'),
      clearButton: document.getElementById('storeClearAddress'),
      cancelButton: document.getElementById('storeCancelAddressSearch'),
      defaultView: document.getElementById('storeAddressDefaultView'),
      searchView: document.getElementById('storeAddressSearchView'),
      screen: document.querySelector('[data-screen="company-store-form"]'),
      footer: document.getElementById('storeFormFooter'),
      items: Array.from(document.querySelectorAll('.store-address-item')),
    };
  }

  return {
    input: document.getElementById('addressInput'),
    searchInput: document.getElementById('addressSearchInput'),
    clearButton: document.getElementById('clearAddress'),
    cancelButton: document.getElementById('cancelAddressSearch'),
    defaultView: document.getElementById('addressDefaultView'),
    searchView: document.getElementById('addressSearchView'),
    screen: document.querySelector('[data-screen="address"]'),
    footer: document.getElementById('addressFooter'),
    items: Array.from(
      document.querySelectorAll('.address-item:not(.company-address-item):not(.store-address-item)')
    ),
  };
};

const syncAddressClearState = (prefix) => {
  const config = getAddressConfig(prefix);
  if (!config.clearButton || !config.searchInput) return;

  const hasValue = Boolean((config.searchInput.value || '').trim());
  config.clearButton.hidden = !hasValue;
  config.searchInput.closest('.address-searchbar__input')?.classList.toggle('is-filled', hasValue);
};

const openAddressSearch = (prefix) => {
  const config = getAddressConfig(prefix);
  if (!config.defaultView || !config.searchView || !config.screen) return;

  config.defaultView.hidden = true;
  config.searchView.hidden = false;
  config.screen.classList.add('screen--search-active');

  if (config.footer) {
    config.footer.hidden = true;
  }

  if (config.searchInput) {
    config.searchInput.value = config.input?.value || '';
    syncAddressClearState(prefix);
    requestAnimationFrame(() => config.searchInput.focus());
  }
};

const closeAddressSearch = (prefix) => {
  const config = getAddressConfig(prefix);
  if (!config.defaultView || !config.searchView || !config.screen) return;

  config.defaultView.hidden = false;
  config.searchView.hidden = true;
  config.screen.classList.remove('screen--search-active');

  if (config.footer) {
    config.footer.hidden = false;
  }

  syncAddressClearState(prefix);
};

const bindAddressSearch = (prefix) => {
  const config = getAddressConfig(prefix);
  if (!config.input) return;

  const open = (event) => {
    event.preventDefault();
    if (isAnimating) return;
    openAddressSearch(prefix);
  };

  config.input.addEventListener('click', open);

  config.clearButton?.addEventListener('click', () => {
    if (config.searchInput) config.searchInput.value = '';
    if (config.input) config.input.value = '';
    syncAddressClearState(prefix);
    if (prefix === 'store') syncStoreSaveButtonState();
    config.searchInput?.focus();
  });

  config.cancelButton?.addEventListener('click', () => closeAddressSearch(prefix));

  config.searchInput?.addEventListener('input', () => {
    if (config.input) {
      config.input.value = config.searchInput.value;
    }
    syncAddressClearState(prefix);
    if (prefix === 'store') syncStoreSaveButtonState();
  });

  config.items.forEach((item) => {
    item.addEventListener('click', () => {
      const value = item.dataset.address || item.textContent.trim();
      if (config.input) config.input.value = value;
      if (config.searchInput) config.searchInput.value = value;
      closeAddressSearch(prefix);
      if (prefix === 'store') syncStoreSaveButtonState();
    });
  });
};

const openModal = (modal) => {
  if (!modal) return;
  modal.hidden = false;

  if (modal === processingInfoModal && processingDesignSheet && processingDesignContent) {
    processingDesignSheet.scrollTop = 0;
    processingDesignSheet.style.setProperty('--processing-content-overlap', '0px');
  }

  requestAnimationFrame(() => {
    modal.classList.add('is-open');
  });
};

const closeModal = (modal) => {
  if (!modal || modal.hidden) return;

  modal.classList.remove('is-open');
  modal.classList.add('is-closing');

  window.setTimeout(() => {
    modal.classList.remove('is-closing');
    modal.hidden = true;

    const sheet = modal.querySelector('[data-swipe-sheet]');
    if (sheet) {
      sheet.style.transform = '';
      sheet.style.transition = '';
    }
  }, 260);
};

const bindSwipeModal = (modal) => {
  const sheet = modal?.querySelector('[data-swipe-sheet]');
  if (!modal || !sheet) return;

  let startY = 0;
  let currentY = 0;
  let dragging = false;

  const move = (clientY) => {
    if (!dragging) return;

    currentY = Math.max(0, clientY - startY);
    sheet.style.transition = 'none';
    sheet.style.transform = `translate3d(0, ${currentY}px, 0)`;
  };

  const end = () => {
    if (!dragging) return;

    dragging = false;
    sheet.style.transition = '';

    if (currentY > 90) {
      sheet.style.transform = '';
      closeModal(modal);
    } else {
      sheet.style.transform = 'translate3d(0, 0, 0)';
      window.setTimeout(() => {
        if (!modal.hidden) {
          sheet.style.transform = '';
        }
      }, 320);
    }

    currentY = 0;
  };

  sheet.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    startY = event.clientY;
    currentY = 0;
    dragging = true;
  });

  sheet.addEventListener('pointermove', (event) => move(event.clientY));
  sheet.addEventListener('pointerup', end);
  sheet.addEventListener('pointercancel', end);
};

const syncProcessingContentOverlap = () => {
  if (!processingDesignSheet || !processingDesignContent) return;

  const overlap = Math.min(processingDesignSheet.scrollTop, 28);
  processingDesignSheet.style.setProperty('--processing-content-overlap', `${overlap}px`);
};

const updateLogoPreview = (url) => {
  if (!logoPreview) return;
  logoPreview.style.backgroundImage = url ? `url(${url})` : '';
  logoPreview.classList.toggle('logo-preview--image', Boolean(url));
};

const createScheduleRow = (label, from = '08:00', to = '18:00') => `
  <div class="schedule-item">
    <span>${label}</span>
    <div class="schedule-item__inputs">
      <div class="time-field">
        <span class="time-field__prefix">с</span>
        <input class="schedule-time-input" type="text" inputmode="numeric" placeholder="__:__" value="${from}" data-time-mask />
        <button class="time-field__clear" type="button" aria-label="Очистить время">
          <img src="./assets/close-icon-find.svg" alt="close" />
        </button>
      </div>

      <span class="schedule-item__dash">—</span>

      <div class="time-field">
        <span class="time-field__prefix">до</span>
        <input class="schedule-time-input" type="text" inputmode="numeric" placeholder="__:__" value="${to}" data-time-mask />
        <button class="time-field__clear" type="button" aria-label="Очистить время">
          <img src="./assets/close-icon-find.svg" alt="close" />
        </button>
      </div>
    </div>
  </div>
`;

document.addEventListener('click', (event) => {
  const clearButton = event.target.closest('.time-field__clear');
  if (!clearButton) return;

  const field = clearButton.closest('.time-field');
  const input = field?.querySelector('[data-time-mask]');
  if (!input) return;

  const mask = timeMaskedInputs.get(input);
  if (mask) {
    mask.value = '';
  } else {
    input.value = '';
  }

  input.focus();
});

const buildScheduleRows = () => {
  if (!scheduleList) return;

  const activeDays = weekChips.filter((chip) => chip.classList.contains('is-active'));
  const labels = activeDays.length
  ? activeDays.map((chip) => {
      const short = chip.textContent.trim();
      const map = {
        Пн: 'Понедельник:',
        Вт: 'Вторник:',
        Ср: 'Среда:',
        Чт: 'Четверг:',
        Пт: 'Пятница:',
        Сб: 'Суббота:',
        Вс: 'Воскресенье:',
      };
      return map[short] || short;
    })
  : ['Понедельник'];

  scheduleList.innerHTML = labels
    .map((label, index) =>
      createScheduleRow(
        label,
        index === 0 ? '08:00' : '09:00',
        index === 0 ? '18:00' : '21:00'
      )
    )
    .join('');

  bindTimeMasks(scheduleList);
};

const getScheduleSummary = () => {
  const shortDayMap = {
    'Понедельник:': 'пн',
    'Вторник:': 'вт',
    'Среда:': 'ср',
    'Четверг:': 'чт',
    'Пятница:': 'пт',
    'Суббота:': 'сб',
    'Воскресенье:': 'вс',
  };

  if (sameTimeToggle?.checked) {
    const sameTimeInputs = sameTimeRow?.querySelectorAll('[data-time-mask]');
    const sameTimeFrom = getTimeValue(sameTimeInputs?.[0], '08:00');
    const sameTimeTo = getTimeValue(sameTimeInputs?.[1], '18:00');
    const active = weekChips
      .filter((chip) => chip.classList.contains('is-active'))
      .map((chip) => chip.textContent.trim());

    const allDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const activeIndexes = allDays
      .map((day, index) => (active.includes(day) ? index : -1))
      .filter((index) => index !== -1);

    if (!activeIndexes.length) {
      return `
        <div class="store-schedule-summary">
          <div><span>пн - пт:</span> ${sameTimeFrom} - ${sameTimeTo}</div>
        </div>
      `;
    }

    const groups = [];
    let start = activeIndexes[0];
    let prev = activeIndexes[0];

    for (let i = 1; i < activeIndexes.length; i += 1) {
      const current = activeIndexes[i];

      if (current === prev + 1) {
        prev = current;
        continue;
      }

      groups.push([start, prev]);
      start = current;
      prev = current;
    }

    groups.push([start, prev]);

    const lines = groups.map(([from, to]) => {
      const fromDay = allDays[from].toLowerCase();
      const toDay = allDays[to].toLowerCase();
      const daysText = from === to ? fromDay : `${fromDay} - ${toDay}`;

      return `<div><span>${daysText}:</span> ${sameTimeFrom} - ${sameTimeTo}</div>`;
    });

    return `
      <div class="store-schedule-summary">
        ${lines.join('')}
      </div>
    `;
  }

  const rows = Array.from(scheduleList?.querySelectorAll('.schedule-item') || []);

  const normalized = rows.map((row) => {
    const label = row.querySelector('.schedule-item > span')?.textContent?.trim() || '';
    const inputs = row.querySelectorAll('.schedule-time-input');
    const from = getTimeValue(inputs[0], '08:00');
    const to = getTimeValue(inputs[1], '18:00');

    return {
      day: shortDayMap[label] || label.toLowerCase(),
      from,
      to,
    };
  });

  const groups = [];

  for (const item of normalized) {
    const last = groups[groups.length - 1];

    if (last && last.from === item.from && last.to === item.to) {
      last.days.push(item.day);
    } else {
      groups.push({
        from: item.from,
        to: item.to,
        days: [item.day],
      });
    }
  }

  const lines = groups.map((group) => {
    const firstDay = group.days[0];
    const lastDay = group.days[group.days.length - 1];
    const daysText = group.days.length === 1 ? firstDay : `${firstDay} - ${lastDay}`;

    return `<div><span>${daysText}:</span> ${group.from} - ${group.to}</div>`;
  });

  return `
    <div class="store-schedule-summary">
      ${lines.join('')}
    </div>
  `;
};

const syncPickupState = () => {
  if (!pickupToggle || !addStoreButton) return;
  addStoreButton.hidden = !pickupToggle.checked;
};

const hasStoreSchedule = () =>
  Boolean(savedScheduleData || (!storeSchedulePreview?.hidden && storeSchedulePreview?.innerHTML.trim()));

const hasStorePhoto = () => storePhotoUrls.length > 0;

const isStoreFormComplete = () =>
  Boolean(storeAddressInput?.value.trim()) && hasStoreSchedule() && hasStorePhoto();

const syncStoreSaveButtonState = () => {
  if (!saveStoreButton) return;

  const isComplete = isStoreFormComplete();
  saveStoreButton.disabled = !isComplete;
  saveStoreButton.setAttribute('aria-disabled', String(!isComplete));
};

const clearStorePhotos = () => {
  storePhotoUrls.length = 0;
};

const resetStoreForm = () => {
  if (storeAddressInput) {
    storeAddressInput.value = '';
  }

  if (storePhoneInput) {
    storePhoneInput.value = '+7 (999) 999-99-99';
  }

  savedScheduleData = null;

  if (storeSchedulePreview) {
    storeSchedulePreview.hidden = true;
    storeSchedulePreview.innerHTML = '';
  }

  if (openScheduleModalButton) {
    openScheduleModalButton.hidden = false;
  }

  if (editScheduleButton) {
    editScheduleButton.hidden = true;
  }

  if (storePhotosInput) {
    storePhotosInput.value = '';
  }

  clearStorePhotos();
  renderStorePhotos();
  syncStoreSaveButtonState();
};

const renderStorePhotos = () => {
  if (!storePhotoPreview) return;

  storePhotoPreview.innerHTML = '';
  if (!storePhotoUrls.length) {
    syncStoreSaveButtonState();
    return;
  }

  storePhotoUrls.forEach((url, index) => {
    const div = document.createElement('div');
    div.className = 'photo-upload__thumb photo-upload__thumb--image';
    div.style.backgroundImage = `url(${url})`;

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'photo-upload__remove';
    remove.setAttribute('aria-label', 'Удалить фото');
    remove.innerHTML = '<img src="./assets/delete-bin.svg" alt="delete">';
    remove.addEventListener('click', () => {
      storePhotoUrls.splice(index, 1);
      renderStorePhotos();
    });

    div.appendChild(remove);
    storePhotoPreview.appendChild(div);
  });

  syncStoreSaveButtonState();
};

const fillStoreForm = (data) => {
  if (storeAddressInput) {
    storeAddressInput.value = data?.address || '';
  }

  if (storePhoneInput) {
    storePhoneInput.value = data?.phone || '+7 (999) 999-99-99';
  }

  savedScheduleData = data?.schedule || null;

  if (storeSchedulePreview) {
    storeSchedulePreview.hidden = !savedScheduleData;
    storeSchedulePreview.innerHTML = savedScheduleData || '';
  }

  if (openScheduleModalButton) {
    openScheduleModalButton.hidden = Boolean(savedScheduleData);
  }

  if (editScheduleButton) {
    editScheduleButton.hidden = !savedScheduleData;
  }

  clearStorePhotos();
  if (data?.photo) {
    storePhotoUrls.push(data.photo);
  }

  renderStorePhotos();
  syncStoreSaveButtonState();
};

setActiveTab('login');
updateRoleTitles();
renderCompanyProgress();

bindAddressSearch('person');
bindAddressSearch('company');
bindAddressSearch('store');
storeAddressInput?.addEventListener('input', syncStoreSaveButtonState);
syncStoreSaveButtonState();
dateMaskInputs.forEach(bindDateMask);
bindTimeMasks();

bindSwipeModal(exitModal);
bindSwipeModal(scheduleModal);
bindSwipeModal(logoModal);
bindSwipeModal(processingInfoModal);

processingDesignSheet?.addEventListener('scroll', syncProcessingContentOverlap, { passive: true });

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
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (isAnimating || !canNavigate()) return;

    const ownerScreen = button.closest('.screen');
    if (!ownerScreen || ownerScreen.dataset.screen !== currentScreen) return;

    if (button === addStoreButton) {
      isEditingStore = false;
      resetStoreForm();
    }

    updateRoleTitles();
    pushAndOpen(routeTarget(button.dataset.go));
  });
});

backButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (currentScreen === 'address' && !getAddressConfig('person').searchView.hidden) {
      closeAddressSearch('person');
      return;
    }

    if (currentScreen === 'company-address' && !getAddressConfig('company').searchView.hidden) {
      closeAddressSearch('company');
      return;
    }

    if (currentScreen === 'company-store-form' && !getAddressConfig('store').searchView.hidden) {
      closeAddressSearch('store');
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
  button.addEventListener('click', () => openModal(exitModal));
});

closeExitButtons.forEach((button) => {
  button.addEventListener('click', () => closeModal(exitModal));
});

openLogoModalButton?.addEventListener('click', () => {
  if (logoPreviewUrl) {
    updateLogoPreview(logoPreviewUrl);
    openModal(logoModal);
    return;
  }

  logoFileInput?.click();
});

logoFileInput?.addEventListener('change', () => {
  const file = logoFileInput.files?.[0];
  if (!file) return;

  if (logoPreviewUrl) {
    URL.revokeObjectURL(logoPreviewUrl);
  }

  logoPreviewUrl = URL.createObjectURL(file);
  updateLogoPreview(logoPreviewUrl);
  openModal(logoModal);
});

closeLogoButtons.forEach((button) => {
  button.addEventListener('click', () => closeModal(logoModal));
});

saveLogoButton?.addEventListener('click', () => {
  if (logoPreviewUrl && uploadBox) {
    uploadBox.classList.add('upload-box--filled');
    uploadBox.innerHTML = `
      <span class="upload-box__image" style="background-image:url(${logoPreviewUrl})"></span>
    `;
  }

  closeModal(logoModal);
});

openScheduleModalButton?.addEventListener('click', () => {
  openModal(scheduleModal);
});

editScheduleButton?.addEventListener('click', () => {
  openModal(scheduleModal);
});

Array.from(document.querySelectorAll('[data-close-schedule]')).forEach((button) => {
  button.addEventListener('click', () => closeModal(scheduleModal));
});

weekChips.forEach((chip) => {
  chip.addEventListener('click', () => {
    chip.classList.toggle('is-active');

    if (!sameTimeToggle?.checked) {
      buildScheduleRows();
    }
  });
});

sameTimeToggle?.addEventListener('change', (event) => {
  const checked = event.target.checked;

  if (scheduleList) {
    scheduleList.hidden = checked;
  }

  if (sameTimeRow) {
    sameTimeRow.hidden = !checked;
  }

  if (!checked) {
    buildScheduleRows();
  }
});

saveScheduleButton?.addEventListener('click', () => {
  savedScheduleData = getScheduleSummary();

  if (storeSchedulePreview) {
    storeSchedulePreview.hidden = false;
    storeSchedulePreview.innerHTML = savedScheduleData;
  }

  if (openScheduleModalButton) {
    openScheduleModalButton.hidden = true;
  }

  if (editScheduleButton) {
    editScheduleButton.hidden = false;
  }

  syncStoreSaveButtonState();
  closeModal(scheduleModal);
});

if (sameTimeRow) {
  sameTimeRow.hidden = !sameTimeToggle?.checked;
}

if (!sameTimeToggle?.checked) {
  buildScheduleRows();
}

syncPickupState();
pickupToggle?.addEventListener('change', syncPickupState);

addStorePhotosButton?.addEventListener('click', () => {
  storePhotosInput?.click();
});

storePhotosInput?.addEventListener('change', () => {
  Array.from(storePhotosInput.files || []).forEach((file) => {
    storePhotoUrls.push(URL.createObjectURL(file));
  });

  renderStorePhotos();
});

saveStoreButton?.addEventListener('click', () => {
  syncStoreSaveButtonState();
  if (saveStoreButton.disabled) return;

  const address = storeAddressInput?.value.trim() || '';
  const phone = storePhoneInput?.value.trim() || '+7 (999) 999-99-99';
  const schedule = savedScheduleData || storeSchedulePreview?.innerHTML || '';
  const photo = storePhotoUrls[0] || './assets/store-card-preview.png';

  savedStoreData = {
    address,
    phone,
    schedule,
    photo,
  };

  if (storeCardAddress) {
    storeCardAddress.textContent = savedStoreData.address;
  }

  if (storeCardPhone) {
    storeCardPhone.textContent = savedStoreData.phone;
  }

  if (storeCardSchedule) {
    storeCardSchedule.innerHTML = savedStoreData.schedule;
  }

  if (storeCardThumb) {
    storeCardThumb.style.backgroundImage = `url('${savedStoreData.photo}')`;
    storeCardThumb.classList.add('store-card__thumb--image');
  }

  if (storeCard) {
    storeCard.hidden = false;
  }

  historyStack.pop();
  openScreen('company-stores');
  isEditingStore = false;
});

editStoreButton?.addEventListener('click', () => {
  isEditingStore = true;
  fillStoreForm(savedStoreData);
  pushAndOpen('company-store-form');
});

deleteStoreButton?.addEventListener('click', () => {
  savedStoreData = null;
  if (storeCard) {
    storeCard.hidden = true;
  }
});

openProcessingInfoButton?.addEventListener('click', () => {
  openModal(processingInfoModal);
});

closeProcessingInfoButtons.forEach((button) => {
  button.addEventListener('click', () => closeModal(processingInfoModal));
});

innInput?.addEventListener('input', () => {
  const value = (innInput.value || '').replace(/\D/g, '');
  innInput.value = value;

  if (companyAutoFill) {
    companyAutoFill.hidden = value.length < 10;
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;

  if (exitModal && !exitModal.hidden) closeModal(exitModal);
  if (logoModal && !logoModal.hidden) closeModal(logoModal);
  if (scheduleModal && !scheduleModal.hidden) closeModal(scheduleModal);
  if (processingInfoModal && !processingInfoModal.hidden) closeModal(processingInfoModal);
});

if (openScheduleModalButton && editScheduleButton && storeSchedulePreview) {
  const hasSchedulePreview = !storeSchedulePreview.hidden && storeSchedulePreview.innerHTML.trim().length > 0;
  openScheduleModalButton.hidden = hasSchedulePreview;
  editScheduleButton.hidden = !hasSchedulePreview;
  syncStoreSaveButtonState();
}
