const catalogApp = document.querySelector('.catalog-app');
const catalogPages = Array.from(document.querySelectorAll('[data-catalog-page]'));
const catalogSheets = Array.from(document.querySelectorAll('[data-catalog-sheet]'));
const catalogOverlay = document.querySelector('.catalog-overlay');
const catalogModalScreens = new Set(['filters', 'seller']);
const catalogScreens = new Set(['categories', 'subcategories', 'products', 'filters', 'seller']);
const catalogSheetCloseTargets = {
  filters: 'products',
  seller: 'filters',
};
const catalogPageOrder = {
  categories: 0,
  subcategories: 1,
  products: 2,
};
const catalogTransitionDuration = 220;
const catalogTransitionEasing = 'cubic-bezier(0.22, 1, 0.36, 1)';
const catalogPageHideTimers = new WeakMap();
const catalogSheetHideTimers = new WeakMap();
let catalogOverlayHideTimer = 0;
let catalogSheetLayer = 20;
let currentCatalogScreen = '';
let currentCatalogPageScreen = '';
let isCatalogInitialized = false;

function resetCatalogPageState(page) {
  page.classList.remove(
    'is-active',
    'is-entering-from-start',
    'is-entering-from-end',
    'is-exiting-to-start',
    'is-exiting-to-end'
  );
}

function clearCatalogPageHideTimer(page) {
  const hideTimer = catalogPageHideTimers.get(page);
  if (!hideTimer) return;

  window.clearTimeout(hideTimer);
  catalogPageHideTimers.delete(page);
}

function getCatalogPageDirection(fromScreen, toScreen) {
  if (!(fromScreen in catalogPageOrder) || !(toScreen in catalogPageOrder)) {
    return 'none';
  }

  if (catalogPageOrder[toScreen] > catalogPageOrder[fromScreen]) {
    return 'forward';
  }

  if (catalogPageOrder[toScreen] < catalogPageOrder[fromScreen]) {
    return 'backward';
  }

  return 'none';
}

function showCatalogPage(page, direction = 'none', immediate = false) {
  if (!page) return;

  if (!immediate && direction === 'none' && page.classList.contains('is-active') && !page.hidden) {
    return;
  }

  clearCatalogPageHideTimer(page);
  resetCatalogPageState(page);
  page.hidden = false;

  if (immediate || direction === 'none') {
    page.classList.add('is-active');
    return;
  }

  page.classList.add(direction === 'forward' ? 'is-entering-from-end' : 'is-entering-from-start');

  requestAnimationFrame(() => {
    if (!page.hidden) {
      page.classList.add('is-active');
    }
  });
}

function hideCatalogPage(page, direction = 'none', immediate = false) {
  if (!page) return;

  clearCatalogPageHideTimer(page);
  page.classList.remove('is-entering-from-start', 'is-entering-from-end');

  if (immediate || direction === 'none') {
    resetCatalogPageState(page);
    page.hidden = true;
    return;
  }

  page.classList.remove('is-active');
  page.classList.add(direction === 'forward' ? 'is-exiting-to-start' : 'is-exiting-to-end');

  const hideTimer = window.setTimeout(() => {
    if (!page.classList.contains('is-active')) {
      resetCatalogPageState(page);
      page.hidden = true;
    }
  }, catalogTransitionDuration);

  catalogPageHideTimers.set(page, hideTimer);
}

function resetCatalogSheetStyles(sheet) {
  sheet.style.transform = '';
  sheet.style.transition = '';
}

function clearCatalogSheetHideTimer(sheet) {
  const hideTimer = catalogSheetHideTimers.get(sheet);
  if (!hideTimer) return;

  window.clearTimeout(hideTimer);
  catalogSheetHideTimers.delete(sheet);
}

function showCatalogSheet(sheet, immediate = false) {
  if (!sheet) return;

  clearCatalogSheetHideTimer(sheet);
  resetCatalogSheetStyles(sheet);
  sheet.hidden = false;
  sheet.style.zIndex = String(++catalogSheetLayer);

  if (immediate) {
    sheet.classList.add('is-open');
    return;
  }

  requestAnimationFrame(() => {
    if (!sheet.hidden) {
      sheet.classList.add('is-open');
    }
  });
}

