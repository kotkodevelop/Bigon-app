(() => {
  const app = document.querySelector('[data-add-app]');
  if (!app) return;

  const screens = Array.from(app.querySelectorAll('[data-step]'));
  const goButtons = Array.from(app.querySelectorAll('[data-go-step]'));
  const backButtons = Array.from(app.querySelectorAll('[data-back-step]'));
  const osModal = app.querySelector('[data-os-modal]');
  const openOsButtons = Array.from(app.querySelectorAll('[data-open-os]'));
  const closeOsButtons = Array.from(app.querySelectorAll('[data-close-os]'));
  const history = ['catalog'];
  let current = 'catalog';
  let closeTimer = null;

  const setScreen = (name, push = true) => {
    const next = screens.find((screen) => screen.dataset.step === name);
    const active = screens.find((screen) => screen.classList.contains('is-active'));
    if (!next || next === active) return;

    screens.forEach((screen) => {
      screen.classList.toggle('is-to-left', screen === active);
      screen.classList.remove('is-active');
      screen.setAttribute('aria-hidden', 'true');
    });

    next.classList.add('is-active');
    next.setAttribute('aria-hidden', 'false');
    next.scrollTop = 0;
    current = name;

    if (push && history[history.length - 1] !== name) {
      history.push(name);
    }
  };

  goButtons.forEach((button) => {
    button.addEventListener('click', () => setScreen(button.dataset.goStep));
  });

  backButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (history.length <= 1) {
        setScreen('catalog', false);
        return;
      }
      history.pop();
      setScreen(history[history.length - 1], false);
    });
  });

  app.querySelectorAll('[data-price-toggle]').forEach((toggle) => {
    toggle.addEventListener('change', () => {
      setScreen(toggle.checked ? 'price-fixed' : 'price-from');
    });
  });

  const deliveryTriggers = [
    ...app.querySelectorAll('[data-delivery-pickup]'),
    ...app.querySelectorAll('[data-delivery-pvz]'),
  ];

  deliveryTriggers.forEach((input) => {
    input.addEventListener('change', () => {
      if (input.dataset.deliveryPickup !== undefined && input.checked) {
        setScreen('extra-store');
        return;
      }
      if (input.dataset.deliveryPvz !== undefined && input.checked) {
        setScreen('extra-delivery');
      }
    });
  });

  const openOs = () => {
    if (!osModal) return;
    clearTimeout(closeTimer);
    osModal.hidden = false;
    requestAnimationFrame(() => osModal.classList.add('is-open'));
  };

  const closeOs = () => {
    if (!osModal) return;
    osModal.classList.remove('is-open');
    closeTimer = window.setTimeout(() => {
      osModal.hidden = true;
    }, 230);
  };

  openOsButtons.forEach((button) => button.addEventListener('click', openOs));
  closeOsButtons.forEach((button) => button.addEventListener('click', closeOs));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeOs();
  });
})();
