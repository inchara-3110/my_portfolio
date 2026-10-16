/* ==========================================================
   K Inchara portfolio - front-end behaviour
   1. Skills & tools   2. Projects: rotating ring + details pop-up
   3. Certifications: boxes come up / go back   4. Smooth cursor
   ========================================================== */
(() => {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

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

  /* ---------- 2. Projects: rotating ring + details pop-up ---------- */
  const wheel = document.getElementById('projectWheel');
  if (wheel) {
    const svgNS = 'http://www.w3.org/2000/svg';
    const ring = document.getElementById('wheelRing');
    const badges = document.getElementById('wheelBadges');
    const stage = wheel.querySelector('.wheel__stage');
    const chipsWrap = wheel.querySelector('.wheel__chips');
    const items = Array.from(wheel.querySelectorAll('.wheel__item'));
    const chips = items.map((li) => li.querySelector('.wheel__chip'));
    const cTitle = document.getElementById('wheelTitle');
    const cSub = document.getElementById('wheelSub');

    const dialog = document.getElementById('projectDialog');
    const dialogBox = dialog ? dialog.querySelector('.project-dialog__box') : null;
    const pdTitle = document.getElementById('pdTitle');
    const pdBody = document.getElementById('pdBody');
    const pdClose = document.getElementById('pdClose');

    const n = chips.length;
    if (n > 0) {
      const palette = ['#E8707F', '#F2A65A', '#EBCB5B', '#86C47A', '#5B9BD5', '#B081C0'];
      const C = 200;          // centre of the ring
      const R = 140;          // middle radius of the ring
      const GAP = 3.2;        // gap between segments, in degrees
      const step = 360 / n;
      const rad = (d) => (d * Math.PI) / 180;
      const point = (deg, r) => [C + r * Math.sin(rad(deg)), C - r * Math.cos(rad(deg))];

      const segs = [];
      const nums = [];
      const colors = [];

      const highlight = (i) => {
        chips.forEach((c, k) => c.classList.toggle('is-active', k === i));
        segs.forEach((s, k) => {
          s.classList.toggle('is-active', k === i);
          s.classList.toggle('is-dim', k !== i);
        });
        chipsWrap.classList.add('has-active');
        cTitle.textContent = chips[i].textContent.trim();
        cSub.textContent = 'Click to open';
      };
      const unhighlight = () => {
        chips.forEach((c) => c.classList.remove('is-active'));
        segs.forEach((s) => s.classList.remove('is-active', 'is-dim'));
        chipsWrap.classList.remove('has-active');
        cTitle.textContent = 'Projects';
        cSub.textContent = 'Select one';
      };

      const openProject = (i) => {
        if (!dialog || typeof dialog.showModal !== 'function') return;
        const more = items[i].querySelector('.wheel__more');
        pdTitle.textContent = chips[i].textContent.trim();
        pdBody.replaceChildren(...Array.from(more.cloneNode(true).childNodes));
        dialogBox.style.setProperty('--c', colors[i]);
        root.classList.add('modal-open');
        highlight(i);
        dialog.showModal();
        dialog.dataset.from = String(i);
      };

      chips.forEach((chip, i) => {
        const color = palette[Math.floor((i * palette.length) / n)];
        colors.push(color);
        chip.style.setProperty('--c', color);

        const a1 = i * step + GAP / 2;
        const a2 = (i + 1) * step - GAP / 2;
        const [x1, y1] = point(a1, R);
        const [x2, y2] = point(a2, R);
        const large = a2 - a1 > 180 ? 1 : 0;

        const path = document.createElementNS(svgNS, 'path');
        path.setAttribute('d', `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`);
        path.setAttribute('stroke', color);
        path.setAttribute('class', 'seg');
        ring.appendChild(path);
        segs.push(path);

        const label = document.createElementNS(svgNS, 'text');
        label.setAttribute('class', 'wheel__num');
        label.textContent = String(i + 1);
        badges.appendChild(label);
        nums.push(label);

        chip.addEventListener('click', () => openProject(i));
        chip.addEventListener('mouseenter', () => highlight(i));
        chip.addEventListener('focus', () => highlight(i));
        chip.addEventListener('mouseleave', unhighlight);
        chip.addEventListener('blur', unhighlight);
        path.addEventListener('click', () => openProject(i));
        path.addEventListener('mouseenter', () => highlight(i));
        path.addEventListener('mouseleave', unhighlight);
      });

      if (dialog && pdClose) {
        pdClose.addEventListener('click', () => dialog.close());
        dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
        dialog.addEventListener('close', () => {
          root.classList.remove('modal-open');
          unhighlight();
          const from = Number(dialog.dataset.from);
          if (chips[from]) chips[from].focus({ preventScroll: true });
        });
      }

      /* the ring keeps rotating all the time */
      let spin = 0;
      let visible = false;
      let raf = 0;
      let last = 0;

      const apply = () => {
        ring.setAttribute('transform', `rotate(${spin.toFixed(2)} ${C} ${C})`);
        nums.forEach((t, i) => {
          const [x, y] = point((i + 0.5) * step + spin, R);   // numbers stay upright
          t.setAttribute('x', x.toFixed(2));
          t.setAttribute('y', y.toFixed(2));
        });
      };
      const loop = (now) => {
        const dt = Math.min(0.05, (now - last) / 1000 || 0);
        last = now;
        spin = (spin + 8 * dt) % 360;
        apply();
        raf = visible ? requestAnimationFrame(loop) : 0;
      };
      const kick = () => {
        if (!raf && visible && !reduceMotion) {
          last = performance.now();
          raf = requestAnimationFrame(loop);
        }
      };

      new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
        if (visible) kick();
      }, { threshold: 0.05 }).observe(stage);

      apply();
    }
  }

  /* ---------- 3. Certifications: the clicked box comes up, the others go back ---------- */
  const certGrid = document.getElementById('certGrid');
  if (certGrid) {
    const cards = Array.from(certGrid.querySelectorAll('.cert-card'));
    const clearAll = () => {
      cards.forEach((c) => {
        c.classList.remove('is-front');
        const b = c.querySelector('.cert-card__btn');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
      certGrid.classList.remove('has-front');
    };

    cards.forEach((card) => {
      const btn = card.querySelector('.cert-card__btn');
      if (!btn) return;
      btn.addEventListener('click', () => {
        const open = !card.classList.contains('is-front');
        clearAll();
        if (open) {
          card.classList.add('is-front');
          btn.setAttribute('aria-expanded', 'true');
          certGrid.classList.add('has-front');
        }
      });
    });

    document.addEventListener('click', (e) => { if (!certGrid.contains(e.target)) clearAll(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') clearAll(); });
  }

  /* ---------- 4. Smooth cursor (position only, never scales) ---------- */
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (finePointer) {
    const dot = document.createElement('div');
    const cursorRing = document.createElement('div');
    dot.className = 'cursor-dot';
    cursorRing.className = 'cursor-ring';
    document.body.append(cursorRing, dot);
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
      cursorRing.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      requestAnimationFrame(loop);
    };
    loop();

    document.addEventListener('mouseover', (e) => {
      root.classList.toggle('cursor-hover', !!e.target.closest('a, button, .skills-group, .seg'));
    });
    document.addEventListener('mouseleave', () => root.classList.remove('cursor-ready'));
    document.addEventListener('mouseenter', () => started && root.classList.add('cursor-ready'));
  }
})();