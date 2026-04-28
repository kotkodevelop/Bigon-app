document.querySelectorAll('[data-scan-back]').forEach((button) => {
  button.addEventListener('click', () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.href = './home.html';
  });
});
