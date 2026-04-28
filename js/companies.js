const cityApp = document.querySelector('.city-app');
const cityPages = Array.from(document.querySelectorAll('[data-city-page]'));
const companyPanes = Array.from(document.querySelectorAll('[data-company-pane]'));
const companyTabs = Array.from(document.querySelectorAll('.company-tabs button[data-city-go]'));
const cityActionOverlay = document.querySelector('.city-action-overlay');
const cityActionSheet = document.querySelector('[data-city-sheet="actions"]');
const cityMapCard = document.querySelector('.city-map-card');
const ACTION_SHEET_TRANSITION_MS = 220;
const CITY_PAGE_TRANSITION_MS = 220;
let cityActionHideTimer = null;
const cityPageHideTimers = new WeakMap();
let currentCityScreen = '';
let currentCityPage = '';
let isCityInitialized = false;

const cityScreens = new Set([
  'categories',
  'list',
  'map',
  'company-catalog',
  'company-shops',
  'company-reviews',
  'company-info',
  'actions',
]);

const companyScreenMap = {
  'company-catalog': 'catalog',
  'company-shops': 'shops',
  'company-reviews': 'reviews',
  'company-info': 'info',
  actions: 'catalog',
};

const cityPageOrder = {
  categories: 0,
  list: 1,
  map: 2,
  company: 3,
};

function resetCityPageState(page) {
  page.classList.remove(
    'is-active',
    'is-entering-from-start',
    'is-entering-from-end',
    'is-exiting-to-start',
    'is-exiting-to-end'
  );
}

function clearCityPageHideTimer(page) {
  const hideTimer = cityPageHideTimers.get(page);
  if (!hideTimer) return;

  window.clearTimeout(hideTimer);
  cityPageHideTimers.delete(page);
}

function getCityPageDirection(fromPage, toPage) {
  if (!(fromPage in cityPageOrder) || !(toPage in cityPageOrder)) {
    return 'none';
  }

  if (cityPageOrder[toPage] > cityPageOrder[fromPage]) {
    return 'forward';
  }

  if (cityPageOrder[toPage] < cityPageOrder[fromPage]) {
    return 'backward';
  }

  return 'none';
}

function showCityPage(page, direction = 'none', immediate = false) {
  if (!page) return;

  if (!immediate && direction === 'none' && page.classList.contains('is-active') && !page.hidden) {
    return;
  }

  clearCityPageHideTimer(page);
  resetCityPageState(page);
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

function hideCityPage(page, direction = 'none', immediate = false) {
  if (!page) return;

  clearCityPageHideTimer(page);
  page.classList.remove('is-entering-from-start', 'is-entering-from-end');

  if (immediate || direction === 'none') {
    resetCityPageState(page);
    page.hidden = true;
    return;
  }

  page.classList.remove('is-active');
  page.classList.add(direction === 'forward' ? 'is-exiting-to-start' : 'is-exiting-to-end');

  const hideTimer = window.setTimeout(() => {
    if (!page.classList.contains('is-active')) {
      resetCityPageState(page);
      page.hidden = true;
    }
  }, CITY_PAGE_TRANSITION_MS);

  cityPageHideTimers.set(page, hideTimer);
}

function setCityScreen(screen, updateHash = true) {
  if (screen === 'map-selected') screen = 'map';
  if (!cityScreens.has(screen)) screen = 'categories';

  const previousScreen = currentCityScreen;
  const isCompany = Object.prototype.hasOwnProperty.call(companyScreenMap, screen);
  const pageName = isCompany ? 'company' : screen;
  const paneName = companyScreenMap[screen];
  const isAction = screen === 'actions';
  const previousPageName = currentCityPage;
  const isInitialRender = !isCityInitialized;
  const pageDirection = isInitialRender ? 'none' : getCityPageDirection(previousPageName, pageName);

  cityPages.forEach((page) => {
    const currentPageName = page.dataset.cityPage;
    const isTargetPage = currentPageName === pageName;
    const isPreviousPage = currentPageName === previousPageName;

    if (isTargetPage) {
      showCityPage(page, pageDirection, isInitialRender);
    } else if (isPreviousPage && pageName !== previousPageName) {
      hideCityPage(page, pageDirection, isInitialRender);
    } else if (pageName !== previousPageName || isInitialRender) {
      hideCityPage(page, 'none', true);
    }

    if (isTargetPage && !isAction && screen !== previousScreen) {
      page.scrollTop = 0;
      const scroller = page.querySelector('.company-scroll');
      if (scroller) scroller.scrollTop = 0;
    }
  });

  companyPanes.forEach((pane) => {
    pane.classList.toggle('is-active', pane.dataset.companyPane === paneName);
  });

  companyTabs.forEach((tab) => {
    tab.classList.toggle('is-active', tab.dataset.cityGo === (screen === 'actions' ? 'company-catalog' : screen));
  });

  cityMapCard?.classList.toggle('is-active', pageName === 'map');

  syncCityActionVisibility(isAction);
  cityApp?.classList.toggle('city-app--action-open', isAction);

  if (cityApp) cityApp.dataset.screen = screen;
  currentCityScreen = screen;
  currentCityPage = pageName;
  isCityInitialized = true;

  if (updateHash) {
    history.replaceState(null, '', `#${screen}`);
  }
}

function syncCityActionVisibility(isVisible) {
  if (!cityActionOverlay || !cityActionSheet) return;

  if (cityActionHideTimer) {
    window.clearTimeout(cityActionHideTimer);
    cityActionHideTimer = null;
  }

  if (isVisible) {
    cityActionOverlay.classList.remove('is-visible');
    cityActionSheet.classList.remove('is-visible');
    cityActionOverlay.hidden = false;
    cityActionSheet.hidden = false;

    void cityActionOverlay.offsetWidth;
    void cityActionSheet.offsetWidth;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        cityActionOverlay.classList.add('is-visible');
        cityActionSheet.classList.add('is-visible');
      });
    });

    return;
  }

  cityActionOverlay.classList.remove('is-visible');
  cityActionSheet.classList.remove('is-visible');

  cityActionHideTimer = window.setTimeout(() => {
    cityActionOverlay.hidden = true;
    cityActionSheet.hidden = true;
    cityActionHideTimer = null;
  }, ACTION_SHEET_TRANSITION_MS);
}

document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-city-go]');
  if (!trigger) return;

  event.preventDefault();
  setCityScreen(trigger.dataset.cityGo);
});

[
  {
    selector: '.city-search',
    inputSelector: '.city-search__input',
    clearSelector: '.city-search__clear',
  },
  {
    selector: '.company-filter-search',
    inputSelector: '.company-filter-search__input',
    clearSelector: '.company-filter-search__clear',
  },
].forEach(({ selector, inputSelector, clearSelector }) => {
  Array.from(document.querySelectorAll(selector)).forEach((search) => {
    const input = search.querySelector(inputSelector);
    const clearButton = search.querySelector(clearSelector);
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
});

window.addEventListener('hashchange', () => {
  setCityScreen(window.location.hash.replace('#', ''), false);
});

setCityScreen(window.location.hash.replace('#', '') || 'categories', false);
