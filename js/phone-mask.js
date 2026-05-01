(function () {
  const phonePlaceholder = '+7 (___) ___-__-__';
  const phoneMaskOptions = {
    mask: '+{7} (000) 000-00-00',
  };
  const phoneInputSelector = 'input[type="tel"], input[data-phone-mask]';
  const maskedInputs = new WeakMap();

  const getPhoneInputs = (root = document) =>
    Array.from(root.querySelectorAll(phoneInputSelector));

  const getPhoneDigits = (value) => {
    const digits = String(value || '').replace(/\D/g, '');

    if (!digits) {
      return '';
    }

    if (digits.length > 10 && (digits[0] === '7' || digits[0] === '8')) {
      return digits.slice(1, 11);
    }

    return digits.slice(0, 10);
  };

  const formatPhoneValue = (value) => {
    const digits = getPhoneDigits(value);

    if (!digits) {
      return '';
    }

    const area = digits.slice(0, 3);
    const prefix = digits.slice(3, 6);
    const firstPair = digits.slice(6, 8);
    const secondPair = digits.slice(8, 10);
    let formatted = '+7';

    if (area) {
      formatted += ` (${area}`;
    }

    if (area.length === 3) {
      formatted += ')';
    }

    if (prefix) {
      formatted += ` ${prefix}`;
    }

    if (firstPair) {
      formatted += `-${firstPair}`;
    }

    if (secondPair) {
      formatted += `-${secondPair}`;
    }

    return formatted;
  };

  const bindNativePhoneMask = (input) => {
    const updateValue = () => {
      input.value = formatPhoneValue(input.value);

      if (document.activeElement === input) {
        const position = input.value.length;
        input.setSelectionRange(position, position);
      }
    };

    input.addEventListener('input', updateValue);
    input.addEventListener('blur', updateValue);
    updateValue();

    return { updateValue };
  };

  const bindPhoneMask = (input) => {
    input.placeholder = phonePlaceholder;
    input.inputMode = 'tel';

    if (!input.autocomplete) {
      input.autocomplete = 'tel';
    }

    if (maskedInputs.has(input)) {
      return;
    }

    if (window.IMask) {
      maskedInputs.set(input, window.IMask(input, phoneMaskOptions));
      return;
    }

    maskedInputs.set(input, bindNativePhoneMask(input));
  };

  const initPhoneMasks = (root = document) => {
    getPhoneInputs(root).forEach(bindPhoneMask);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initPhoneMasks());
  } else {
    initPhoneMasks();
  }

  new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) {
          return;
        }

        if (node.matches(phoneInputSelector)) {
          bindPhoneMask(node);
          return;
        }

        initPhoneMasks(node);
      });
    });
  }).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();
