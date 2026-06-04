// ══════════════════════════════════════════════════════════════════
// NAIRU — Motion Engine v3.0 (GSAP · Clash Display Edition)
// ══════════════════════════════════════════════════════════════════

(function () {
  'use strict';

  const qs = (s, p = document) => p.querySelector(s);
  const qsa = (s, p = document) => [...p.querySelectorAll(s)];
  const lerp = (a, b, t) => a + (b - a) * t;
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

  const gsapReady = typeof gsap !== 'undefined';
  const stReady = gsapReady && typeof ScrollTrigger !== 'undefined';

  if (gsapReady) {
    if (stReady) gsap.registerPlugin(ScrollTrigger);
    if (typeof ScrollToPlugin !== 'undefined') gsap.registerPlugin(ScrollToPlugin);
  }

  /* ─── Easings ─────────────────────────────────────────────── */
  const E_SNAP = 'power3.out';
  const E_ENTER = 'power4.out';
  const E_SPRING = 'back.out(1.5)';
  const E_FLOAT = 'sine.inOut';
  const E_EXPO = 'expo.out';


  // ════════════════════════════════════════════════════════════
  // § 1 · LOADER
  // ════════════════════════════════════════════════════════════
  const loader = qs('#nx-loader');
  const ldrBar = qs('#ldrBar');
  let prog = 0;
  let heroReady = false;

  const tick = setInterval(() => {
    prog = Math.min(prog + Math.random() * 18, 90);
    if (ldrBar) ldrBar.style.width = prog + '%';
  }, 80);

  function finishLoad() {
    clearInterval(tick);
    if (ldrBar) ldrBar.style.width = '100%';
    setTimeout(() => {
      if (!loader) { if (!heroReady) { heroReady = true; initHeroTimeline(); } return; }
      if (gsapReady) {
        gsap.to(loader, {
          opacity: 0, scale: 1.04, duration: .6, ease: E_SNAP,
          onComplete: () => {
            loader.classList.add('done');
            document.body.classList.add('hero-ready');
            document.dispatchEvent(new Event('heroReady'));
            if (!heroReady) { heroReady = true; initHeroTimeline(); }
          }
        });
      } else {
        loader.classList.add('done');
        document.body.classList.add('hero-ready');
        document.dispatchEvent(new Event('heroReady'));
        if (!heroReady) { heroReady = true; initHeroTimeline(); }
      }
    }, 380);
  }

  window.addEventListener('load', finishLoad, { once: true });
  setTimeout(() => { if (!heroReady) finishLoad(); }, 2600);


  // ════════════════════════════════════════════════════════════
  // § 2 · HERO CINEMATIC ENTRANCE
  // ════════════════════════════════════════════════════════════
  function initHeroTimeline() {
    // Typewriter
    const title = qs('.hero__title');
    if (title) {
      title.classList.add('words-visible');
      const grad = qs('.grad-text', title);
      if (grad) {
        const full = grad.textContent.trim();
        grad.textContent = '';
        grad.style.opacity = '1';
        let idx = 0;
        const type = () => {
          if (idx <= full.length) {
            grad.textContent = full.slice(0, idx++);
            setTimeout(type, idx === 1 ? 900 : 34);
          }
        };
        setTimeout(type, 1200);
      }
    }

    if (!gsapReady) {
      qsa('.reveal').forEach(el => el.classList.add('visible'));
      return;
    }

    /* Set initial states */
    gsap.set('.hero__eyebrow', { opacity: 0, y: 16, x: -8 });
    gsap.set('.hero__title', { opacity: 0, y: 40 });
    gsap.set('.hero__sub', { opacity: 0, y: 24 });
    gsap.set('.hero__ctas', { opacity: 0, y: 18 });
    gsap.set('.hero__stats', { opacity: 0, y: 12 });
    gsap.set('.hero__visual', { opacity: 0, x: 36, scale: .95 });
    gsap.set('.float-card', { opacity: 0, scale: .82, y: 14 });

    const tl = gsap.timeline({ defaults: { ease: E_ENTER } });

    tl
      .to('.hero__eyebrow', { opacity: 1, y: 0, x: 0, duration: .7 }, 0)
      .to('.hero__title', { opacity: 1, y: 0, duration: 1.0 }, 0.18)
      .to('.hero__sub', { opacity: 1, y: 0, duration: .75 }, 0.44)
      .to('.hero__ctas', { opacity: 1, y: 0, duration: .7 }, 0.60)
      .to('.hero__stats', { opacity: 1, y: 0, duration: .6 }, 0.75)
      .to('.hero__visual', { opacity: 1, x: 0, scale: 1, duration: 1.1 }, 0.22)
      .to('.float-card', {
        opacity: 1, scale: 1, y: 0,
        duration: .7, ease: E_SPRING, stagger: .20
      }, 0.90);

    /* Stat numbers count-up tied to hero entrance */
    setTimeout(() => initCounters(), 1200);
  }


  // ════════════════════════════════════════════════════════════
  // § 3 · SCROLL REVEALS — staggered cascade per section
  // ════════════════════════════════════════════════════════════
  function initScrollReveals() {
    if (!gsapReady || !stReady) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
      }, { threshold: 0.07, rootMargin: '0px 0px -50px 0px' });
      qsa('.reveal').forEach(el => io.observe(el));
      return;
    }

    /* ── Section heads: text splits Y + fade ── */
    qsa('.section__head').forEach(head => {
      const eyebrow = qs('.eyebrow', head);
      const h2 = qs('h2', head);
      const p = qs('p', head);
      const els = [eyebrow, h2, p].filter(Boolean);

      gsap.set(els, { opacity: 0, y: 30 });

      ScrollTrigger.create({
        trigger: head, start: 'top 83%', once: true,
        onEnter: () => {
          gsap.to(els, {
            opacity: 1, y: 0, duration: .75, ease: E_SNAP,
            stagger: .12
          });
        }
      });
    });

    /* ── Service cards: staggered wave, slight X drift ── */
    const svcs = qsa('.svc');
    if (svcs.length) {
      gsap.set(svcs, { opacity: 0, y: 44, x: -8 });
      ScrollTrigger.create({
        trigger: '.svcs', start: 'top 80%', once: true,
        onEnter: () => {
          gsap.to(svcs, {
            opacity: 1, y: 0, x: 0,
            duration: .75, ease: E_SNAP, stagger: .09
          });
        }
      });
    }

    /* ── Result blocks: slam down with scale ── */
    const results = qsa('.result');
    if (results.length) {
      gsap.set(results, { opacity: 0, y: 50, scale: .94 });
      ScrollTrigger.create({
        trigger: '.results-grid', start: 'top 82%', once: true,
        onEnter: () => {
          gsap.to(results, {
            opacity: 1, y: 0, scale: 1,
            duration: .8, ease: E_EXPO, stagger: .10
          });
        }
      });
    }

    /* ── About: cinematic split (left from left, right from right) ── */
    if (qs('.about')) {
      gsap.set('.about__media', { opacity: 0, x: -48, rotateY: 6 });
      gsap.set('.about__text', { opacity: 0, x: 48 });
      ScrollTrigger.create({
        trigger: '.about', start: 'top 76%', once: true,
        onEnter: () => {
          gsap.to('.about__media', { opacity: 1, x: 0, rotateY: 0, duration: 1.0, ease: E_SNAP });
          gsap.to('.about__text', { opacity: 1, x: 0, duration: 1.0, ease: E_SNAP, delay: .12 });
        }
      });
      /* About floater pops in after panel */
      if (qs('.about__floater')) {
        gsap.set('.about__floater', { opacity: 0, scale: .8, y: 12 });
        ScrollTrigger.create({
          trigger: '.about', start: 'top 72%', once: true,
          onEnter: () => gsap.to('.about__floater', {
            opacity: 1, scale: 1, y: 0,
            duration: .65, ease: E_SPRING, delay: .55
          })
        });
      }
    }

    /* ── Platform: perspective reveal ── */
    if (qs('.platform')) {
      gsap.set('.platform', { opacity: 0, y: 60, scale: .97, rotateX: 3 });
      ScrollTrigger.create({
        trigger: '#platform', start: 'top 78%', once: true,
        onEnter: () => gsap.to('.platform', {
          opacity: 1, y: 0, scale: 1, rotateX: 0,
          duration: 1.1, ease: E_SNAP,
          transformOrigin: 'center bottom'
        })
      });
    }

    /* ── Portfolio cards: fan-in from bottom ── */
    const pfCards = qsa('.pf-card');
    if (pfCards.length) {
      gsap.set(pfCards, { opacity: 0, y: 50, scale: .96 });
      ScrollTrigger.create({
        trigger: '.portfolio-grid', start: 'top 80%', once: true,
        onEnter: () => gsap.to(pfCards, {
          opacity: 1, y: 0, scale: 1,
          duration: .85, ease: E_SNAP, stagger: .15
        })
      });
    }

    /* ── Testimonials: slight Y + rotate stagger ── */
    const tests = qsa('.test');
    if (tests.length) {
      gsap.set(tests, { opacity: 0, y: 36, rotation: .5 });
      ScrollTrigger.create({
        trigger: '.tests', start: 'top 82%', once: true,
        onEnter: () => gsap.to(tests, {
          opacity: 1, y: 0, rotation: 0,
          duration: .78, ease: E_SNAP, stagger: .13
        })
      });
    }

    /* ── CTA box: scale from below ── */
    if (qs('.cta__box')) {
      gsap.set('.cta__box', { opacity: 0, y: 48, scale: .95 });
      ScrollTrigger.create({
        trigger: '.cta__box', start: 'top 83%', once: true,
        onEnter: () => gsap.to('.cta__box', {
          opacity: 1, y: 0, scale: 1,
          duration: 1.0, ease: E_SNAP
        })
      });
    }

    /* ── Footer: fade up ── */
    if (qs('.footer')) {
      gsap.set('.footer__brand, .footer__cols > div', { opacity: 0, y: 20 });
      ScrollTrigger.create({
        trigger: '.footer', start: 'top 88%', once: true,
        onEnter: () => gsap.to('.footer__brand, .footer__cols > div', {
          opacity: 1, y: 0,
          duration: .65, ease: E_SNAP, stagger: .09
        })
      });
    }

    /* ── Brands marquee: fade in ── */
    if (qs('.brands')) {
      gsap.set('.brands', { opacity: 0, y: 16 });
      ScrollTrigger.create({
        trigger: '.brands', start: 'top 90%', once: true,
        onEnter: () => gsap.to('.brands', { opacity: 1, y: 0, duration: .7, ease: E_SNAP })
      });
    }
  }


  // ════════════════════════════════════════════════════════════
  // § 4 · AMBIENT LOOPS — floats, orbs, glow
  // ════════════════════════════════════════════════════════════
  function initAmbientLoops() {
    if (!gsapReady) return;

    /* Kill CSS keyframe on elements GSAP will own */
    qsa('.float-card, #heroLogoImg, .hero__logo-glow, .orb-a, .orb-b').forEach(el => {
      el.style.animation = 'none';
    });

    /* Float card A */
    const cardA = qs('.float-a');
    if (cardA) gsap.to(cardA, { y: -12, x: 4, duration: 6.0, ease: E_FLOAT, yoyo: true, repeat: -1 });

    /* Float card B — offset phase */
    const cardB = qs('.float-b');
    if (cardB) gsap.to(cardB, { y: -10, x: -3, duration: 7.4, ease: E_FLOAT, yoyo: true, repeat: -1, delay: -3.2 });

    /* Hero logo float */
    const heroLogo = qs('#heroLogoImg');
    if (heroLogo) gsap.to(heroLogo, { y: -16, duration: 5.8, ease: E_FLOAT, yoyo: true, repeat: -1 });

    /* Logo glow pulse */
    const logoGlow = qs('.hero__logo-glow');
    if (logoGlow) gsap.to(logoGlow, { opacity: .38, scale: 1.10, duration: 4.2, ease: E_FLOAT, yoyo: true, repeat: -1 });

    /* About floater gentle bob */
    const floater = qs('.about__floater');
    if (floater) gsap.to(floater, { y: -5, duration: 5.0, ease: E_FLOAT, yoyo: true, repeat: -1, delay: -1.5 });

    /* Orbs */
    const orbA = qs('.orb-a');
    if (orbA) gsap.to(orbA, { x: 28, y: -22, scale: 1.05, duration: 30, ease: E_FLOAT, yoyo: true, repeat: -1 });

    const orbB = qs('.orb-b');
    if (orbB) gsap.to(orbB, { x: -20, y: 18, scale: .95, duration: 36, ease: E_FLOAT, yoyo: true, repeat: -1, delay: -15 });

    /* CTA glow breathe */
    const ctaGlow = qs('.cta__glow');
    if (ctaGlow) gsap.to(ctaGlow, { opacity: .8, scale: 1.15, duration: 5, ease: E_FLOAT, yoyo: true, repeat: -1 });
  }


  // ════════════════════════════════════════════════════════════
  // § 5 · SCROLL PARALLAX — hero + section heads
  // ════════════════════════════════════════════════════════════
  function initParallax() {
    if (!gsapReady || !stReady) {
      window.addEventListener('scroll', () => {
        const hv = qs('.hero__visual');
        if (hv) hv.style.transform = `translateY(${window.pageYOffset * 0.05}px)`;
      }, { passive: true });
      return;
    }

    /* Hero visual slow drift up on scroll */
    gsap.to('.hero__visual', {
      y: 70, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.4 }
    });

    /* Hero content faster — creates depth split */
    gsap.to('.hero__content', {
      y: 35, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.0 }
    });

    /* Orb A moves with scroll for depth */
    gsap.to('.orb-a', {
      y: 120, ease: 'none',
      scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom top', scrub: 2 }
    });

    /* Section head text subtle drift */
    qsa('.section__head h2').forEach(h2 => {
      gsap.to(h2, {
        y: -18, ease: 'none',
        scrollTrigger: {
          trigger: h2.closest('.section, section'),
          start: 'top bottom', end: 'bottom top',
          scrub: 1.5
        }
      });
    });
  }


  // ════════════════════════════════════════════════════════════
  // § 6 · MAGNETIC BUTTONS — gsap.quickTo
  // ════════════════════════════════════════════════════════════
  function initMagneticButtons() {
    if (isTouchDevice) return;
    if (!gsapReady) {
      qsa('.mag-btn').forEach(btn => {
        btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
        btn.addEventListener('mousemove', e => {
          const r = btn.getBoundingClientRect();
          btn.style.transform = `translate(${(e.clientX - (r.left + r.width / 2)) * .28}px,${(e.clientY - (r.top + r.height / 2)) * .28}px)`;
        });
      });
      return;
    }

    qsa('.mag-btn').forEach(btn => {
      const xTo = gsap.quickTo(btn, 'x', { duration: .42, ease: E_SNAP });
      const yTo = gsap.quickTo(btn, 'y', { duration: .42, ease: E_SNAP });

      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.32);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.32);
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: .65, ease: 'elastic.out(1, 0.5)' });
      });
    });

    /* Ghost buttons: subtle scale + border glow */
    qsa('.btn--ghost').forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        if (gsapReady) gsap.to(btn, { scale: 1.03, duration: .3, ease: E_SPRING });
      });
      btn.addEventListener('mouseleave', () => {
        if (gsapReady) gsap.to(btn, { scale: 1, duration: .4, ease: E_SNAP });
      });
    });
  }


  // ════════════════════════════════════════════════════════════
  // § 7 · HERO LOGO 3D TILT — gsap.quickTo
  // ════════════════════════════════════════════════════════════
  function initLogoTilt() {
    const heroLogo = qs('#heroLogoImg');
    const heroVisual = qs('.hero__visual');
    if (!heroLogo || !heroVisual || isTouchDevice || !gsapReady) return;

    gsap.set(heroVisual, { perspective: 900 });

    const ryTo = gsap.quickTo(heroLogo, 'rotateY', { duration: .55, ease: E_SNAP });
    const rxTo = gsap.quickTo(heroLogo, 'rotateX', { duration: .55, ease: E_SNAP });
    const scTo = gsap.quickTo(heroLogo, 'scale', { duration: .55, ease: E_SNAP });

    heroVisual.addEventListener('mousemove', e => {
      const r = heroVisual.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      ryTo(nx * 14);
      rxTo(-ny * 14);
      scTo(1.03);
    });

    heroVisual.addEventListener('mouseleave', () => {
      gsap.to(heroLogo, { rotateX: 0, rotateY: 0, scale: 1, duration: .9, ease: 'elastic.out(1, 0.55)' });
    });
  }


  // ════════════════════════════════════════════════════════════
  // § 8 · CARD HOVER INTERACTIONS — GSAP micro-tweens
  // ════════════════════════════════════════════════════════════
  function initCardHovers() {
    if (!gsapReady || isTouchDevice) return;

    /* Service cards: icon bounce on enter */
    qsa('.svc').forEach(card => {
      const ico = qs('.svc__ico', card);
      const arrow = qs('.svc__arrow', card);
      card.addEventListener('mouseenter', () => {
        if (ico) gsap.to(ico, { scale: 1.12, rotation: -5, duration: .35, ease: E_SPRING });
        if (arrow) gsap.to(arrow, { x: 6, duration: .3, ease: E_SNAP });
      });
      card.addEventListener('mouseleave', () => {
        if (ico) gsap.to(ico, { scale: 1, rotation: 0, duration: .4, ease: E_SNAP });
        if (arrow) gsap.to(arrow, { x: 0, duration: .35, ease: E_SNAP });
      });
    });

    /* Result cards: number scale pulse */
    qsa('.result').forEach(card => {
      const num = qs('strong', card);
      card.addEventListener('mouseenter', () => {
        if (num) gsap.to(num, { scale: 1.06, duration: .3, ease: E_SPRING });
      });
      card.addEventListener('mouseleave', () => {
        if (num) gsap.to(num, { scale: 1, duration: .35, ease: E_SNAP });
      });
    });

    /* Portfolio cards: body slide up on hover */
    qsa('.pf-card').forEach(card => {
      const body = qs('.pf-card__body', card);
      card.addEventListener('mouseenter', () => {
        if (body) gsap.to(body, { y: -3, duration: .35, ease: E_SNAP });
      });
      card.addEventListener('mouseleave', () => {
        if (body) gsap.to(body, { y: 0, duration: .4, ease: E_SNAP });
      });
    });

    /* Testimonial cards: quote mark animate */
    qsa('.test').forEach(card => {
      const avatar = qs('.avatar', card);
      card.addEventListener('mouseenter', () => {
        if (avatar) gsap.to(avatar, { scale: 1.1, duration: .3, ease: E_SPRING });
      });
      card.addEventListener('mouseleave', () => {
        if (avatar) gsap.to(avatar, { scale: 1, duration: .35, ease: E_SNAP });
      });
    });

    /* Stack cards: pop up */
    qsa('.plat__stack-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, { y: -4, scale: 1.04, duration: .3, ease: E_SPRING });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, { y: 0, scale: 1, duration: .4, ease: E_SNAP });
      });
    });
  }


  // ════════════════════════════════════════════════════════════
  // § 9 · CARD CURSOR SPOTLIGHT (CSS vars)
  // ════════════════════════════════════════════════════════════
  qsa('.svc, .result, .test, .pf-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    });
  });


  // ════════════════════════════════════════════════════════════
  // § 10 · KINETIC COUNTERS
  // ════════════════════════════════════════════════════════════
  function initCounters() {
    qsa('[data-count]').forEach(el => {
      const target = parseFloat(el.dataset.count);
      const isFloat = target % 1 !== 0;

      if (gsapReady && stReady) {
        const proxy = { val: 0 };
        ScrollTrigger.create({
          trigger: el, start: 'top 88%', once: true,
          onEnter: () => gsap.to(proxy, {
            val: target, duration: 2.2, ease: 'power2.out',
            onUpdate: () => { el.textContent = isFloat ? proxy.val.toFixed(1) : Math.round(proxy.val); },
            onComplete: () => { el.textContent = isFloat ? target.toFixed(1) : target; }
          })
        });
      } else {
        const io = new IntersectionObserver(entries => {
          entries.forEach(e => {
            if (!e.isIntersecting) return;
            const dur = 1800, start = performance.now();
            const frame = now => {
              const t = Math.min((now - start) / dur, 1), ease = 1 - Math.pow(1 - t, 3);
              el.textContent = isFloat ? (ease * target).toFixed(1) : Math.round(ease * target);
              if (t < 1) requestAnimationFrame(frame); else el.textContent = isFloat ? target.toFixed(1) : target;
            };
            requestAnimationFrame(frame);
            io.unobserve(el);
          });
        }, { threshold: 0.5 });
        io.observe(el);
      }
    });
  }


  // ════════════════════════════════════════════════════════════
  // § 11 · SCROLL PROGRESS BAR
  // ════════════════════════════════════════════════════════════
  const progressBar = document.createElement('div');
  progressBar.className = 'nx-progress';
  progressBar.style.cssText = 'position:fixed;top:0;left:0;height:2px;width:0%;background:linear-gradient(90deg,#4f7fff,#7aa3ff);z-index:9997;pointer-events:none;box-shadow:0 0 8px rgba(79,127,255,.5);transition:none';
  document.body.prepend(progressBar);

  function updateProgress() {
    const y = window.pageYOffset;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (max > 0) progressBar.style.width = (y / max * 100) + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });


  // ════════════════════════════════════════════════════════════
  // § 12 · NAV — scroll + GSAP entrance
  // ════════════════════════════════════════════════════════════
  const nav = qs('#nav');
  let prevY = 0;

  /* Nav slides in from top on load */
  if (gsapReady && nav) {
    gsap.from(nav, { y: -nav.offsetHeight, opacity: 0, duration: .8, ease: E_SNAP, delay: .3 });
  }

  window.addEventListener('scroll', () => {
    const y = window.pageYOffset;
    if (Math.abs(y - prevY) < 0.5) return;
    prevY = y;
    if (nav) nav.classList.toggle('scrolled', y > 30);
    updateProgress();
  }, { passive: true });

  /* Nav link hover: GSAP quickTo y for subtle lift */
  if (gsapReady && !isTouchDevice) {
    qsa('.nav__links a').forEach(a => {
      a.addEventListener('mouseenter', () => gsap.to(a, { y: -1.5, duration: .25, ease: E_SNAP }));
      a.addEventListener('mouseleave', () => gsap.to(a, { y: 0, duration: .35, ease: E_SNAP }));
    });
  }


  // ════════════════════════════════════════════════════════════
  // § 13 · SMOOTH ANCHOR SCROLLING
  // ════════════════════════════════════════════════════════════
  qsa('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (!id || id.length < 2) return;
      const target = qs(id);
      if (!target) return;
      e.preventDefault();
      if (gsapReady && typeof ScrollToPlugin !== 'undefined') {
        gsap.to(window, { scrollTo: { y: target, offsetY: 72 }, duration: 1.1, ease: 'power3.inOut' });
      } else {
        window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - 72, behavior: 'smooth' });
      }
      qs('#navMobile')?.classList.remove('open');
      qs('#burger')?.classList.remove('open');
    });
  });


  // ════════════════════════════════════════════════════════════
  // § 14 · BURGER
  // ════════════════════════════════════════════════════════════
  const burger = qs('#burger');
  const mobileNav = qs('#navMobile');

  burger?.addEventListener('click', () => {
    burger.classList.toggle('open');
    const isOpen = mobileNav?.classList.toggle('open');
    if (gsapReady && mobileNav) {
      if (isOpen) {
        gsap.fromTo(mobileNav, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: .3, ease: E_SNAP });
      }
    }
  });


  // ════════════════════════════════════════════════════════════
  // § 15 · THEME TOGGLE
  // ════════════════════════════════════════════════════════════
  const savedTheme = localStorage.getItem('nairu-theme') || 'dark';
  if (savedTheme === 'light') document.documentElement.classList.add('light');

  function toggleTheme() {
    const isLight = document.documentElement.classList.toggle('light');
    localStorage.setItem('nairu-theme', isLight ? 'light' : 'dark');
    /* Flash effect on toggle */
    if (gsapReady) {
      gsap.fromTo('body', { filter: 'brightness(1.15)' }, { filter: 'brightness(1)', duration: .5, ease: E_SNAP });
    }
  }
  qs('#themeToggle')?.addEventListener('click', toggleTheme);
  qs('#themeToggleMobile')?.addEventListener('click', toggleTheme);


  // ════════════════════════════════════════════════════════════
  // § 16 · SERVICE CARD RIPPLE
  // ════════════════════════════════════════════════════════════
  const kfStyle = document.createElement('style');
  kfStyle.textContent = `@keyframes sparkPulse { to { transform: scale(9); opacity: 0; } }`;
  document.head.appendChild(kfStyle);

  qsa('.svc').forEach(card => {
    card.addEventListener('click', e => {
      const r = card.getBoundingClientRect();
      const dot = document.createElement('span');
      dot.style.cssText = `
        position:absolute;border-radius:50%;pointer-events:none;
        left:${e.clientX - r.left}px;top:${e.clientY - r.top}px;
        width:12px;height:12px;margin:-6px;
        background:rgba(120,180,255,.28);
        animation:sparkPulse .55s ease-out forwards;
      `;
      card.style.position = 'relative';
      card.appendChild(dot);
      dot.addEventListener('animationend', () => dot.remove(), { once: true });
    });
  });


  // ════════════════════════════════════════════════════════════
  // § 17 · PLATFORM TABS
  // ════════════════════════════════════════════════════════════
  const platNavItems = qsa('.plat__nav-item');
  const platTabs = qsa('.plat__tab');
  const platPageTitle = qs('#platPageTitle');

  const tabTitles = {
    overview: 'Overview', clientes: 'Clientes', automacao: 'Automação',
    receita: 'Receita', relatorios: 'Relatórios', stack: 'Stack'
  };

  function switchTab(tabName) {
    platNavItems.forEach(item => item.classList.toggle('active', item.dataset.tab === tabName));
    platTabs.forEach(tab => {
      const active = tab.id === `tab-${tabName}`;
      tab.classList.toggle('active', active);
      if (active && gsapReady) {
        gsap.fromTo(tab, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .38, ease: E_SNAP });
      }
    });
    if (platPageTitle) platPageTitle.textContent = tabTitles[tabName] || tabName;
    if (tabName === 'stack') startLog();
    if (tabName === 'overview') startActivity();
  }

  platNavItems.forEach(item => item.addEventListener('click', () => switchTab(item.dataset.tab)));


  // ════════════════════════════════════════════════════════════
  // § 18 · ACTIVITY FEED
  // ════════════════════════════════════════════════════════════
  const activityEvents = [
    { t: 'ok', msg: 'Novo cliente cadastrado — Empresa Alpha' },
    { t: 'ok', msg: 'Fatura #1042 emitida — R$ 8.200' },
    { t: 'ok', msg: 'Automação "Lead → CRM" executada (1.204x)' },
    { t: 'ok', msg: 'Relatório mensal exportado — PDF' },
    { t: 'warn', msg: 'Integração ERP — aguardando validação' },
    { t: 'ok', msg: 'Deploy v2.4.1 concluído — 0 erros' },
    { t: 'ok', msg: 'WhatsApp Bot respondeu 2.100 mensagens' },
  ];

  function startActivity() {
    const list = qs('#activityList');
    if (!list) return;
    list.innerHTML = '';
    const now = new Date(), pad = n => String(n).padStart(2, '0');
    activityEvents.slice(0, 5).forEach((ev, i) => {
      const t = new Date(now - i * 8 * 60000);
      const row = document.createElement('div');
      row.className = 'activity-row';
      row.style.animationDelay = `${i * .07}s`;
      row.innerHTML = `<div class="activity-dot ${ev.t}"></div><span>${ev.msg}</span><span class="activity-time">${pad(t.getHours())}:${pad(t.getMinutes())}</span>`;
      list.appendChild(row);
    });
  }
  startActivity();


  // ════════════════════════════════════════════════════════════
  // § 19 · LIVE LOG TERMINAL
  // ════════════════════════════════════════════════════════════
  const logMessages = [
    ['[OK]', 'log-ok', 'GET /api/metrics · 200 · 8ms'],
    ['[OK]', 'log-ok', 'Redis cache hit · key=dash:uid:42'],
    ['[OK]', 'log-ok', 'PostgreSQL · rows=128 · 11ms'],
    ['[OK]', 'log-ok', 'Webhook fired · status=204'],
    ['[WARN]', 'log-warn', 'Rate limit check · ip=189.x · ok'],
    ['[OK]', 'log-ok', 'Worker done · queue=emails'],
    ['[OK]', 'log-ok', 'Deploy v2.4.1 · 0 errors'],
    ['[OK]', 'log-ok', 'Healthcheck · all services up'],
  ];
  let logIdx = 0, logTimer = null;

  function startLog() {
    const logBody = qs('#logBody');
    if (!logBody || logBody.children.length > 0) return;
    const now = new Date(), pad = n => String(n).padStart(2, '0');
    logMessages.slice(0, 4).forEach((m, i) => {
      const t = new Date(now - (3 - i) * 5000);
      const ts = `${pad(t.getHours())}:${pad(t.getMinutes())}:${pad(t.getSeconds())}`;
      const line = document.createElement('div');
      line.className = 'log-line';
      line.innerHTML = `<span class="log-time">${ts}</span><span class="${m[1]}">${m[0]}</span><span>${m[2]}</span>`;
      logBody.appendChild(line);
    });
    logIdx = 4;
    if (logTimer) clearInterval(logTimer);
    logTimer = setInterval(() => {
      const lb = qs('#logBody');
      if (!lb) { clearInterval(logTimer); return; }
      const m = logMessages[logIdx++ % logMessages.length];
      const t = new Date(), ts = `${pad(t.getHours())}:${pad(t.getMinutes())}:${pad(t.getSeconds())}`;
      const line = document.createElement('div');
      line.className = 'log-line';
      line.innerHTML = `<span class="log-time">${ts}</span><span class="${m[1]}">${m[0]}</span><span>${m[2]}</span>`;
      lb.appendChild(line);
      while (lb.children.length > 12) lb.removeChild(lb.firstChild);
      lb.scrollTop = lb.scrollHeight;
    }, 2400);
  }


  // ════════════════════════════════════════════════════════════
  // § 20 · CONTACT FORM
  // ════════════════════════════════════════════════════════════
  const phoneInput = qs('#cf-whatsapp');
  const maskPhone = v => {
    const d = v.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2) return d.length ? `(${d}` : '';
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  };
  phoneInput?.addEventListener('input', () => {
    const pos = phoneInput.selectionStart, prev = phoneInput.value.length;
    phoneInput.value = maskPhone(phoneInput.value);
    try { phoneInput.setSelectionRange(pos + phoneInput.value.length - prev, pos + phoneInput.value.length - prev); } catch (_) { }
  });

  /* Form field focus: GSAP label highlight */
  if (gsapReady) {
    qsa('.cta__field input, .cta__field textarea').forEach(input => {
      input.addEventListener('focus', () => {
        const label = input.closest('.cta__field')?.querySelector('label');
        if (label) gsap.to(label, { x: 2, duration: .2, ease: E_SPRING });
      });
      input.addEventListener('blur', () => {
        const label = input.closest('.cta__field')?.querySelector('label');
        if (label) gsap.to(label, { x: 0, duration: .25, ease: E_SNAP });
      });
    });
  }

  const contactForm = qs('#contactForm');
  const contactBtn = qs('#contactBtn');
  const contactFb = qs('#contactFeedback');

  const _webhookUrl = 'https://discord.com/api/webhooks/1508208365526978683/hIQCxkC4ZoDWFfeAayleYnoKET7ec920wju9KD8uM1LDC03dn-11z444NiK9MEhfm0-J';

  contactForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const name = (qs('#cf-name')?.value || '').trim();
    const phone = (qs('#cf-whatsapp')?.value || '').trim();
    const email = (qs('#cf-email')?.value || '').trim();
    const company = (qs('#cf-company')?.value || '').trim();
    const service = (qs('#cf-service')?.value || '').trim();
    const message = (qs('#cf-message')?.value || '').trim();

    if (contactBtn) { contactBtn.disabled = true; contactBtn.innerHTML = '<span class="nx-spinner"></span> Enviando…'; }
    if (contactFb) { contactFb.className = 'cta__feedback'; contactFb.textContent = ''; }

    try {
      const res = await fetch(_webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'NAIRU — Contato',
          embeds: [{
            title: '📬 Novo contato — NAIRU',
            color: 0x3b82f6,
            fields: [
              { name: '👤 Nome', value: name || '—', inline: true },
              { name: '📱 WhatsApp', value: phone || '—', inline: true },
              { name: '📧 E-mail', value: email || '—', inline: false },
              { name: '🏢 Empresa', value: company || '—', inline: true },
              { name: '🛠️ Tipo de projeto', value: service || '—', inline: true },
              { name: '💬 Mensagem', value: message || '—', inline: false },
            ],
            timestamp: new Date().toISOString(),
            footer: { text: 'NAIRU · Site' }
          }]
        })
      });
      if (res.ok || res.status === 204) {
        if (contactFb) { contactFb.className = 'cta__feedback ok'; contactFb.textContent = '✓ Mensagem enviada! Em breve entraremos em contato.'; }
        contactForm.reset();
        if (contactBtn) { contactBtn.textContent = 'Mensagem enviada ✓'; }
        if (gsapReady && contactBtn) gsap.fromTo(contactBtn, { scale: .95 }, { scale: 1, duration: .5, ease: E_SPRING });
      } else {
        throw new Error('status ' + res.status);
      }
    } catch (err) {
      console.error('Webhook error:', err);
      if (contactFb) { contactFb.className = 'cta__feedback err'; contactFb.textContent = 'Algo deu errado. Tente novamente ou nos chame no WhatsApp.'; }
      if (contactBtn) {
        contactBtn.innerHTML = 'Falar com a NAIRU <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        contactBtn.disabled = false;
      }
    }
  });


  // ════════════════════════════════════════════════════════════
  // § 21 · PLATFORM DATE
  // ════════════════════════════════════════════════════════════
  const platDate = qs('#platDate');
  if (platDate) {
    platDate.textContent = new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
  }


  // ════════════════════════════════════════════════════════════
  // INIT — order matters
  // ════════════════════════════════════════════════════════════

  // ════════════════════════════════════════════════════════════
  // § EXTRA · CURSOR TRAIL + SCROLL PROGRESS + CARD TILT
  // ════════════════════════════════════════════════════════════

  /* ── CURSOR GLOW — smooth mouse tracking with lerp ─────────── */
  (() => {
    const glow = qs('#cursorGlow');
    if (!glow || isTouchDevice) return;
    let cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    let tx = cx, ty = cy;
    document.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    function lerpGlow() {
      cx = lerp(cx, tx, 0.12);
      cy = lerp(cy, ty, 0.12);
      glow.style.left = cx + 'px';
      glow.style.top = cy + 'px';
      requestAnimationFrame(lerpGlow);
    }
    lerpGlow();
    /* Glow scales on interactive elements */
    document.addEventListener('mouseover', e => {
      const el = e.target;
      const isInteractive = el.closest('a, button, .bento__card, .result, .pf-card, .test, .svc, .auto-chip, .case-card');
      if (isInteractive) {
        if (gsapReady) gsap.to(glow, { scale: 1.5, opacity: 1, duration: .35, ease: 'power2.out' });
      } else {
        if (gsapReady) gsap.to(glow, { scale: 1, opacity: .85, duration: .35, ease: 'power2.out' });
      }
    }, { passive: true });
  })();

  /* ── Scroll progress bar — handled by § 11 above ── */

  // ════════════════════════════════════════════════════════════
  // § EXTRA · PROFESSIONAL GSAP MOTION SUITE
  // Techniques: word-split reveals · stagger scrub · parallax
  //             magnetic floats · orb mouse parallax · bar draw
  // ════════════════════════════════════════════════════════════

  /* ── 1. WORD SPLIT — hero title char-by-char reveal ────────
     Splits every word of hero__title into .split-word wrappers
     so GSAP can stagger each word on Y axis from below.        */
  function initWordSplit() {
    if (!gsapReady) return;
    const titleEl = qs('.hero__title');
    if (!titleEl) return;

    // Walk text nodes, wrap each word
    function wrapWords(node) {
      if (node.nodeType === 3) {
        const words = node.textContent.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        words.forEach(w => {
          if (/^\s+$/.test(w)) {
            frag.appendChild(document.createTextNode(w));
          } else if (w.length) {
            const outer = document.createElement('span');
            outer.className = 'split-word';
            const inner = document.createElement('span');
            inner.className = 'split-word-inner';
            inner.textContent = w;
            outer.appendChild(inner);
            frag.appendChild(outer);
          }
        });
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === 1 && node.nodeName !== 'SPAN') {
        [...node.childNodes].forEach(wrapWords);
      }
    }
    // Only wrap direct text nodes, leave .grad-text alone
    [...titleEl.childNodes].forEach(n => {
      if (n.nodeType === 3) wrapWords(n);
    });

    const inners = qsa('.split-word-inner', titleEl);
    gsap.set(inners, { y: '110%', opacity: 0 });
    // Animate after loader
    const unsub = () => {
      gsap.to(inners, {
        y: '0%', opacity: 1,
        duration: .9, ease: E_ENTER,
        stagger: .055,
        delay: .1
      });
    };
    document.addEventListener('heroReady', unsub, { once: true });
    // Fallback if event already fired
    if (document.body.classList.contains('hero-ready')) unsub();
  }
  initWordSplit();

  /* ── 2. SECTION DIVIDER LINES that draw in on scroll ───────  */
  if (stReady) {
    qsa('.section').forEach(sec => {
      const line = document.createElement('span');
      line.className = 'section-line';
      sec.insertBefore(line, sec.firstChild);
      gsap.set(line, { scaleX: 0, opacity: 0 });
      ScrollTrigger.create({
        trigger: sec, start: 'top 88%', once: true,
        onEnter: () => gsap.to(line, { scaleX: 1, opacity: 1, duration: 1.2, ease: 'power3.out' })
      });
    });
  }



  /* ── 4. PARALLAX DEPTH — orbs track scroll ─────────────────  */
  if (stReady) {
    const orbA = qs('.orb-a');
    const orbB = qs('.orb-b');
    if (orbA) {
      gsap.to(orbA, {
        y: -120,
        ease: 'none',
        scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 1 }
      });
    }
    if (orbB) {
      gsap.to(orbB, {
        y: 80,
        ease: 'none',
        scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 1 }
      });
    }
  }

  /* ── 5. MOUSE PARALLAX — hero visual + orbs react to cursor ─ */
  if (!isTouchDevice) {
    let heroMX = 0, heroMY = 0;
    document.addEventListener('mousemove', e => {
      heroMX = (e.clientX / window.innerWidth - .5) * 2;
      heroMY = (e.clientY / window.innerHeight - .5) * 2;
    });
    if (gsapReady) {
      gsap.ticker.add(() => {
        const heroVis = qs('.hero__visual');
        if (heroVis) {
          gsap.to(heroVis, { x: heroMX * 12, y: heroMY * 8, duration: 1.2, ease: 'power1.out', overwrite: 'auto' });
        }
        const floatA = qs('.float-a');
        const floatB = qs('.float-b');
        if (floatA) gsap.to(floatA, { x: heroMX * -18, y: heroMY * -12, duration: 1.4, ease: 'power1.out', overwrite: 'auto' });
        if (floatB) gsap.to(floatB, { x: heroMX * 22, y: heroMY * 16, duration: 1.6, ease: 'power1.out', overwrite: 'auto' });
      });
    }
  }

  /* ── 6. ABOUT PANEL BARS — animate widths in on scroll ─────  */
  if (stReady) {
    const bars = qsa('.ap-bar');
    if (bars.length) {
      ScrollTrigger.create({
        trigger: '.about', start: 'top 75%', once: true,
        onEnter: () => {
          bars.forEach((bar, i) => {
            setTimeout(() => bar.classList.add('animated'), i * 130);
          });
        }
      });
    }
  }



  /* ── 12. NAV LOGO micro-bounce on page load ──────────────────  */
  if (gsapReady) {
    setTimeout(() => {
      const navLogo = qs('.nav__logo');
      if (navLogo) gsap.fromTo(navLogo, { scale: .85, opacity: 0 }, { scale: 1, opacity: 1, duration: .6, ease: E_SPRING });
    }, 600);
  }

  /* ── 13. HERO STATS — stagger number reveal ─────────────────  */
  if (gsapReady) {
    const statEls = qsa('.hero__stats > div');
    gsap.set(statEls, { opacity: 0, y: 14, scale: .9 });
    setTimeout(() => {
      gsap.to(statEls, { opacity: 1, y: 0, scale: 1, duration: .55, ease: E_SPRING, stagger: .12 });
    }, 1800);
  }



  /* ── Accent orb in hero ────────────────────────────────────── */
  const orbAccent = document.createElement('div');
  orbAccent.className = 'bg-orb orb-accent';
  document.body.appendChild(orbAccent);

  /* ── 3D card tilt on service cards ───────────────────────── */
  if (!isTouchDevice) {
    qsa('.svc').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width - .5) * 14;
        const y = ((e.clientY - r.top) / r.height - .5) * -14;
        if (gsapReady) {
          gsap.to(card, { rotateY: x, rotateX: y, scale: 1.03, duration: .3, ease: 'power2.out', transformPerspective: 800 });
        }
      });
      card.addEventListener('mouseleave', () => {
        if (gsapReady) gsap.to(card, { rotateY: 0, rotateX: 0, scale: 1, duration: .5, ease: 'power3.out' });
      });
    });
  }



  /* ── Parallax on section backgrounds ─────────────────────── */
  if (stReady && !isTouchDevice) {
    qsa('.section').forEach(sec => {
      ScrollTrigger.create({
        trigger: sec, start: 'top bottom', end: 'bottom top', scrub: true,
        onUpdate: self => {
          const y = (self.progress - .5) * 30;
          if (gsapReady) gsap.set(sec, { backgroundPositionY: y + 'px' });
        }
      });
    });
  }



  initScrollReveals();
  initAmbientLoops();
  initMagneticButtons();
  initCardHovers();
  initLogoTilt();
  initParallax();
  // initCounters() called inside initHeroTimeline after loader

})();