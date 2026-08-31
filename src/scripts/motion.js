import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  // Final state is already the default markup — nothing to animate, nothing to undo.
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

  // ---- Stat and service card entrance (layered on top of the existing fade-in observer) ----
  const cardGroups = document.querySelectorAll('.stats-section .grid, .grid-2 .card, .service-summary-card');
  if (cardGroups.length > 0) {
    gsap.utils.toArray('.stat.card, .service-summary-card').forEach((card, i) => {
      gsap.from(card, {
        opacity: 0,
        y: 20,
        scale: 0.97,
        duration: 0.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
        delay: (i % 4) * 0.06,
      });
    });
  }

  // ---- Magnetic hover on primary CTA buttons (desktop pointer only) ----
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.btn--primary').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(btn, { x: x * 0.2, y: y * 0.3, duration: 0.3, ease: 'power2.out' });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.4, ease: 'power2.out' });
      });
    });
  }
}
