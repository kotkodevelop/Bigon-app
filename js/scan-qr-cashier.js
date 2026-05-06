const backButtons = document.querySelectorAll('[data-scan-qr-back]');

backButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.href = './home-cashier-offline.html';
  });
});

const photoInput = document.querySelector('[data-scan-qr-photo-input]');

document.querySelectorAll('[data-scan-qr-photo-open]').forEach((button) => {
  button.addEventListener('click', () => {
    if (!photoInput) return;

    photoInput.value = '';
    photoInput.click();
  });
});

const codeSheet = document.querySelector('#buyerCodeSheet');
const codePanel = codeSheet?.querySelector('.scan-qr-code-panel');
const codeInputs = Array.from(document.querySelectorAll('.scan-qr-code-input'));

const swipeCloseDuration = 220;
const swipeCloseThreshold = 90;
const swipeVelocityThreshold = 0.45;

const resetSwipeStyles = (sheet, backdrop) => {
  if (sheet) {
    sheet.style.transform = '';
    sheet.style.transition = '';
  }

  if (backdrop) {
    backdrop.style.opacity = '';
    backdrop.style.transition = '';
  }
};

const bindSwipeToClose = ({ modal, sheet, backdrop, close }) => {
  if (!modal || !sheet || typeof close !== 'function') return;

  let startX = 0;
  let startY = 0;
  let currentY = 0;
  let lastY = 0;
  let lastTime = 0;
  let velocityY = 0;
  let dragging = false;
  let canDrag = false;

  const finishSwipe = () => {
    if (!canDrag) return;

    const shouldClose = dragging && (currentY > swipeCloseThreshold || (currentY > 24 && velocityY > swipeVelocityThreshold));

    dragging = false;
    canDrag = false;

    if (shouldClose) {
      const closeDistance = Math.max(sheet.offsetHeight + 40, currentY);

      sheet.style.transition = 'transform var(--scan-transition)';
      sheet.style.transform = `translate3d(0, ${closeDistance}px, 0)`;

      if (backdrop) {
        backdrop.style.transition = 'opacity var(--scan-transition)';
        backdrop.style.opacity = '0';
      }

      close();

      window.setTimeout(() => {
        resetSwipeStyles(sheet, backdrop);
      }, swipeCloseDuration);
    } else if (currentY > 0) {
      sheet.style.transition = 'transform var(--scan-transition)';
      sheet.style.transform = 'translate3d(0, 0, 0)';

      if (backdrop) {
        backdrop.style.transition = 'opacity var(--scan-transition)';
        backdrop.style.opacity = '1';
      }

      window.setTimeout(() => {
        if (modal.classList.contains('is-open')) {
          resetSwipeStyles(sheet, backdrop);
        }
      }, swipeCloseDuration);
    }

    currentY = 0;
    velocityY = 0;
  };

  const cancelSwipe = () => {
    dragging = false;
    canDrag = false;
    currentY = 0;
    velocityY = 0;

    resetSwipeStyles(sheet, backdrop);
  };

  sheet.addEventListener(
    'touchstart',
    (event) => {
      if (!modal.classList.contains('is-open') || event.touches.length !== 1) return;
      if (event.target.closest('button, a, input, textarea, select')) return;
      if (sheet.scrollTop > 0) return;

      const touch = event.touches[0];

      startX = touch.clientX;
      startY = touch.clientY;
      currentY = 0;
      lastY = touch.clientY;
      lastTime = performance.now();
      velocityY = 0;
      dragging = false;
      canDrag = true;
      sheet.style.transition = '';

      if (backdrop) {
        backdrop.style.transition = '';
      }
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

      const now = performance.now();
      const elapsed = now - lastTime;

      if (elapsed > 0) {
        velocityY = (touch.clientY - lastY) / elapsed;
      }

      lastY = touch.clientY;
      lastTime = now;
      currentY = Math.max(0, deltaY);

      sheet.style.transition = 'none';
      sheet.style.transform = `translate3d(0, ${currentY}px, 0)`;

      if (backdrop) {
        backdrop.style.transition = 'none';
        backdrop.style.opacity = String(Math.max(0, 1 - currentY / 180));
      }

      event.preventDefault();
    },
    { passive: false }
  );

  sheet.addEventListener('touchend', finishSwipe);
  sheet.addEventListener('touchcancel', cancelSwipe);
};

const openCodeSheet = () => {
  if (!codeSheet) return;

  codeSheet.classList.add('is-open');
  codeSheet.setAttribute('aria-hidden', 'false');

  window.setTimeout(() => codeInputs[0]?.focus(), 180);
};

const closeCodeSheet = () => {
  if (!codeSheet) return;

  codeSheet.classList.remove('is-open');
  codeSheet.setAttribute('aria-hidden', 'true');
  codePanel?.classList.remove('is-error');
};

document.querySelectorAll('[data-code-sheet-open]').forEach((button) => {
  button.addEventListener('click', openCodeSheet);
});

document.querySelectorAll('[data-code-sheet-close]').forEach((button) => {
  button.addEventListener('click', closeCodeSheet);
});

bindSwipeToClose({
  modal: codeSheet,
  sheet: codePanel,
  backdrop: codeSheet?.querySelector('.scan-qr-sheet-backdrop'),
  close: closeCodeSheet,
});

codeInputs.forEach((input, index) => {
  input.addEventListener('input', () => {
    input.value = input.value.replace(/\D/g, '').slice(0, 1);
    codePanel?.classList.remove('is-error');

    if (input.value && codeInputs[index + 1]) {
      codeInputs[index + 1].focus();
    }
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Backspace' && !input.value && codeInputs[index - 1]) {
      codeInputs[index - 1].focus();
    }
  });
});

