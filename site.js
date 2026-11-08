const header = document.querySelector('#site-header');
const toggle = document.querySelector('#menu-toggle');
const nav = document.querySelector('#main-nav');

const backgroundAudio = document.querySelector('#background-audio');
const soundToggle = document.querySelector('#sound-toggle');
const soundLabel = soundToggle?.querySelector('.sound-toggle__label');
const soundStatus = document.querySelector('#sound-status');

if (backgroundAudio instanceof HTMLAudioElement && soundToggle && soundLabel && soundStatus) {
  backgroundAudio.volume = 0.35;
  let playRequested = false;

  const updateSoundToggle = isPlaying => {
    soundToggle.setAttribute('aria-pressed', String(isPlaying));
    soundToggle.setAttribute(
      'aria-label',
      isPlaying ? 'Turn background sound off' : 'Turn background sound on',
    );
    soundLabel.textContent = isPlaying ? 'Sound on' : 'Sound off';
  };

  soundToggle.addEventListener('click', async () => {
    if (!backgroundAudio.paused || playRequested) {
      playRequested = false;
      updateSoundToggle(false);
      backgroundAudio.pause();
      soundStatus.textContent = '';
      return;
    }

    playRequested = true;
    updateSoundToggle(true);
    soundStatus.textContent = '';

    try {
      await backgroundAudio.play();
    } catch (error) {
      if (!playRequested) {
        return;
      }

      playRequested = false;
      updateSoundToggle(false);
      soundStatus.textContent = 'Background sound could not be played. Please try again.';
      console.error('Background sound playback failed.', error);
    }
  });

  backgroundAudio.addEventListener('play', () => {
    playRequested = true;
    updateSoundToggle(true);
  });
  backgroundAudio.addEventListener('pause', () => {
    playRequested = false;
    updateSoundToggle(false);
  });
}

if (header && toggle && nav) {
  const isMenuOpen = () => toggle.getAttribute('aria-expanded') === 'true';

  const closeMenu = ({ restoreFocus = false } = {}) => {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
    nav.classList.remove('is-open');
    header.classList.remove('menu-open');

    if (restoreFocus) {
      toggle.focus();
    }
  };

  const updateHeader = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  };

  toggle.addEventListener('click', () => {
    if (isMenuOpen()) {
      closeMenu();
      return;
    }

    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close navigation');
    nav.classList.add('is-open');
    header.classList.add('menu-open');
  });

  nav.addEventListener('click', event => {
    if (event.target instanceof Element && event.target.closest('a')) {
      closeMenu();
    }
  });

  document.addEventListener('click', event => {
    if (isMenuOpen() && event.target instanceof Node && !header.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && isMenuOpen()) {
      closeMenu({ restoreFocus: true });
    }
  });

  const desktopViewport = window.matchMedia('(min-width: 961px)');
  desktopViewport.addEventListener('change', event => {
    if (event.matches) {
      closeMenu();
    }
  });

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reducedMotion && 'IntersectionObserver' in window) {
  const revealTargets = document.querySelectorAll(
    '.story-card, .team-principle, .team-profile-card, .comfort-list li, .booking-step, .faq-list details, .philosophy-image-wrap, .director-portrait, .setting-copy',
  );

  if (revealTargets.length > 0) {
    const revealObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -40px 0px', threshold: 0.12 },
    );

    revealTargets.forEach(target => {
      target.setAttribute('data-reveal', '');
      revealObserver.observe(target);
    });

    document.documentElement.classList.add('motion-ready');
  }
}
