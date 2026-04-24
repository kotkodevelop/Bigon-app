const PRELOADER_DURATION = 1700;
const ANIMATION_DURATION = 430;
const MIN_SWIPE_DISTANCE = 48;

const preloader = document.getElementById('preloader');
const onboarding = document.getElementById('onboarding');
const slider = document.getElementById('slider');
const slides = Array.from(document.querySelectorAll('.slide'));
const dots = Array.from(document.querySelectorAll('.pagination__dot'));
const nextButton = document.getElementById('nextButton');
const finalActions = document.getElementById('finalActions');
const skipButtons = Array.from(document.querySelectorAll('[data-skip]'));

let currentSlide = 0;
let isAnimating = false;
let pointerStartX = 0;
let pointerCurrentX = 0;
let isPointerDown = false;

const updateUI = () => {
  slides.forEach((slide, index) => {
    const isActive = index === currentSlide;
    slide.classList.toggle('slide--active', isActive);
    slide.classList.remove('slide--to-left', 'slide--to-right');
    slide.setAttribute('aria-hidden', String(!isActive));
  });

  dots.forEach((dot, index) => {
    const isActive = index === currentSlide;
    dot.classList.toggle('is-active', isActive);
    dot.setAttribute('aria-current', isActive ? 'true' : 'false');
  });

  const isLast = currentSlide === slides.length - 1;
  nextButton.hidden = isLast;
  finalActions.hidden = !isLast;
};

const goToSlide = (targetIndex) => {
  if (isAnimating || targetIndex === currentSlide || targetIndex < 0 || targetIndex >= slides.length) {
    return;
  }

  isAnimating = true;
  const previousSlide = currentSlide;
  const direction = targetIndex > previousSlide ? 'forward' : 'backward';

  if (direction === 'forward') {
    slides[previousSlide].classList.add('slide--to-left');
  } else {
    slides[previousSlide].classList.add('slide--to-right');
  }

  currentSlide = targetIndex;
  updateUI();

  window.setTimeout(() => {
    slides.forEach((slide) => slide.classList.remove('slide--to-left', 'slide--to-right'));
    isAnimating = false;
  }, ANIMATION_DURATION);
};

const nextSlide = () => {
  if (currentSlide < slides.length - 1) {
    goToSlide(currentSlide + 1);
  }
};

const initPreloader = () => {
  window.setTimeout(() => {
    preloader.classList.add('is-hidden');
    preloader.classList.remove('is-active');
    onboarding.classList.add('is-visible');
  }, PRELOADER_DURATION);
};

const startSwipe = (clientX) => {
  isPointerDown = true;
  pointerStartX = clientX;
  pointerCurrentX = clientX;
};

const moveSwipe = (clientX) => {
  if (!isPointerDown) {
    return;
  }

  pointerCurrentX = clientX;
};

const endSwipe = (clientX) => {
  if (!isPointerDown) {
    return;
  }

  pointerCurrentX = clientX;
  const swipeDistance = pointerCurrentX - pointerStartX;

  isPointerDown = false;

  if (Math.abs(swipeDistance) < MIN_SWIPE_DISTANCE) {
    return;
  }

  if (swipeDistance < 0) {
    goToSlide(currentSlide + 1);
  } else {
    goToSlide(currentSlide - 1);
  }
};

nextButton.addEventListener('click', nextSlide);

skipButtons.forEach((button) => {
  button.addEventListener('click', () => goToSlide(slides.length - 1));
});

dots.forEach((dot, index) => {
  dot.addEventListener('click', () => goToSlide(index));
});

slider.addEventListener('touchstart', (event) => {
  startSwipe(event.changedTouches[0].clientX);
}, { passive: true });

slider.addEventListener('touchmove', (event) => {
  moveSwipe(event.changedTouches[0].clientX);
}, { passive: true });

slider.addEventListener('touchend', (event) => {
  endSwipe(event.changedTouches[0].clientX);
}, { passive: true });

slider.addEventListener('pointerdown', (event) => {
  if (event.pointerType === 'mouse' && event.button !== 0) {
    return;
  }

  startSwipe(event.clientX);
});

slider.addEventListener('pointermove', (event) => {
  moveSwipe(event.clientX);
});

slider.addEventListener('pointerup', (event) => {
  endSwipe(event.clientX);
});

slider.addEventListener('pointercancel', () => {
  isPointerDown = false;
});

slider.addEventListener('pointerleave', (event) => {
  if (isPointerDown && event.pointerType === 'mouse') {
    endSwipe(event.clientX);
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight') {
    nextSlide();
  }

  if (event.key === 'ArrowLeft') {
    goToSlide(currentSlide - 1);
  }
});

updateUI();
initPreloader();
