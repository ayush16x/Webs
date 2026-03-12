/* ======== CUSTOM CURSOR ======== */
const dot = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');
let ringX = 0, ringY = 0, dotX = 0, dotY = 0;
document.addEventListener('mousemove', e => {
  dotX = e.clientX; dotY = e.clientY;
  dot.style.left = dotX + 'px'; dot.style.top = dotY + 'px';
});
function animRing() {
  ringX += (dotX - ringX) * 0.18;
  ringY += (dotY - ringY) * 0.18;
  ring.style.left = ringX + 'px'; ring.style.top = ringY + 'px';
  requestAnimationFrame(animRing);
}
animRing();

/* ======== TOP BANNER CLOSE ======== */
const bannerClose = document.getElementById('closeBanner');
const banner = document.getElementById('topBanner');
if (bannerClose) {
  bannerClose.addEventListener('click', () => {
    banner.style.maxHeight = banner.offsetHeight + 'px';
    banner.style.transition = 'max-height 0.35s ease, padding 0.35s ease, opacity 0.35s ease';
    requestAnimationFrame(() => {
      banner.style.maxHeight = '0';
      banner.style.padding = '0';
      banner.style.opacity = '0';
      banner.style.overflow = 'hidden';
    });
    // Adjust nav top offset
    setTimeout(() => { banner.remove(); }, 360);
  });
}

/* ======== NAV SCROLL ======== */
const nav = document.getElementById('nav');
const backTop = document.getElementById('backTop');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
  backTop.classList.toggle('visible', window.scrollY > 400);
}, { passive: true });
backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ======== MOBILE MENU ======== */
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
let menuOpen = false;
burger.addEventListener('click', () => {
  menuOpen = !menuOpen;
  mobileMenu.classList.toggle('open', menuOpen);
  const spans = burger.querySelectorAll('span');
  if (menuOpen) {
    spans[0].style.transform = 'rotate(45deg) translate(5px,5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
  } else {
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }
});
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  menuOpen = false;
  mobileMenu.classList.remove('open');
  burger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
}));

/* ======== SCROLL REVEAL ======== */
const revealEls = document.querySelectorAll('.reveal-up, .reveal-fade, .reveal-left, .reveal-right');
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); } });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
revealEls.forEach(el => revealObs.observe(el));

/* ======== COUNTERS ======== */
function countUp(el, target) {
  const dur = 2000, start = performance.now();
  const fmt = n => n >= 10000 ? Math.floor(n/1000) + 'k' : n >= 1000 ? (n/1000).toFixed(1).replace('.0','') + 'k' : n;
  const step = now => {
    const p = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    const cur = Math.floor(ease * target);
    el.textContent = fmt(cur);
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = fmt(target);
  };
  requestAnimationFrame(step);
}
const statEls = document.querySelectorAll('[data-target]');
let counted = false;
const statsObs = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting && !counted) {
    counted = true;
    statEls.forEach(el => countUp(el, parseInt(el.dataset.target)));
  }
}, { threshold: 0.5 });
const statsContainer = document.querySelector('.stats-strip');
if (statsContainer) statsObs.observe(statsContainer);

/* ======== TESTIMONIAL SLIDER ======== */
const track = document.getElementById('testiTrack');
const cards = track ? track.querySelectorAll('.testi-card') : [];
const dotsWrap = document.getElementById('tnDots');
const prevBtn = document.getElementById('tPrev');
const nextBtn = document.getElementById('tNext');
let cur = 0;
let spv = window.innerWidth < 768 ? 1 : 3;
let maxI = Math.max(0, cards.length - spv);

function buildTDots() {
  if (!dotsWrap) return;
  dotsWrap.innerHTML = '';
  for (let i = 0; i <= maxI; i++) {
    const d = document.createElement('div');
    d.className = 'tn-dot' + (i === cur ? ' active' : '');
    d.addEventListener('click', () => slide(i));
    dotsWrap.appendChild(d);
  }
}
function slide(idx) {
  cur = Math.max(0, Math.min(idx, maxI));
  if (!track || !cards[0]) return;
  const gap = 20;
  const w = cards[0].getBoundingClientRect().width + gap;
  track.style.transform = `translateX(-${cur * w}px)`;
  dotsWrap?.querySelectorAll('.tn-dot').forEach((d, i) => d.classList.toggle('active', i === cur));
}
if (prevBtn) prevBtn.addEventListener('click', () => slide(cur - 1));
if (nextBtn) nextBtn.addEventListener('click', () => slide(cur + 1));
buildTDots();
let autoT = setInterval(() => slide(cur >= maxI ? 0 : cur + 1), 4800);
if (track) {
  track.addEventListener('mouseenter', () => clearInterval(autoT));
  track.addEventListener('mouseleave', () => { autoT = setInterval(() => slide(cur >= maxI ? 0 : cur + 1), 4800); });
}
window.addEventListener('resize', () => {
  const nspv = window.innerWidth < 768 ? 1 : 3;
  if (nspv !== spv) { spv = nspv; maxI = Math.max(0, cards.length - spv); buildTDots(); slide(0); }
});

/* ======== TRAINING TABS ======== */
const ttabs = document.querySelectorAll('.ttab');
const trainCards = document.querySelectorAll('.train-card[data-cat]');
ttabs.forEach(tab => {
  tab.addEventListener('click', () => {
    ttabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const cat = tab.dataset.tab;
    trainCards.forEach(card => {
      if (cat === 'all' || card.dataset.cat === cat) {
        card.style.display = '';
        setTimeout(() => { card.style.opacity = '1'; card.style.transform = ''; }, 10);
      } else {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        setTimeout(() => { card.style.display = 'none'; }, 200);
      }
    });
  });
});

/* ======== FILTER PILLS ======== */
const pills = document.querySelectorAll('.filter-pill');
pills.forEach(p => {
  p.addEventListener('click', () => {
    pills.forEach(x => x.classList.remove('active'));
    p.classList.add('active');
  });
});

/* ======== SMOOTH SCROLL ======== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) {
      e.preventDefault();
      const offset = 72;
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
    }
  });
});

/* ======== CONTACT FORM ======== */
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type=submit]');
    const orig = btn.innerHTML;
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg> Request Submitted!`;
    btn.style.background = 'linear-gradient(135deg,#0ea572,#0a7a54)';
    btn.disabled = true;
    setTimeout(() => {
      btn.innerHTML = orig;
      btn.style.background = '';
      btn.disabled = false;
      form.reset();
    }, 3500);
  });
}

/* ======== PARALLAX HERO SHAPES ======== */
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  document.querySelector('.hero-shape-1')?.style?.setProperty('transform', `translateY(${y * 0.12}px)`);
  document.querySelector('.hero-shape-2')?.style?.setProperty('transform', `translateY(${y * 0.08}px)`);
}, { passive: true });

/* ======== PROGRESS BAR ANIMATE ======== */
const progFill = document.querySelector('.hcp-fill');
if (progFill) {
  const po = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      progFill.style.width = '94%';
      po.disconnect();
    }
  }, { threshold: 0.5 });
  progFill.style.width = '0';
  progFill.style.transition = 'width 1.5s cubic-bezier(0.4,0,0.2,1) 0.5s';
  const hero = document.querySelector('.hero');
  if (hero) po.observe(hero);
}

/* ======== NAV TOP OFFSET (account for banner) ======== */
function updateNavTop() {
  const b = document.getElementById('topBanner');
  if (b && nav) nav.style.top = b.offsetHeight + 'px';
}
updateNavTop();
window.addEventListener('resize', updateNavTop);