document.querySelector('[data-code-submit]')?.addEventListener('click', () => {
  codePanel?.classList.add('is-error');
});

const purchaseSheet = document.querySelector('[data-purchase-sheet]');
const purchasePanel = purchaseSheet?.querySelector('.purchase-sheet');
const purchaseScrollBody = purchaseSheet?.querySelector('.purchase-sheet__body');
const purchaseSumInput = purchaseSheet?.querySelector('[data-purchase-sum]');

const stopPurchaseBodySwipe = (event) => {
  event.stopPropagation();
};

['touchstart', 'touchmove', 'touchend', 'touchcancel'].forEach((eventName) => {
  purchaseScrollBody?.addEventListener(eventName, stopPurchaseBodySwipe, { passive: true });
});

const formatPurchaseSum = (value) => {
  const digits = value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');

  if (!digits) return '';

  return `${digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} ₽`;
};

const placeCaretBeforeCurrency = (input) => {
  const caretPosition = input.value.replace(/\s?₽$/, '').length;
  input.setSelectionRange(caretPosition, caretPosition);
};

if (purchaseSumInput) {
  const updatePurchaseSum = () => {
    purchaseSumInput.value = formatPurchaseSum(purchaseSumInput.value);
    placeCaretBeforeCurrency(purchaseSumInput);
  };

  purchaseSumInput.value = formatPurchaseSum(purchaseSumInput.value);

  purchaseSumInput.addEventListener('input', updatePurchaseSum);
  purchaseSumInput.addEventListener('focus', () => placeCaretBeforeCurrency(purchaseSumInput));
  purchaseSumInput.addEventListener('click', () => placeCaretBeforeCurrency(purchaseSumInput));
}

const closePurchaseResult = (modal) => {
  if (!modal) return;

  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
};

const closePurchaseResults = () => {
  document.querySelectorAll('[data-result-modal].is-open').forEach((modal) => {
    closePurchaseResult(modal);
  });
};

const openPurchaseSheet = () => {
  if (!purchaseSheet) return;

  purchaseSheet.classList.add('is-open');
  purchaseSheet.setAttribute('aria-hidden', 'false');

  window.setTimeout(() => purchaseSumInput?.focus(), 180);
};

const closePurchaseSheet = () => {
  if (!purchaseSheet) return;

  purchaseSheet.classList.remove('is-open');
  purchaseSheet.setAttribute('aria-hidden', 'true');

  closePurchaseResults();
};

document.querySelectorAll('[data-purchase-sheet-open]').forEach((button) => {
  button.addEventListener('click', openPurchaseSheet);
});

document.querySelectorAll('[data-purchase-sheet-close]').forEach((button) => {
  button.addEventListener('click', closePurchaseSheet);
});

bindSwipeToClose({
  modal: purchaseSheet,
  sheet: purchasePanel,
  backdrop: purchaseSheet?.querySelector('.scan-qr-sheet-backdrop'),
  close: closePurchaseSheet,
});

const purchasePercentInput = purchaseSheet?.querySelector('[data-purchase-percent-value]');
const purchasePercentButtons = Array.from(purchaseSheet?.querySelectorAll('[data-purchase-percent-grid] button') ?? []);

const formatPurchasePercent = (value) => {
  const digits = value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');

  if (!digits) return '%';

  return `${Math.min(Number(digits), 100)}%`;
};

const placeCaretBeforePercent = (input) => {
  const caretPosition = input.value.replace(/%$/, '').length;
  input.setSelectionRange(caretPosition, caretPosition);
};

const syncPurchasePercentButtons = () => {
  if (!purchasePercentInput) return;

  purchasePercentButtons.forEach((button) => {
    button.classList.toggle('is-active', button.textContent.trim() === purchasePercentInput.value);
  });
};

if (purchasePercentInput) {
  const updatePurchasePercent = () => {
    purchasePercentInput.value = formatPurchasePercent(purchasePercentInput.value);
    syncPurchasePercentButtons();
    placeCaretBeforePercent(purchasePercentInput);
  };

  purchasePercentInput.value = formatPurchasePercent(purchasePercentInput.value);
  syncPurchasePercentButtons();

  purchasePercentInput.addEventListener('input', updatePurchasePercent);
  purchasePercentInput.addEventListener('focus', () => placeCaretBeforePercent(purchasePercentInput));
  purchasePercentInput.addEventListener('click', () => placeCaretBeforePercent(purchasePercentInput));
}

purchasePercentButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (!purchasePercentInput) return;

    purchasePercentInput.value = formatPurchasePercent(button.textContent);
    syncPurchasePercentButtons();
    placeCaretBeforePercent(purchasePercentInput);
  });
});

document.querySelectorAll('[data-result-open]').forEach((button) => {
  button.addEventListener('click', () => {
    if (button.disabled) return;

    const name = button.getAttribute('data-result-open');
    const modal = document.querySelector(`[data-result-modal="${name}"]`);

    modal?.classList.add('is-open');
    modal?.setAttribute('aria-hidden', 'false');
  });
});

document.querySelectorAll('[data-result-modal]').forEach((modal) => {
  bindSwipeToClose({
    modal,
    sheet: modal.querySelector('.purchase-result__sheet'),
    backdrop: modal.querySelector('.purchase-result__backdrop'),
    close: () => closePurchaseResult(modal),
  });
});

document.querySelectorAll('[data-result-close]').forEach((button) => {
  button.addEventListener('click', () => {
    closePurchaseResult(button.closest('.purchase-result'));
  });
});