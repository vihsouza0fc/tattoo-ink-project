(() => {
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const de = document.documentElement, body = document.body;

  /* menu */
  const bt = $('.burger');
  const setMenu = o => { body.classList.toggle('menu', o); bt.setAttribute('aria-expanded', o); bt.setAttribute('aria-label', o ? 'Fechar menu' : 'Abrir menu') };
  bt.onclick = () => setMenu(!body.classList.contains('menu'));
  $$('nav a').forEach(a => a.addEventListener('click', () => setMenu(false)));

  /* galeria: visualização ampliada (imagem inteira, sem corte) */
  const items = $$('.gal figure'), lb = $('.lb'), li = $('img', lb), lc = $('p', lb); let ix = 0, sx = 0;
  const show = (i, dir = 1) => {
    ix = (i + items.length) % items.length;
    const im = $('img', items[ix]);

    // 1. Joga a imagem atual levemente para o lado e deixa transparente
    li.style.opacity = '0';
    li.style.transform = `translateX(${dir * -30}px) scale(0.97)`;

    // 2. Espera 200ms, troca a imagem e traz ela suavemente do outro lado
    setTimeout(() => {
      li.src = im.currentSrc || im.src;
      li.alt = im.alt;
      lc.textContent = $('figcaption', items[ix]).textContent;

      li.style.transition = 'none';
      li.style.transform = `translateX(${dir * 30}px) scale(0.97)`;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          li.style.transition = '';
          li.style.opacity = '1';
          li.style.transform = 'translateX(0) scale(1)';
        });
      });
    }, 200);
  };

  items.forEach((f, i) => {
    f.tabIndex = 0; f.setAttribute('role', 'button'); f.setAttribute('aria-label', 'Ampliar: ' + $('img', f).alt);
    const open = () => { show(i); lb.showModal() };
    f.onclick = open; f.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open() } };
  });
  $('.x', lb).onclick = () => lb.close();
  $('.pv', lb).onclick = () => show(ix - 1); $('.nx', lb).onclick = () => show(ix + 1);
  lb.onclick = e => { if (e.target === lb) lb.close() };
  lb.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') show(ix - 1); if (e.key === 'ArrowRight') show(ix + 1) });
  lb.addEventListener('pointerdown', e => sx = e.clientX);
  lb.addEventListener('pointerup', e => { const d = e.clientX - sx; if (Math.abs(d) > 50) show(ix + (d < 0 ? 1 : -1)) });

  /* animações: sem GSAP ou com movimento reduzido, tudo permanece visível */
  const g = window.gsap, ST = window.ScrollTrigger;
  if (!g || !ST || matchMedia('(prefers-reduced-motion: reduce)').matches) { de.classList.remove('anim'); return }
  g.registerPlugin(ST);
  const mob = matchMedia('(max-width:760px)').matches;

  const chars = el => {
    const t = el.textContent.trim(), h = el.closest('h1,h2');
    if (h && !h.hasAttribute('aria-label')) h.setAttribute('aria-label', t);
    el.innerHTML = t.split(' ').map(w => '<span style="display:inline-block;white-space:nowrap" aria-hidden="true">' + [...w].map(c => '<span class="c-m"><span>' + c + '</span></span>').join('') + '</span>').join(' ');
    return $$('.c-m>span', el);
  };
  const words = el => {
    const out = [], tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), ns = [];
    while (tw.nextNode()) ns.push(tw.currentNode);
    ns.forEach(n => {
      const f = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(p => {
        if (!p.trim()) { f.append(p); return }
        const w = document.createElement('span'), s = document.createElement('span');
        w.className = 'w'; s.textContent = p; w.append(s); f.append(w); out.push(s);
      });
      n.replaceWith(f);
    });
    return out;
  };

  /* abertura: dragão em máscara, TATTOO sobe letra a letra, INK abre o tracking */
  const l1 = chars($('.l1')), l2 = chars($('.l2'));
  g.timeline({ defaults: { ease: 'expo.out' } })
    .fromTo('.dragon', { opacity: 0, scale: 1.1, clipPath: 'inset(0 0 100% 0)' }, { opacity: 1, scale: 1, clipPath: 'inset(0 0 0% 0)', duration: 1.5, clearProps: 'clipPath' }, 0)
    .from(l1, { yPercent: 115, duration: .9, stagger: .05 }, .3)
    .from(l2, { yPercent: 115, duration: .9, stagger: .07 }, .55)
    .fromTo('.l2', { letterSpacing: '.3em' }, { letterSpacing: '-.02em', duration: 1.4 }, .55)
    .fromTo('.hi,.kana', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .7, stagger: .1, ease: 'power3.out' }, 1.1);

  /* saída da abertura ligada à rolagem */
  g.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .6 } })
    .to('.hero-txt', { yPercent: -25, opacity: 0, ease: 'none' }, 0)
    .to('.dragon', { yPercent: 14, ease: 'none' }, 0);

  /* títulos */
  $$('h2[data-c]').forEach(h => g.from(chars(h), { yPercent: 115, duration: .9, stagger: .025, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 85%' } }));

  /* manifesto: palavras reveladas por máscara conforme a rolagem; sol cresce; saída ao final */
  g.fromTo($$('.mf').flatMap(words), { yPercent: 105, opacity: .1 }, { yPercent: 0, opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: '.mani', start: 'top 60%', end: 'bottom 75%', scrub: true } });
  g.fromTo('.sun', { scale: .4, xPercent: 20 }, { scale: 1, xPercent: 0, ease: 'none', scrollTrigger: { trigger: '.mani', start: 'top bottom', end: 'center center', scrub: true } });
  g.to('.mf', { xPercent: -8, opacity: .2, ease: 'none', scrollTrigger: { trigger: '.mani', start: 'bottom 60%', end: 'bottom top', scrub: true } });

  /* blocos: imagens por clip-path, textos deslizando */
  $$('[data-r]').forEach(el => {
    const st = { trigger: el, start: 'top 88%' };
    if (el.tagName === 'IMG') g.from(el, { clipPath: 'inset(100% 0 0 0)', duration: 1.2, ease: 'expo.out', clearProps: 'clipPath', scrollTrigger: st });
    else g.from(el, { y: 36, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: st });
  });

  /* galeria: revelação em máscara + parallax leve (desligado no celular) */
  items.forEach((f, i) => {
    const st = { trigger: f, start: 'top 88%' };
    g.from($('.rv', f), { clipPath: 'inset(100% 0 0 0)', duration: 1.1, ease: 'expo.out', clearProps: 'clipPath', scrollTrigger: st });
    g.from($('img', f), { scale: 1.15, duration: 1.4, ease: 'expo.out', scrollTrigger: st });
    if (!mob) g.fromTo(f, { y: i % 2 ? 60 : 30 }, { y: i % 2 ? -60 : -30, ease: 'none', scrollTrigger: { trigger: f, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* cursor "Ver" na galeria (apenas mouse) */
  if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
    const cu = $('.cur'), qx = g.quickTo(cu, 'x', { duration: .4, ease: 'power3' }), qy = g.quickTo(cu, 'y', { duration: .4, ease: 'power3' });
    addEventListener('pointermove', e => { qx(e.clientX); qy(e.clientY) });
    items.forEach(f => { f.onmouseenter = () => cu.classList.add('on'); f.onmouseleave = () => cu.classList.remove('on') });
  }
  addEventListener('load', () => ST.refresh());
})();
