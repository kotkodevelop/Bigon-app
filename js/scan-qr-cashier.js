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
const purchaseSumInput = purchaseSheet?.querySelector('[data-purchase-sum]');

const closePurchaseResults = () => {
  document.querySelectorAll('[data-result-modal].is-open').forEach((modal) => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
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

const percentValue = document.querySelector('[data-purchase-percent-value]');
document.querySelectorAll('[data-purchase-percent-grid] button').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-purchase-percent-grid] button').forEach((item) => item.classList.remove('is-active'));
    button.classList.add('is-active');
    if (percentValue) percentValue.textContent = button.textContent.trim();
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

document.querySelectorAll('[data-result-close]').forEach((button) => {
  button.addEventListener('click', () => {
    const modal = button.closest('.purchase-result');
    modal?.classList.remove('is-open');
    modal?.setAttribute('aria-hidden', 'true');
  });
});