function hideCatalogSheet(sheet, immediate = false) {
  if (!sheet) return;

  clearCatalogSheetHideTimer(sheet);
  sheet.classList.remove('is-open');

  if (immediate) {
    sheet.hidden = true;
    resetCatalogSheetStyles(sheet);
    return;
  }

  const hideTimer = window.setTimeout(() => {
    if (!sheet.classList.contains('is-open')) {
      sheet.hidden = true;
      resetCatalogSheetStyles(sheet);
    }
  }, catalogTransitionDuration);

  catalogSheetHideTimers.set(sheet, hideTimer);
}

function showCatalogOverlay(immediate = false) {
  if (!catalogOverlay) return;

  window.clearTimeout(catalogOverlayHideTimer);
  catalogOverlay.hidden = false;

  if (immediate) {
    catalogOverlay.classList.add('is-open');
    return;
  }

  requestAnimationFrame(() => {
    if (!catalogOverlay.hidden) {
      catalogOverlay.classList.add('is-open');
    }
  });
}

function hideCatalogOverlay(immediate = false) {
  if (!catalogOverlay) return;

  window.clearTimeout(catalogOverlayHideTimer);
  catalogOverlay.classList.remove('is-open');

  if (immediate) {
    catalogOverlay.hidden = true;
    return;
  }

  catalogOverlayHideTimer = window.setTimeout(() => {
    if (!catalogOverlay.classList.contains('is-open')) {
      catalogOverlay.hidden = true;
    }
  }, catalogTransitionDuration);
}

function setCatalogScreen(screen, updateHash = true) {
  if (!catalogScreens.has(screen)) screen = 'categories';

  const previousScreen = currentCatalogScreen;
  const pageScreen = catalogModalScreens.has(screen) ? 'products' : screen;
  const previousPageScreen = currentCatalogPageScreen;
  const isModal = catalogModalScreens.has(screen);
  const isInitialRender = !isCatalogInitialized;
  const pageDirection = isInitialRender ? 'none' : getCatalogPageDirection(previousPageScreen, pageScreen);

  catalogPages.forEach((page) => {
    const pageName = page.dataset.catalogPage;
    const isTargetPage = pageName === pageScreen;
    const isPreviousPage = pageName === previousPageScreen;

    if (isTargetPage) {
      showCatalogPage(page, pageDirection, isInitialRender);
    } else if (isPreviousPage && pageScreen !== previousPageScreen) {
      hideCatalogPage(page, pageDirection, isInitialRender);
    } else if (pageScreen !== previousPageScreen || isInitialRender) {
      hideCatalogPage(page, 'none', true);
    }

    if (isTargetPage && !isModal && (pageScreen !== previousPageScreen || isInitialRender)) {
      page.scrollTop = 0;
    }
  });

  catalogSheets.forEach((sheet) => {
    const sheetScreen = sheet.dataset.catalogSheet;
    const isTargetSheet = sheetScreen === screen;
    const isPreviousSheet = sheetScreen === previousScreen;

    if (isTargetSheet) {
      showCatalogSheet(sheet, isInitialRender);
      return;
    }

    if (isPreviousSheet) {
      hideCatalogSheet(sheet, isInitialRender);
      return;
    }

    hideCatalogSheet(sheet, true);
  });

  if (catalogOverlay) {
    if (isModal) {
      showCatalogOverlay(isInitialRender);
    } else {
      hideCatalogOverlay(isInitialRender);
    }
  }

  catalogApp.classList.toggle('catalog-app--modal', isModal);
  catalogApp.dataset.screen = screen;
  currentCatalogScreen = screen;
  currentCatalogPageScreen = pageScreen;
  isCatalogInitialized = true;

  if (updateHash) {
    history.replaceState(null, '', `#${screen}`);
  }
}

document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-catalog-go]');
  if (!trigger) return;

  event.preventDefault();
  setCatalogScreen(trigger.dataset.catalogGo);
});

