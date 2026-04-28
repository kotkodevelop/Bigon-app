const catalogApp = document.querySelector('.catalog-app');
const catalogPages = Array.from(document.querySelectorAll('[data-catalog-page]'));
const catalogSheets = Array.from(document.querySelectorAll('[data-catalog-sheet]'));
const catalogOverlay = document.querySelector('.catalog-overlay');
const catalogModalScreens = new Set(['filters', 'seller']);
const catalogScreens = new Set(['categories', 'subcategories', 'products', 'filters', 'seller']);

function setCatalogScreen(screen, updateHash = true) {
  if (!catalogScreens.has(screen)) screen = 'categories';

  const pageScreen = catalogModalScreens.has(screen) ? 'products' : screen;
  const isModal = catalogModalScreens.has(screen);

  catalogPages.forEach((page) => {
    const isActive = page.dataset.catalogPage === pageScreen;
    page.classList.toggle('is-active', isActive);
    page.toggleAttribute('hidden', !isActive);

    if (isActive && !isModal) {
      page.scrollTop = 0;
    }
  });

  catalogSheets.forEach((sheet) => {
    const isActive = sheet.dataset.catalogSheet === screen;
    sheet.toggleAttribute('hidden', !isActive);
  });

  if (catalogOverlay) {
    catalogOverlay.toggleAttribute('hidden', !isModal);
  }

  catalogApp.classList.toggle('catalog-app--modal', isModal);
  catalogApp.dataset.screen = screen;

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

Array.from(document.querySelectorAll('.catalog-radio-row')).forEach((row) => {
  row.addEventListener('click', () => {
    const input = row.querySelector('input[type="radio"]');
    if (input) input.checked = true;
  });
});

Array.from(document.querySelectorAll('.catalog-term-tabs button')).forEach((button) => {
  button.addEventListener('click', () => {
    const groupButtons = Array.from(button.closest('.catalog-term-tabs').querySelectorAll('button'));
    groupButtons.forEach((item) => item.classList.toggle('is-active', item === button));
  });
});

setCatalogScreen(window.location.hash.replace('#', '') || 'categories', false);
