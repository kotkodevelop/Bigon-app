document.querySelectorAll('[data-scan-back]').forEach((button) => {
  button.addEventListener('click', () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.href = './home.html';
  });
});

const photoInput = document.querySelector('[data-scan-check-photo-input]');
document.querySelectorAll('[data-scan-check-photo-open]').forEach((button) => {
  button.addEventListener('click', () => {
    if (!photoInput) return;
    photoInput.value = '';
    photoInput.click();
  });
});
