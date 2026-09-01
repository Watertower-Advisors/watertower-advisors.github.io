import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  // Final state is already the default markup, nothing to animate, nothing to undo.
} else {
  // ---- Hero headline stagger reveal ----
  const heroInner = document.querySelector('.hero__inner');
  if (heroInner) {
    const heroChildren = heroInner.children;
    gsap.from(heroChildren, {
      opacity: 0,
      y: 24,
      duration: 0.6,
      stagger: 0.12,
      ease: 'power2.out',
    });
  }

  // ---- Hero metrics: stroke draw-in ----
  const metricBars = document.querySelectorAll('.hero-metrics__bar');
  if (metricBars.length > 0) {
    metricBars.forEach((bar) => {
      const length = bar.getTotalLength();
      gsap.set(bar, { strokeDasharray: length, strokeDashoffset: length });
      gsap.to(bar, {
        strokeDashoffset: 0,
        duration: 0.9,
        delay: 0.4,
        ease: 'power2.inOut',
      });
    });
  }

  // ---- Hero background parallax (scroll-scrubbed, own property, no conflict with other animations) ----
  const heroSection = document.querySelector('.hero--image');
  if (heroSection) {
    gsap.to(heroSection, {
      backgroundPositionY: '35%',
      ease: 'none',
      scrollTrigger: {
        trigger: heroSection,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  }

  // ---- Industry sector visuals: line draw-in, bar grow, pixel pop-in ----
  gsap.utils.toArray('.visual-draw').forEach((el) => {
    const length = el.getTotalLength ? el.getTotalLength() : 0;
    if (!length) return;
    gsap.set(el, { strokeDasharray: length, strokeDashoffset: length });
    gsap.to(el, {
      strokeDashoffset: 0,
      duration: 1,
      ease: 'power2.inOut',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  });
  // Continuous ambient motion (pulsing nodes, rippling rings, the equalizer
  // bars, the blinking window dots, the twinkling pixel grid) is pure CSS
  // (see IndustryVisual.astro) — it never shares a property with anything
  // GSAP touches here, by design, after the last round's bug.

  // ---- Aerospace: a craft (plus a fading comet trail behind it) travels the flight path ----
  gsap.utils.toArray('.visual-orbit-dot').forEach((dot) => {
    const path = dot.closest('svg')?.querySelector(dot.dataset.path);
    if (!path) return;
    const duration = 3.2;
    gsap.to(dot, {
      motionPath: { path, align: path, alignOrigin: [0.5, 0.5] },
      duration,
      repeat: -1,
      ease: 'power1.inOut',
      // A negative delay starts the tween partway into its own cycle, so
      // the trailing dots are always a beat behind the leader on the same path.
      delay: -duration * Number(dot.dataset.lag || 0),
      scrollTrigger: { trigger: dot.closest('.industry-visual'), start: 'top 85%', once: true },
    });
  });

  // ---- Robotics: a real cascading arm — rotating the shoulder group carries
  // the elbow and wrist with it, exactly like a jointed arm, not three
  // independently-spinning lines ----
  gsap.utils.toArray('.industry-visual').forEach((visual) => {
    const shoulder = visual.querySelector('#visual-joint-shoulder');
    const elbow = visual.querySelector('#visual-joint-elbow');
    const wrist = visual.querySelector('#visual-joint-wrist');
    if (!shoulder || !elbow || !wrist) return;
    const tl = gsap.timeline({
      repeat: -1,
      yoyo: true,
      defaults: { ease: 'sine.inOut', duration: 2.2 },
      scrollTrigger: { trigger: visual, start: 'top 85%', once: true },
    });
    tl.to(shoulder, { rotation: 8 }, 0)
      .to(elbow, { rotation: -14 }, 0)
      .to(wrist, { rotation: 10 }, 0.3);
  });

  // ---- Creator economy: audience orbits the creator, content bursts outward ----
  gsap.utils.toArray('.visual-orbit-group').forEach((group) => {
    gsap.to(group, {
      rotation: 360,
      duration: 9,
      repeat: -1,
      ease: 'none',
      transformOrigin: 'center',
      scrollTrigger: { trigger: group.closest('.industry-visual'), start: 'top 85%', once: true },
    });
  });
  gsap.utils.toArray('.visual-burst').forEach((particle) => {
    const angle = (Number(particle.dataset.angle) * Math.PI) / 180;
    gsap.fromTo(
      particle,
      { x: 0, y: 0, opacity: 1, scale: 1 },
      {
        x: Math.cos(angle) * 90,
        y: Math.sin(angle) * 90,
        opacity: 0,
        scale: 0.3,
        duration: 1.8,
        repeat: -1,
        delay: Number(particle.dataset.delay || 0),
        ease: 'power1.out',
        scrollTrigger: { trigger: particle.closest('.industry-visual'), start: 'top 85%', once: true },
      }
    );
  });

  // ---- Magnetic hover on primary CTA buttons (desktop pointer only) ----
  // The inline transform GSAP writes here overrides the CSS
  // .btn--primary:hover translateY(-2px) rule (inline style specificity),
  // so the -2px lift is folded into these tweens instead of left to CSS.
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.btn--primary').forEach((btn) => {
      btn.addEventListener('mouseenter', () => {
        gsap.to(btn, { y: -2, duration: 0.3, ease: 'power2.out' });
      });
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(btn, { x: x * 0.2, y: y * 0.3 - 2, duration: 0.3, ease: 'power2.out' });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.4, ease: 'power2.out' });
      });
    });
  }

  // Recalculate trigger positions once images/fonts have settled the final
  // layout, so a trigger point measured too early can't get stuck unfired.
  window.addEventListener('load', () => ScrollTrigger.refresh());
}
