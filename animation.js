/* Скролл кезінде пайда болу анимациясы */
if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
  const items = document.querySelectorAll('main section > h2, .design-case, .online-project, .about-services article, .contact-links a, .order-panel, #about > p, .site-footer');
  const io = new IntersectionObserver(entries => {
    let visibleIndex = 0;
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.style.setProperty('--reveal-delay', Math.min(visibleIndex++, 3) * 70 + 'ms');
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -32px 0px' });
  for (const item of items) {
    item.classList.add('reveal');
    io.observe(item);
  }
}

(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.design-case, .online-project, .button, .brand, .contact-links a, .order-panel, .about-services article').forEach(el => el.dataset.tilt = 'true');
  const tiltItems = [...document.querySelectorAll('[data-tilt]')];
  for (const item of tiltItems) {
    item.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse') return;
      const rect = item.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const rotateY = (x - 0.5) * 14;
      const rotateX = 0.5 - y;
      item.style.setProperty('--rx', (rotateX * 9).toFixed(2) + 'deg');
      item.style.setProperty('--ry', (rotateY * 12).toFixed(2) + 'deg');
    });
    item.addEventListener('pointerleave', () => {
      item.style.setProperty('--rx', '0deg');
      item.style.setProperty('--ry', '0deg');
    });
  }
  const setScrollShift = () => {
    const offset = Math.min(window.scrollY * 0.15, 80);
    document.documentElement.style.setProperty('--scroll', offset + 'px');
  };
  setScrollShift();
  addEventListener('scroll', setScrollShift, { passive: true });
})();
/* === abhishekjha.me стиліне ұқсас анимациялар ===
   1) Cursor-жолбарыш: нүкте + кешігу сақинасы, hover-де үлкейеді
   2) Scramble/морфинг: тақырыптар мен сілтемелер мәтіні символдар араласып «шырайдан» ашылады */
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZабвгдеёжзийклмнопрстуфхцчшщъыьэюя0123456789#%&@*<>/\\';

  /* ---------- 1. Cursor ---------- */
  if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
    const dot = document.createElement('div'); dot.className = 'cursor-dot';
    const ring = document.createElement('div'); ring.className = 'cursor-ring';
    document.body.append(dot, ring);
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, started = false;
    addEventListener('pointermove', e => {
      mx = e.clientX; my = e.clientY;
      if (!started) {
        rx = mx;
        ry = my;
        started = true;
        document.documentElement.classList.add('cursor-mode');
      }
      dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
    }, { passive: true });
    addEventListener('pointerdown', () => document.documentElement.classList.add('cursor-down'));
    addEventListener('pointerup', () => document.documentElement.classList.remove('cursor-down'));
    const hotSel = 'a,button,.chip,input,textarea,select,dialog,.design-case,.online-project,[data-tilt]';
    addEventListener('pointerover', e => {
      if (e.target.closest && e.target.closest(hotSel)) document.documentElement.classList.add('cursor-hot');
    });
    addEventListener('pointerout', e => {
      if (e.target.closest && e.target.closest(hotSel) && !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(hotSel)))
        document.documentElement.classList.remove('cursor-hot');
    });
    (function loop() {
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      ring.style.transform = 'translate3d(' + rx.toFixed(2) + 'px,' + ry.toFixed(2) + 'px,0)';
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- 2. Scramble / мәтін морфингі ---------- */
  const scrambling = new WeakSet();

  function scramble(element, delay = 0) {
    if (scrambling.has(element)) return;
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        return node.data.trim() && !node.parentElement.closest('svg, [aria-hidden="true"]')
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    if (!nodes.length) return;

    scrambling.add(element);
    setTimeout(() => {
      const texts = nodes.filter(node => node.isConnected).map(node => ({
        node,
        original: [...node.data],
        current: node.data
      }));
      const start = performance.now();
      function update(now) {
        let pending = false;
        for (const text of texts) {
          if (!text.node.isConnected || text.node.data !== text.current) continue;
          text.current = text.original.map((char, index) => {
            if (/\s/.test(char) || now - start >= 420 + index * 34) return char;
            pending = true;
            return glyphs[Math.floor(Math.random() * glyphs.length)];
          }).join('');
          text.node.data = text.current;
        }
        if (pending) requestAnimationFrame(update);
        else scrambling.delete(element);
      }
      requestAnimationFrame(update);
    }, delay);
  }

  /* Бет ашылғанда: hero тақырыбы, тіккер және навигация шырайдан ашылады */
  const heroH1 = document.querySelector('.hero h1');
  if (heroH1) scramble(heroH1, 250);
  document.querySelectorAll('header nav a').forEach((a, i) => scramble(a, 400 + i * 90));
  document.querySelectorAll('.ticker-group span:not(.separator)').forEach((s, i) => scramble(s, 600 + (i % 8) * 70));

  /* Скролл кезінде: section тақырыптары көрінгенде морфингпен ашылады */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        scramble(e.target, 120);
      }
    }, { rootMargin: '0px 0px -20% 0px' });
    document.querySelectorAll('main section > h2 span, footer strong').forEach(h => io.observe(h));
  }

  /* Hover кезінде: сілтеме/батырма мәтіні қысқа «толқындық» scramble жасайды */
  const hoverTargets = 'header nav a, .contact-links a span, .site-footer a, .copy-chip, .button';
  for (const el of document.querySelectorAll(hoverTargets)) {
    el.addEventListener('pointerenter', () => {
      if (el._scratching) return;
      el._scratching = true;
      scramble(el, 0);
      setTimeout(() => { el._scratching = false; }, 700);
    });
  }
})();
