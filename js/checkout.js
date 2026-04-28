document.addEventListener("DOMContentLoaded", () => {
  const app = document.querySelector("[data-checkout-app]");
  if (!app) return;
  const modalCloseDuration = 260;
  const modalSwipeThreshold = 90;
  const modalCloseTimers = new WeakMap();

  const setScreen = (name) => {
    closeModal(null, { immediate: true });
    app.dataset.screen = name;
    app.querySelectorAll("[data-screen-panel]").forEach((screen) => {
      screen.classList.toggle("is-active", screen.dataset.screenPanel === name);
    });
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  app.querySelectorAll("[data-goto]").forEach((button) => {
    button.addEventListener("click", () => setScreen(button.dataset.goto));
  });

  app.querySelectorAll("[data-bonus-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      app.dataset.bonus = button.dataset.bonusToggle;
    });
  });

  const getModalSheet = (modal) => modal?.querySelector(".checkout-sheet");

  const clearModalTimer = (modal) => {
    const timerId = modalCloseTimers.get(modal);
    if (timerId) {
      window.clearTimeout(timerId);
      modalCloseTimers.delete(modal);
    }
  };

  const resetModalSheet = (modal) => {
    const sheet = getModalSheet(modal);
    const backdrop = modal?.querySelector(".checkout-modal__backdrop");
    if (sheet) {
      sheet.style.transform = "";
      sheet.style.transition = "";
      sheet.style.opacity = "";
    }
    if (backdrop) {
      backdrop.style.opacity = "";
      backdrop.style.transition = "";
    }
  };

  const syncBodyScroll = () => {
    const hasVisibleModal = Array.from(app.querySelectorAll("[data-modal]")).some(
      (modal) => !modal.hidden || modal.classList.contains("is-open") || modal.classList.contains("is-closing")
    );
    document.body.style.overflow = hasVisibleModal ? "hidden" : "";
  };

  const resolveModal = (target) => {
    if (!target) return null;
    if (target instanceof Element) {
      return target.matches("[data-modal]") ? target : target.closest("[data-modal]");
    }
    if (target.currentTarget instanceof Element) {
      return target.currentTarget.closest("[data-modal]");
    }
    return null;
  };

  const closeModal = (target = null, { immediate = false } = {}) => {
    const modals = target
      ? [resolveModal(target)].filter(Boolean)
      : Array.from(app.querySelectorAll("[data-modal]")).filter(
          (modal) => !modal.hidden || modal.classList.contains("is-open") || modal.classList.contains("is-closing")
        );

    modals.forEach((modal) => {
      clearModalTimer(modal);
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");

      if (immediate) {
        modal.classList.remove("is-closing");
        modal.hidden = true;
        resetModalSheet(modal);
        return;
      }

      modal.classList.add("is-closing");

      const timerId = window.setTimeout(() => {
        modal.classList.remove("is-closing");
        modal.hidden = true;
        resetModalSheet(modal);
        syncBodyScroll();
      }, modalCloseDuration);

      modalCloseTimers.set(modal, timerId);
    });

    syncBodyScroll();
  };

  const openModal = (name) => {
    const modal = app.querySelector(`[data-modal="${name}"]`);
    if (!modal) return;

    app.querySelectorAll("[data-modal]").forEach((otherModal) => {
      if (otherModal !== modal) {
        closeModal(otherModal, { immediate: true });
      }
    });

    clearModalTimer(modal);
    resetModalSheet(modal);
    modal.hidden = false;
    modal.classList.remove("is-closing");
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "false");

    requestAnimationFrame(() => {
      if (!modal.hidden) {
        modal.classList.add("is-open");
      }
    });

    syncBodyScroll();
  };

  const bindSwipeModal = (modal) => {
    const sheet = getModalSheet(modal);
    const dragHandle = modal.querySelector(".checkout-sheet__drag");
    const backdrop = modal.querySelector(".checkout-modal__backdrop");
    if (!sheet || !dragHandle || !backdrop) return;

    let startY = 0;
    let currentY = 0;
    let dragging = false;
    let pointerId = null;

    const animateBackToStart = () => {
      sheet.style.transition = "";
      backdrop.style.transition = "";
      sheet.style.transform = "translate3d(0, 0, 0)";
      backdrop.style.opacity = "1";

      window.setTimeout(() => {
        if (!modal.hidden && modal.classList.contains("is-open")) {
          resetModalSheet(modal);
        }
      }, modalCloseDuration);
    };

    const finishSwipe = () => {
      if (!dragging) return;

      dragging = false;
      sheet.style.transition = "";
      backdrop.style.transition = "";

      if (currentY > modalSwipeThreshold) {
        sheet.style.transition = `transform ${modalCloseDuration}ms cubic-bezier(0.22, 1, 0.36, 1)`;
        backdrop.style.transition = `opacity ${modalCloseDuration}ms cubic-bezier(0.22, 1, 0.36, 1)`;
        sheet.style.transform = `translate3d(0, ${Math.max(sheet.offsetHeight + 40, currentY)}px, 0)`;
        backdrop.style.opacity = "0";

        window.setTimeout(() => {
          closeModal(modal, { immediate: true });
        }, modalCloseDuration);
      } else {
        animateBackToStart();
      }

      currentY = 0;
    };

    dragHandle.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      if (modal.hidden || modal.classList.contains("is-closing")) return;

      startY = event.clientY;
      currentY = 0;
      dragging = true;
      pointerId = event.pointerId;
      dragHandle.setPointerCapture(event.pointerId);
    });

    dragHandle.addEventListener("pointermove", (event) => {
      if (!dragging || event.pointerId !== pointerId) return;

      currentY = Math.max(0, event.clientY - startY);
      sheet.style.transition = "none";
      backdrop.style.transition = "none";
      sheet.style.transform = `translate3d(0, ${currentY}px, 0)`;
      backdrop.style.opacity = String(Math.max(0, 1 - currentY / 180));
    });

    const handlePointerEnd = (event) => {
      if (pointerId !== null && dragHandle.hasPointerCapture(event.pointerId)) {
        dragHandle.releasePointerCapture(event.pointerId);
      }
      pointerId = null;
      finishSwipe();
    };

    dragHandle.addEventListener("pointerup", handlePointerEnd);
    dragHandle.addEventListener("pointercancel", handlePointerEnd);
  };

  app.querySelectorAll("[data-modal-open]").forEach((button) => {
    button.addEventListener("click", () => {
      openModal(button.dataset.modalOpen);
    });
  });

  app.querySelectorAll("[data-modal-close]").forEach((button) => {
    button.addEventListener("click", () => {
      closeModal(button);
    });
  });

  app.querySelectorAll("[data-modal]").forEach((modal) => {
    bindSwipeModal(modal);
  });

  app.querySelectorAll(".checkout-search").forEach((search) => {
    const input = search.querySelector(".checkout-search__input");
    const clearButton = search.querySelector(".checkout-search__clear");
    const field = search.querySelector(".checkout-search__field");
    if (!input || !clearButton || !field) return;

    const syncClearButton = () => {
      const hasValue = Boolean((input.value || "").trim());
      clearButton.hidden = !hasValue;
      field.classList.toggle("is-filled", hasValue);
    };

    clearButton.addEventListener("click", () => {
      input.value = "";
      syncClearButton();
      input.focus();
    });

    input.addEventListener("input", syncClearButton);
    syncClearButton();
  });

  app.querySelectorAll(".checkout-radio-row input").forEach((radio) => {
    radio.addEventListener("change", () => {
      const selected = radio.closest(".checkout-radio-row")?.querySelector("span")?.textContent?.trim();
      const field = app.querySelector('[data-modal-open="pickup"] span');
      if (selected && field) field.textContent = selected;
      window.setTimeout(() => closeModal(radio), 120);
    });
  });

  const setDeliveryTab = (name) => {
    app.querySelectorAll("[data-delivery-tab]").forEach((tab) => {
      tab.classList.toggle("is-active", tab.dataset.deliveryTab === name);
    });

    app.querySelectorAll("[data-delivery-panel]").forEach((panel) => {
      const isActive = panel.dataset.deliveryPanel === name;
      panel.hidden = !isActive;
      panel.classList.toggle("is-active", isActive);
    });
  };

  app.querySelectorAll("[data-delivery-tab]").forEach((tab) => {
    tab.addEventListener("click", () => setDeliveryTab(tab.dataset.deliveryTab));
  });

  syncBodyScroll();

  app.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
  });
});
