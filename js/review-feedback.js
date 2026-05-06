(function () {
  const app = document.querySelector('.review-shell');
  if (!app) return;

  const scoreDetails = {
    1: { text: 'Ужасно', color: '#EB001B' },
    2: { text: 'Плохо', color: '#EB001B' },
    3: { text: 'Слабо', color: '#EB001B' },
    4: { text: 'Неудовлетворительно', color: '#EB001B' },
    5: { text: 'Средне', color: '#FAB718' },
    6: { text: 'Выше среднего', color: '#FAB718' },
    7: { text: 'Очень хорошо', color: '#53B374' },
    8: { text: 'Отлично', color: '#53B374' },
    9: { text: 'Превосходно', color: '#53B374' },
    10: { text: 'Великолепно', color: '#53B374' },
  };

  const clampScore = (value, max) => Math.min(max, Math.max(1, Number(value) || 1));
  const getScoreDetails = (value) => scoreDetails[value] || scoreDetails[10];

  const initReviewScores = () => {
    app.querySelectorAll('.review-score').forEach((scoreBlock) => {
      const scoreText = scoreBlock.querySelector('.review-score__text');
      const starsList = scoreBlock.querySelector('.review-stars');
      const stars = Array.from(scoreBlock.querySelectorAll('.review-star'));
      if (!scoreText || !starsList || !stars.length) return;

      const valueText = scoreText.querySelector('span:first-child');
      const labelText = scoreText.querySelector('span:last-child');
      if (!valueText || !labelText) return;

      const currentValue = parseInt(valueText?.textContent, 10);
      const currentActiveStars = stars.filter((star) => !star.classList.contains('is-muted')).length;
      const maxScore = stars.length;

      starsList.setAttribute('role', 'radiogroup');

      const setScore = (value) => {
        const rating = clampScore(value, maxScore);
        const details = getScoreDetails(rating);

        scoreBlock.dataset.reviewScore = String(rating);
        scoreBlock.style.setProperty('--review-score-color', details.color);
        valueText.textContent = rating;
        labelText.textContent = details.text;
        starsList.setAttribute('aria-label', `Рейтинг ${rating} из ${maxScore}`);

        stars.forEach((star, index) => {
          const starValue = index + 1;
          const isSelected = starValue === rating;

          star.classList.toggle('is-muted', starValue > rating);
          star.setAttribute('aria-checked', String(isSelected));
          star.setAttribute('tabindex', isSelected ? '0' : '-1');
        });
      };

      stars.forEach((star, index) => {
        const starValue = index + 1;

        star.setAttribute('role', 'radio');
        star.setAttribute('aria-label', `${starValue} из ${maxScore}: ${getScoreDetails(starValue).text}`);

        star.addEventListener('click', () => {
          setScore(starValue);
        });

        star.addEventListener('keydown', (event) => {
          const currentScore = Number(scoreBlock.dataset.reviewScore) || 1;
          let nextScore = null;

          if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
            nextScore = currentScore + 1;
          } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
            nextScore = currentScore - 1;
          } else if (event.key === 'Home') {
            nextScore = 1;
          } else if (event.key === 'End') {
            nextScore = maxScore;
          } else if (event.key === 'Enter' || event.key === ' ') {
            nextScore = starValue;
          }

          if (nextScore === null) return;

          event.preventDefault();
          const rating = clampScore(nextScore, maxScore);
          setScore(rating);
          stars[rating - 1].focus();
        });
      });

      setScore(currentValue || currentActiveStars || 1);
    });
  };

  initReviewScores();

  const submitButton = app.querySelector('[data-review-submit]');
  const successModal = app.querySelector('[data-review-success-modal]');
  if (!submitButton || !successModal) return;

  const closeButtons = successModal.querySelectorAll('[data-review-modal-close]');
  let closeTimer = null;
  let openFrame = null;

  const openSuccessModal = () => {
    window.clearTimeout(closeTimer);
    window.cancelAnimationFrame(openFrame);
    app.classList.add('review-page--modal');
    successModal.hidden = false;
    successModal.setAttribute('aria-hidden', 'false');
    openFrame = window.requestAnimationFrame(() => {
      successModal.classList.add('is-open');
    });
  };

  const closeSuccessModal = () => {
    if (successModal.hidden) return;

    window.cancelAnimationFrame(openFrame);
    app.classList.remove('review-page--modal');
    successModal.classList.remove('is-open');
    successModal.setAttribute('aria-hidden', 'true');
    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(() => {
      successModal.hidden = true;
    }, 180);
  };

  submitButton.addEventListener('click', openSuccessModal);

  closeButtons.forEach((button) => {
    button.addEventListener('click', closeSuccessModal);
  });

  app.addEventListener('click', (event) => {
    if (event.target === app && !successModal.hidden) {
      closeSuccessModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !successModal.hidden) {
      closeSuccessModal();
    }
  });
})();
