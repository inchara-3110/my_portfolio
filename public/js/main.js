/* ==========================================================
   K Inchara portfolio - front-end behaviour
   1. Skills & tools   2. Projects slider
   3. Certification timeline   4. Smooth cursor
   ========================================================== */
(() => {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Skills & tools ---------- */
  const toggle = document.getElementById('skillsToggle');
  const panel = document.getElementById('skillsPanel');
  if (toggle && panel) {
    const groups = Array.from(panel.querySelectorAll('.skills-group'));
    let closeTimer;

    // the box you hover/click comes forward, the other one goes a little back
    const setFront = (active) => groups.forEach((g) => {
      g.classList.toggle('is-front', g === active);
      g.classList.toggle('is-back', !!active && g !== active);
    });
    groups.forEach((g) => {
      g.addEventListener('mouseenter', () => setFront(g));
      g.addEventListener('click', () => setFront(g));
      g.addEventListener('focus', () => setFront(g));
      g.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFront(g); }
      });
    });

    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      clearTimeout(closeTimer);
      if (open) {
        panel.hidden = false;
        void panel.offsetWidth;            // lets the slide-out animation start
        panel.classList.add('is-open');
      } else {
        panel.classList.remove('is-open');
        setFront(null);
        closeTimer = setTimeout(() => { panel.hidden = true; }, reduceMotion ? 0 : 600);
      }
    });
  }

  /* ---------- 2. Projects slider ---------- */
  const track = document.getElementById('projectTrack');
  const prev = document.getElementById('prevProject');
  const next = document.getElementById('nextProject');
  const dotsWrap = document.getElementById('projectDots');
  if (track && prev && next && dotsWrap) {
    const slides = Array.from(track.children);
    slides.forEach(() => {
      const d = document.createElement('span');
      d.className = 'dot';
      dotsWrap.appendChild(d);
    });
    const dots = Array.from(dotsWrap.children);

    const step = () => slides[0].getBoundingClientRect().width +
      parseFloat(getComputedStyle(track).columnGap || 24);

    const update = () => {
      const index = Math.min(slides.length - 1, Math.max(0, Math.round(track.scrollLeft / step())));
      dots.forEach((d, i) => d.classList.toggle('is-active', i === index));
      slides.forEach((s, i) => s.classList.toggle('is-active', i === index));
      prev.disabled = track.scrollLeft < 4;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    };
    const go = (dir) => track.scrollBy({ left: dir * step(), behavior: reduceMotion ? 'auto' : 'smooth' });

    prev.addEventListener('click', () => go(-1));
    next.addEventListener('click', () => go(1));
    track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- 3. Certification timeline (line grows as you scroll) ---------- */
  const roadmap = document.getElementById('roadmap');
  const fill = document.getElementById('roadFill');
  const pointer = document.getElementById('roadPointer');
  if (roadmap && fill && pointer) {
    const stops = Array.from(roadmap.querySelectorAll('.stop'));
    let current = 0;
    let target = 0;
    let running = false;

    const measure = () => {
      const top = roadmap.getBoundingClientRect().top;
      const centers = stops.map((s) => {
        const r = s.querySelector('.stop__dot').getBoundingClientRect();
        return r.top - top + r.height / 2;
      });
      // the line grows with scrolling, but stops at your current level
      let last = -1;
      stops.forEach((s, i) => { if (s.dataset.state !== 'next') last = i; });
      const cap = last >= 0 ? centers[last] : 0;
      const reach = window.innerHeight * 0.6 - top;
      target = Math.min(Math.max(reach, 0), cap);
      return centers;
    };

    const tick = () => {
      const centers = measure();
      current = reduceMotion ? target : current + (target - current) * 0.12;
      if (Math.abs(target - current) < 0.4) current = target;

      fill.style.height = current + 'px';
      pointer.style.top = current + 'px';
      pointer.style.opacity = current > 2 ? '1' : '0';
      stops.forEach((s, i) => s.classList.toggle('is-reached', centers[i] <= current + 1));

      if (current !== target) requestAnimationFrame(tick);
      else running = false;
    };
    const kick = () => {
      if (!running) { running = true; requestAnimationFrame(tick); }
    };

    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', kick);
    window.addEventListener('load', kick);
    kick();
  }

  /* ---------- 4. Smooth cursor (position only, never scales) ---------- */
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (finePointer) {
    const root = document.documentElement;
    const dot = document.createElement('div');
    const ring = document.createElement('div');
    dot.className = 'cursor-dot';
    ring.className = 'cursor-ring';
    document.body.append(ring, dot);
    root.classList.add('has-cursor');

    let mx = 0, my = 0;      // real mouse position
    let rx = 0, ry = 0;      // ring position (follows smoothly)
    let started = false;
    const ease = reduceMotion ? 1 : 0.35;

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      if (!started) { rx = mx; ry = my; started = true; root.classList.add('cursor-ready'); }
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
    }, { passive: true });

    const loop = () => {
      rx += (mx - rx) * ease;
      ry += (my - ry) * ease;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      requestAnimationFrame(loop);
    };
    loop();

    document.addEventListener('mouseover', (e) => {
      root.classList.toggle('cursor-hover', !!e.target.closest('a, button, .skills-group'));
    });
    document.addEventListener('mouseleave', () => root.classList.remove('cursor-ready'));
    document.addEventListener('mouseenter', () => started && root.classList.add('cursor-ready'));
  }
})();