window.addEventListener('hashchange', () => {
  setCatalogScreen(window.location.hash.replace('#', ''), false);
});

catalogSheets.forEach((sheet) => {
  let startY = 0;
  let startX = 0;
  let currentY = 0;
  let dragging = false;
  let canDrag = false;

  const closeTarget = catalogSheetCloseTargets[sheet.dataset.catalogSheet];

  sheet.addEventListener(
    'touchstart',
    (event) => {
      if (!closeTarget || event.touches.length !== 1) return;

      const touch = event.touches[0];
      startY = touch.clientY;
      startX = touch.clientX;
      currentY = 0;
      dragging = false;
      canDrag = sheet.scrollTop <= 0;
      sheet.style.transition = '';
    },
    { passive: true }
  );

  sheet.addEventListener(
    'touchmove',
    (event) => {
      if (!canDrag || event.touches.length !== 1) return;

      const touch = event.touches[0];
      const deltaY = touch.clientY - startY;
      const deltaX = touch.clientX - startX;

      if (!dragging) {
        if (deltaY <= 0 || Math.abs(deltaY) <= Math.abs(deltaX)) return;
        dragging = true;
      }

      currentY = Math.max(deltaY, 0);
      sheet.style.transition = 'none';
      sheet.style.transform = `translateY(${currentY}px)`;
      event.preventDefault();
    },
    { passive: false }
  );

  sheet.addEventListener('touchend', () => {
    if (!dragging) {
      sheet.style.transition = '';
      sheet.style.transform = '';
      return;
    }

    sheet.style.transition = '';

    if (currentY > 90) {
      sheet.style.transition = `transform ${catalogTransitionDuration}ms ${catalogTransitionEasing}`;
      sheet.style.transform = 'translateY(100%)';
      window.setTimeout(() => {
        sheet.hidden = true;
        sheet.classList.remove('is-open');
        resetCatalogSheetStyles(sheet);
        setCatalogScreen(closeTarget);
      }, catalogTransitionDuration);
    } else {
      sheet.style.transform = '';
    }

    startY = 0;
    startX = 0;
    currentY = 0;
    dragging = false;
    canDrag = false;
  });

  sheet.addEventListener('touchcancel', () => {
    sheet.style.transition = '';
    sheet.style.transform = '';
    startY = 0;
    startX = 0;
    currentY = 0;
    dragging = false;
    canDrag = false;
  });
});

const catalogSellerCards = Array.from(document.querySelectorAll('.catalog-account-card'));

function syncCatalogSellerCards() {
  catalogSellerCards.forEach((card) => {
    const input = card.querySelector('.catalog-account-card__input');
    card.classList.toggle('is-selected', Boolean(input?.checked));
  });
}

catalogSellerCards.forEach((card) => {
  const input = card.querySelector('.catalog-account-card__input');

  card.addEventListener('click', () => {
    if (input) input.checked = true;
    syncCatalogSellerCards();
  });

  input?.addEventListener('change', syncCatalogSellerCards);
});

Array.from(document.querySelectorAll('.catalog-term-tabs button')).forEach((button) => {
  button.addEventListener('click', () => {
    const groupButtons = Array.from(button.closest('.catalog-term-tabs').querySelectorAll('button'));
    groupButtons.forEach((item) => item.classList.toggle('is-active', item === button));
  });
});

Array.from(document.querySelectorAll('.catalog-search')).forEach((search) => {
  const input = search.querySelector('.catalog-search__input');
  const clearButton = search.querySelector('.catalog-search__clear');
  if (!input || !clearButton) return;

  const syncSearchState = () => {
    const hasValue = Boolean((input.value || '').trim());
    search.classList.toggle('is-filled', hasValue);
    clearButton.hidden = !hasValue;
  };

  clearButton.addEventListener('click', () => {
    input.value = '';
    syncSearchState();
    input.focus();
  });

  input.addEventListener('input', syncSearchState);
  syncSearchState();
});

syncCatalogSellerCards();
setCatalogScreen(window.location.hash.replace('#', '') || 'categories', false);
