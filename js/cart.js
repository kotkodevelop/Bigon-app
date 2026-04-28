document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".cart-icon-btn--heart").forEach((button) => {
    button.addEventListener("click", () => {
      button.classList.toggle("is-active");
    });
  });

  document.querySelectorAll(".cart-counter").forEach((counter) => {
    const value = counter.querySelector("span");
    const buttons = counter.querySelectorAll("button");

    buttons[0]?.addEventListener("click", () => {
      const nextValue = Math.max(1, Number(value.textContent || 1) - 1);
      value.textContent = String(nextValue);
    });

    buttons[1]?.addEventListener("click", () => {
      const nextValue = Number(value.textContent || 1) + 1;
      value.textContent = String(nextValue);
    });
  });
});
