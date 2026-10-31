const progress = document.querySelector('.reading-progress');
let ticking = false;

function updateProgress() {
  const available = document.documentElement.scrollHeight - window.innerHeight;
  const percent = available > 0 ? (window.scrollY / available) * 100 : 0;
  progress.style.width = `${Math.min(100, Math.max(0, percent))}%`;
  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(updateProgress);
    ticking = true;
  }
}, { passive: true });
window.addEventListener('resize', updateProgress);
updateProgress();


document.querySelectorAll('[data-flip-card]').forEach(card => {
  const front = card.querySelector('.flip-front');
  const back = card.querySelector('.flip-back');
  const open = card.querySelector('.flip-trigger');
  const close = card.querySelector('.flip-return');

  function flip(showFact) {
    card.classList.toggle('is-flipped', showFact);
    open.setAttribute('aria-expanded', String(showFact));
    front.inert = showFact;
    back.inert = !showFact;
    (showFact ? close : open).focus();
  }

  open.addEventListener('click', () => flip(true));
  close.addEventListener('click', () => flip(false));
  card.addEventListener('keydown', event => {
    if (event.key === 'Escape' && card.classList.contains('is-flipped')) flip(false);
  });
});

const tabs = [...document.querySelectorAll('.section-tabs a[href^="#"]')];
if (tabs.length) {
  const sections = tabs.map(tab => document.querySelector(tab.getAttribute('href'))).filter(Boolean);
  let tabTicking = false;
  let pendingHash = '';
  let pendingTimer;

  function setActiveTab(hash) {
    tabs.forEach(tab => {
      const active = tab.getAttribute('href') === hash;
      tab.classList.toggle('is-active', active);
      if (active) tab.setAttribute('aria-current', 'location');
      else tab.removeAttribute('aria-current');
    });
  }

  function updateActiveFromScroll() {
    const headerHeight = document.querySelector('.site-header')?.getBoundingClientRect().height || 0;
    const marker = headerHeight + Math.min(window.innerHeight * 0.25, 180);

    if (pendingHash) {
      const target = document.querySelector(pendingHash);
      const bounds = target?.getBoundingClientRect();
      if (bounds && (bounds.top > marker || bounds.bottom <= marker)) {
        setActiveTab(pendingHash);
        tabTicking = false;
        return;
      }
      pendingHash = '';
      window.clearTimeout(pendingTimer);
    }

    let current = '';
    sections.forEach(section => {
      if (section.getBoundingClientRect().top <= marker) current = `#${section.id}`;
    });
    setActiveTab(current);
    tabTicking = false;
  }

  function scheduleTabUpdate() {
    if (tabTicking) return;
    tabTicking = true;
    window.requestAnimationFrame(updateActiveFromScroll);
  }

  setActiveTab(window.location.hash);
  tabs.forEach(tab => tab.addEventListener('click', () => {
    pendingHash = tab.getAttribute('href');
    setActiveTab(pendingHash);
    window.clearTimeout(pendingTimer);
    pendingTimer = window.setTimeout(() => {
      pendingHash = '';
      scheduleTabUpdate();
    }, 1800);
  }));
  const cancelPending = () => { pendingHash = ''; window.clearTimeout(pendingTimer); };
  window.addEventListener('wheel', cancelPending, { passive: true });
  window.addEventListener('touchstart', cancelPending, { passive: true });
  window.addEventListener('keydown', event => {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) cancelPending();
  });
  window.addEventListener('hashchange', scheduleTabUpdate);
  window.addEventListener('scroll', scheduleTabUpdate, { passive: true });
  window.addEventListener('resize', scheduleTabUpdate);
  window.addEventListener('load', scheduleTabUpdate);
}

// Reveal content as it enters the viewport. Without JavaScript, it stays visible.
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealItems = document.querySelectorAll([
    '.section-index',
    '.section h2',
    '.section-lead > p:not(.tag)',
    '.flow-step',
    '.two-notes > p',
    '.check-loop',
    '.benefit-list > div',
    '.benefit-visual > span',
    '.flip-card',
    '.future-layout blockquote',
    '.future-visual > span',
    '.about-section-heading',
    '.process-copy > p',
    '.source-grid > a'
  ].join(', '));

  revealItems.forEach(item => item.classList.add('reveal-item'));
  document.documentElement.classList.add('has-reveal');

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });

  revealItems.forEach(item => revealObserver.observe(item));
}
