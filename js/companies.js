const cityApp = document.querySelector('.city-app');
const cityPages = Array.from(document.querySelectorAll('[data-city-page]'));
const companyPanes = Array.from(document.querySelectorAll('[data-company-pane]'));
const companyTabs = Array.from(document.querySelectorAll('.company-tabs button[data-city-go]'));
const cityActionOverlay = document.querySelector('.city-action-overlay');
const cityActionSheet = document.querySelector('[data-city-sheet="actions"]');

const cityScreens = new Set([
  'categories',
  'list',
  'map',
  'map-selected',
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

function setCityScreen(screen, updateHash = true) {
  if (!cityScreens.has(screen)) screen = 'categories';

  const isCompany = Object.prototype.hasOwnProperty.call(companyScreenMap, screen);
  const pageName = isCompany ? 'company' : screen;
  const paneName = companyScreenMap[screen];
  const isAction = screen === 'actions';

  cityPages.forEach((page) => {
    const isActive = page.dataset.cityPage === pageName;
    page.classList.toggle('is-active', isActive);
    page.toggleAttribute('hidden', !isActive);

    if (isActive && !isAction) {
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

  cityActionOverlay?.toggleAttribute('hidden', !isAction);
  cityActionSheet?.toggleAttribute('hidden', !isAction);
  cityApp?.classList.toggle('city-app--action-open', isAction);

  if (cityApp) cityApp.dataset.screen = screen;

  if (updateHash) {
    history.replaceState(null, '', `#${screen}`);
  }
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
