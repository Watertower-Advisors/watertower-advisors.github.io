import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const lenis = new Lenis({ duration: 0.8, wheelMultiplier: 1.1 });

  // Drive Lenis from GSAP's own ticker (instead of a separate rAF loop) so
  // it and ScrollTrigger share one clock and never drift apart, and tell
  // ScrollTrigger to recompute on every Lenis tick, not the native scroll
  // event Lenis intercepts. Without this, a scrubbed effect (the hero
  // parallax) reads a stale scroll position and feels a beat behind the
  // page, which is what "heavy" scrolling actually is.
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}
