(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  document.getElementById('year').textContent = new Date().getFullYear();

  const nav = document.querySelector('.site-nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 10);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const menu = document.getElementById('menu');
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a') && menu.classList.contains('show') && window.bootstrap) {
      bootstrap.Collapse.getOrCreateInstance(menu).hide();
    }
  });

  // Floating bubbles
  if (!reduce) {
    document.querySelectorAll('.bubbles').forEach((box) => {
      const count = box.classList.contains('small') ? 10 : 16;
      for (let i = 0; i < count; i++) {
        const b = document.createElement('i');
        const size = 10 + Math.random() * 46;
        b.style.width = b.style.height = `${size}px`;
        b.style.left = `${Math.random() * 100}%`;
        b.style.animationDuration = `${9 + Math.random() * 12}s`;
        b.style.animationDelay = `${-Math.random() * 20}s`;
        b.style.setProperty('--drift', `${(Math.random() - 0.5) * 120}px`);
        box.appendChild(b);
      }
    });
  }

  // Before / after slider
  const compare = document.getElementById('compare');
  const range = document.getElementById('compare-range');
  const setPos = (v) => compare.style.setProperty('--pos', `${v}%`);
  range.addEventListener('input', () => setPos(range.value));
  if (!reduce) {
    // gentle intro sweep so visitors notice it's interactive
    const start = performance.now();
    const sweep = (now) => {
      const t = Math.min((now - start) / 1800, 1);
      const v = 50 + Math.sin(t * Math.PI * 2) * 22 * (1 - t);
      setPos(v); range.value = v;
      if (t < 1 && !compare.dataset.touched) requestAnimationFrame(sweep);
    };
    setTimeout(() => requestAnimationFrame(sweep), 900);
    range.addEventListener('pointerdown', () => { compare.dataset.touched = '1'; });
  }

  // Reveal + count-up
  const countUp = (el) => {
    const target = Number(el.dataset.count);
    if (reduce) { el.textContent = target; return; }
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / 1400, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        entry.target.querySelectorAll('[data-count]').forEach(countUp);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15 });
    reveals.forEach((el, i) => { el.style.transitionDelay = `${(i % 3) * 90}ms`; io.observe(el); });
  } else {
    reveals.forEach((el) => { el.classList.add('visible'); el.querySelectorAll('[data-count]').forEach(countUp); });
  }

  // Quote calculator
  const area = document.getElementById('area');
  const type = document.getElementById('type');
  const protect = document.getElementById('protect');
  const areaOut = document.getElementById('area-out');
  const total = document.getElementById('total');
  let shown = 50;
  const update = () => {
    const m2 = Number(area.value);
    areaOut.textContent = m2;
    const target = Math.round(m2 * (Number(type.value) + (protect.checked ? 0.8 : 0)));
    if (reduce) { total.textContent = target; shown = target; return; }
    const from = shown; const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / 350, 1);
      shown = Math.round(from + (target - from) * p);
      total.textContent = shown;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  [area, type, protect].forEach((el) => el.addEventListener('input', update));
  document.getElementById('quote-form').addEventListener('submit', (e) => e.preventDefault());
  update();

  // Tilt on service cards
  if (finePointer && !reduce) {
    document.querySelectorAll('.tilt').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateX(${-y * 7}deg) rotateY(${x * 7}deg) translateY(-6px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }
})();
