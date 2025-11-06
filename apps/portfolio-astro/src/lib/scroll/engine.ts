/**
 * Smooth Scroll Engine
 * 
 * Integrates Lenis smooth scrolling with GSAP ScrollTrigger.
 * Provides a single instance that proxies scroll positions and emits
 * tick events for theme controllers and telemetry consumers.
 */

import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

type ScrollTickCallback = (scrollData: {
  scroll: number;
  limit: number;
  velocity: number;
  direction: 'up' | 'down';
  progress: number;
}) => void;

let lenisInstance: Lenis | null = null;
let tickCallbacks: Set<ScrollTickCallback> = new Set();
let rafId: number | null = null;
let isInitialized = false;

/**
 * Initialize the smooth scroll engine
 */
export function initSmoothScroll(options?: {
  duration?: number;
  easing?: (t: number) => number;
  orientation?: 'vertical' | 'horizontal';
  gestureOrientation?: 'vertical' | 'horizontal';
  smoothWheel?: boolean;
  smoothTouch?: boolean;
  touchMultiplier?: number;
  wheelMultiplier?: number;
}): void {
  if (isInitialized || typeof window === 'undefined') {
    return;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Disable smooth scroll if user prefers reduced motion
  if (prefersReducedMotion) {
    isInitialized = true;
    return;
  }

  lenisInstance = new Lenis({
    duration: options?.duration ?? 1.2,
    easing: options?.easing ?? ((t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))),
    orientation: options?.orientation ?? 'vertical',
    gestureOrientation: options?.gestureOrientation ?? 'vertical',
    smoothWheel: options?.smoothWheel ?? true,
    smoothTouch: options?.smoothTouch ?? false,
    touchMultiplier: options?.touchMultiplier ?? 2,
    wheelMultiplier: options?.wheelMultiplier ?? 1,
  });

  // Proxy ScrollTrigger to use Lenis scroll position
  lenisInstance.on('scroll', ScrollTrigger.update);

  // Configure ScrollTrigger to use Lenis
  ScrollTrigger.scrollerProxy(document.body, {
    scrollTop(value) {
      if (arguments.length) {
        lenisInstance!.scrollTo(value, { immediate: true });
      }
      return lenisInstance!.scroll;
    },
    scrollHeight: () => document.documentElement.scrollHeight,
    getBoundingClientRect() {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };
    },
  });

  // Start the animation loop
  function raf(time: number) {
    lenisInstance?.raf(time);
    
    // Emit tick events to subscribers
    if (lenisInstance) {
      const scroll = lenisInstance.scroll;
      const limit = lenisInstance.limit;
      const velocity = lenisInstance.velocity;
      const direction = velocity > 0 ? 'down' : 'up';
      const progress = limit > 0 ? scroll / limit : 0;

      tickCallbacks.forEach(callback => {
        callback({
          scroll,
          limit,
          velocity: Math.abs(velocity),
          direction,
          progress,
        });
      });
    }
    
    rafId = requestAnimationFrame(raf);
  }

  rafId = requestAnimationFrame(raf);

  // Refresh ScrollTrigger when layout changes
  const refreshScrollTrigger = () => {
    ScrollTrigger.refresh();
  };

  // Debounce resize events
  let resizeTimeout: ReturnType<typeof setTimeout>;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(refreshScrollTrigger, 150);
  });

  // Refresh on orientation change
  window.addEventListener('orientationchange', refreshScrollTrigger);

  isInitialized = true;
}

/**
 * Subscribe to scroll tick events
 */
export function onScrollTick(callback: ScrollTickCallback): () => void {
  tickCallbacks.add(callback);
  
  // Return unsubscribe function
  return () => {
    tickCallbacks.delete(callback);
  };
}

/**
 * Get the current Lenis instance
 */
export function getLenisInstance(): Lenis | null {
  return lenisInstance;
}

/**
 * Scroll to a target (element or position)
 */
export function scrollTo(
  target: number | string | HTMLElement,
  options?: {
    offset?: number;
    duration?: number;
    easing?: (t: number) => number;
    immediate?: boolean;
    lock?: boolean;
    force?: boolean;
    lerp?: number;
    onComplete?: () => void;
  }
): void {
  if (!lenisInstance) {
    return;
  }

  lenisInstance.scrollTo(target, options);
}

/**
 * Refresh ScrollTrigger (call when layout changes)
 */
export function refresh(): void {
  if (lenisInstance) {
    ScrollTrigger.refresh();
  }
}

/**
 * Stop smooth scrolling and clean up
 */
export function destroy(): void {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  if (lenisInstance) {
    lenisInstance.destroy();
    lenisInstance = null;
  }

  tickCallbacks.clear();
  isInitialized = false;
}

/**
 * Check if smooth scroll is initialized
 */
export function isReady(): boolean {
  return isInitialized && lenisInstance !== null;
}

