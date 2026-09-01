import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
  gsap.utils.toArray('.industry-visual').forEach((visual) => {
    const bars = visual.querySelectorAll('.visual-bar');
    if (bars.length > 0) {
      gsap.from(bars, {
        scaleY: 0,
        transformOrigin: 'bottom',
        duration: 0.6,
        stagger: 0.05,
        ease: 'power2.out',
        scrollTrigger: { trigger: visual, start: 'top 85%', once: true },
      });
    }
    const pixels = visual.querySelectorAll('.visual-pixel');
    if (pixels.length > 0) {
      gsap.from(pixels, {
        scale: 0,
        duration: 0.4,
        stagger: 0.04,
        ease: 'back.out(2)',
        scrollTrigger: { trigger: visual, start: 'top 85%', once: true },
      });
    }
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
