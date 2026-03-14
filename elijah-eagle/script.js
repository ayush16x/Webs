// =============================================
//  ELIJAH-EAGLE COACHING — Interactions
// =============================================

// --- Scroll Reveal ---
const revealEls = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const siblings = [...entry.target.parentElement.querySelectorAll('.reveal')];
        const idx = siblings.indexOf(entry.target);
        entry.target.style.transitionDelay = `${idx * 80}ms`;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);
revealEls.forEach((el) => observer.observe(el));


// =============================================
//  VIDEO PLAYER CONTROLS
// =============================================

const vid      = document.getElementById('hero-vid');
const playBtn  = document.getElementById('vc-play');
const playIcon = document.getElementById('vc-play-icon');
const seekBar  = document.getElementById('vc-seek');
const timeDsp  = document.getElementById('vc-time');
const muteBtn  = document.getElementById('vc-mute');
const muteIcon = document.getElementById('vc-mute-icon');

const SVG_PAUSE = `
  <rect x="2" y="2" width="4" height="12" rx="1"/>
  <rect x="10" y="2" width="4" height="12" rx="1"/>`;

const SVG_PLAY = `
  <polygon points="4 2 14 8 4 14 4 2"/>`;

const SVG_MUTED = `
  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
  <line x1="23" y1="9" x2="17" y2="15" stroke="currentColor" stroke-width="2"/>
  <line x1="17" y1="9" x2="23" y2="15" stroke="currentColor" stroke-width="2"/>`;

const SVG_UNMUTED = `
  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"
        stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>`;

function formatTime(s) {
  if (!s || isNaN(s)) return '0:00';
  const m   = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

// Play / Pause toggle
if (playBtn && vid) {
  playBtn.addEventListener('click', () => {
    if (vid.paused) { vid.play(); } else { vid.pause(); }
  });

  vid.addEventListener('play', () => {
    playIcon.innerHTML = SVG_PAUSE;
  });
  vid.addEventListener('pause', () => {
    playIcon.innerHTML = SVG_PLAY;
  });

  // Sync initial state (video autoplays)
  vid.addEventListener('canplay', () => {
    if (!vid.paused) playIcon.innerHTML = SVG_PAUSE;
    timeDsp.textContent = `0:00 / ${formatTime(vid.duration)}`;
  });
}

// Seek bar — update fill + time
if (seekBar && vid) {
  vid.addEventListener('timeupdate', () => {
    if (!vid.duration) return;
    const pct = (vid.currentTime / vid.duration) * 100;
    seekBar.value = pct;
    seekBar.style.setProperty('--seek-fill', pct.toFixed(2) + '%');
    timeDsp.textContent = `${formatTime(vid.currentTime)} / ${formatTime(vid.duration)}`;
  });

  seekBar.addEventListener('input', () => {
    if (!vid.duration) return;
    vid.currentTime = (seekBar.value / 100) * vid.duration;
  });
}

// Mute / Unmute
if (muteBtn && vid) {
  muteBtn.addEventListener('click', () => {
    vid.muted = !vid.muted;
    muteIcon.innerHTML = vid.muted ? SVG_MUTED : SVG_UNMUTED;
  });
}

// Fullscreen (mobile)
const fsBtn  = document.getElementById('vc-fullscreen');
const fsIcon = document.getElementById('vc-fs-icon');

const SVG_FS_ENTER = `<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>`;
const SVG_FS_EXIT  = `<polyline points="4 14 10 14 10 20"/><polyline points="20 4 14 4 14 10"/><line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/>`;

if (fsBtn && vid) {
  fsBtn.addEventListener('click', () => {
    const el = videoWrap || vid;
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      // Enter fullscreen — prefer the video element on iOS (webkitEnterFullscreen)
      if (vid.webkitEnterFullscreen) {
        vid.webkitEnterFullscreen();
      } else if (el.requestFullscreen) {
        el.requestFullscreen();
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
  });

  // Swap icon when fullscreen state changes
  function onFsChange() {
    const active = !!(document.fullscreenElement || document.webkitFullscreenElement);
    fsIcon.innerHTML = active ? SVG_FS_EXIT : SVG_FS_ENTER;
  }
  document.addEventListener('fullscreenchange', onFsChange);
  document.addEventListener('webkitfullscreenchange', onFsChange);
}


// =============================================
//  HERO VIDEO SCROLL EXPANSION
// =============================================

const nav       = document.getElementById('nav');
const heroZone  = document.getElementById('hero-zone');
const heroSticky = heroZone ? heroZone.querySelector('.hero-sticky') : null;
const videoWrap = document.getElementById('video-player-wrap');
const heroText  = document.getElementById('hero-text-col');
const vcControls = document.getElementById('video-controls');

function clamp(min, val, max) { return Math.max(min, Math.min(max, val)); }
function lerp(a, b, t)         { return a + (b - a) * t; }

// Ease-in-out for smoother expansion
function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function updateHeroScroll() {
  if (!heroZone || !videoWrap || !heroText || !heroSticky) return;

  const scrollTop  = window.scrollY;
  const zoneTop    = heroZone.offsetTop;
  const zoneHeight = heroZone.offsetHeight;
  const vw         = window.innerWidth;
  const vh         = window.innerHeight;

  const scrollInZone = scrollTop - zoneTop;
  const animRange    = zoneHeight - vh;
  const rawProgress  = clamp(0, scrollInZone / animRange, 1);
  const progress     = easeInOut(rawProgress);

  if (vw > 768) {
    const sw = heroSticky.offsetWidth;
    const sh = heroSticky.offsetHeight;

    // Initial landscape card dimensions (16:9)
    const margin    = clamp(24, sw * 0.03, 48);
    const initW     = sw * 0.5 - margin * 2;
    const initH     = initW * (9 / 16);          // true 16:9 landscape
    const initTop   = (sh - initH) / 2;           // vertically centred
    const initLeft  = sw * 0.5 + margin;          // starts in right half

    // Final state: cover entire sticky container
    const finalW = sw;
    const finalH = sh;

    const curTop    = lerp(initTop,   0,      progress);
    const curLeft   = lerp(initLeft,  0,      progress);
    const curWidth  = lerp(initW,     finalW, progress);
    const curHeight = lerp(initH,     finalH, progress);
    const radius    = lerp(16,        0,      progress);

    videoWrap.style.top          = curTop    + 'px';
    videoWrap.style.left         = curLeft   + 'px';
    videoWrap.style.width        = curWidth  + 'px';
    videoWrap.style.height       = curHeight + 'px';
    videoWrap.style.borderRadius = radius    + 'px';

    // Fade text out during first 40% of scroll
    heroText.style.opacity = clamp(0, 1 - rawProgress / 0.4, 1).toFixed(3);
    // Block pointer-events on text once expansion begins so video controls are always clickable
    heroText.style.pointerEvents = rawProgress > 0.05 ? 'none' : '';
    // Clear any inline opacity on controls — let CSS :hover rule handle visibility
    if (vcControls) vcControls.style.opacity = '';
  }

  // Nav: light by default, switch to dark once past the hero zone
  const pastHero = scrollTop >= zoneHeight;
  nav.classList.toggle('nav-dark', pastHero);

  // Pause when hero is fully scrolled past; resume when scrolled back in
  if (vid) {
    if (pastHero) {
      if (!vid.paused) vid.pause();
    } else {
      if (vid.paused) vid.play().catch(() => {});
    }
  }
}

function resetMobileHero() {
  if (!videoWrap || !heroText) return;
  // Clear all JS-set inline styles so CSS media queries take full control
  videoWrap.style.cssText = '';
  heroText.style.opacity = '';
  heroText.style.pointerEvents = '';
}

// =============================================
//  MOBILE VIDEO — pause/play on scroll + slide-in animation
// =============================================

let mobileVideoObserver = null;
let mobileScrollObserver = null;

function initMobileVideo() {
  if (!videoWrap || !vid) return;

  // 1. Slide-in animation when video enters view
  videoWrap.classList.add('mobile-vid-hidden');

  mobileScrollObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          videoWrap.classList.remove('mobile-vid-hidden');
          videoWrap.classList.add('mobile-vid-visible');
        }
      });
    },
    { threshold: 0.15 }
  );
  mobileScrollObserver.observe(videoWrap);

  // 2. Pause when video scrolls out of view, play when back in
  mobileVideoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          vid.play().catch(() => {});
        } else {
          if (!vid.paused) vid.pause();
        }
      });
    },
    { threshold: 0.1 }
  );
  mobileVideoObserver.observe(videoWrap);
}

function teardownMobileVideo() {
  if (mobileScrollObserver) { mobileScrollObserver.disconnect(); mobileScrollObserver = null; }
  if (mobileVideoObserver)  { mobileVideoObserver.disconnect();  mobileVideoObserver  = null; }
  if (videoWrap) {
    videoWrap.classList.remove('mobile-vid-hidden', 'mobile-vid-visible');
  }
}

function onScrollOrResize() {
  if (window.innerWidth <= 768) {
    resetMobileHero();
    if (!mobileVideoObserver) initMobileVideo();
    // Nav dark toggle
    if (heroZone && nav) {
      const pastHero = window.scrollY >= heroZone.offsetHeight;
      nav.classList.toggle('nav-dark', pastHero);
    }
    return;
  }
  // Desktop: tear down mobile observers if they exist
  teardownMobileVideo();
  updateHeroScroll();
}

window.addEventListener('scroll', onScrollOrResize, { passive: true });
window.addEventListener('resize', onScrollOrResize, { passive: true });
onScrollOrResize(); // run on page load


// =============================================
//  FINAL CTA — PARALLAX DROP-IN
//  Content starts above, drifts down into place
//  as you scroll in; reverses on scroll up
// =============================================

const finalCtaSection = document.querySelector('.final-cta');
const finalCtaInner   = document.querySelector('.final-cta-inner');

function updateCtaParallax() {
  if (!finalCtaSection || !finalCtaInner) return;

  const rect = finalCtaSection.getBoundingClientRect();
  const vh   = window.innerHeight;

  // Only animate while section is anywhere near the viewport
  if (rect.bottom < 0 || rect.top > vh) return;

  // progress: 0 = section top just hit viewport bottom (entering)
  //           1 = section top reached viewport top (fully in view)
  const progress = clamp(0, 1 - rect.top / vh, 1);

  // Ease out: snappy at first, smooth settle
  const eased = 1 - Math.pow(1 - Math.min(progress * 1.4, 1), 3);

  // Content drops from -60px above down to 0
  const translateY = lerp(-60, 0, eased);

  finalCtaInner.style.transform = `translateY(${translateY.toFixed(2)}px)`;
}

window.addEventListener('scroll', updateCtaParallax, { passive: true });
updateCtaParallax();


// =============================================
//  FAQ ACCORDION
// =============================================

document.querySelectorAll('.faq-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');

    // Close all open items
    document.querySelectorAll('.faq-item.open').forEach((el) => {
      el.classList.remove('open');
      el.querySelector('.faq-btn').setAttribute('aria-expanded', 'false');
    });

    // Open clicked item if it was closed
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});
