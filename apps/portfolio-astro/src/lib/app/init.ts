/**
 * Application initialization script
 * 
 * Initializes smooth scrolling and sets up the default theme.
 * This should be loaded once at the application shell level.
 */

import { initSmoothScroll } from '../scroll/engine';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Initialize the application - just smooth scroll
 */
export function initApp(defaultTheme: any): void {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initApp(defaultTheme));
    return;
  }

  // Initialize smooth scroll with more inertia
  initSmoothScroll({
    duration: 1.8, // Increased from 1.2 for more inertia
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -8 * t)), // Slower easing for more momentum
    smoothWheel: true,
    smoothTouch: false,
    wheelMultiplier: 1.2, // Increased from 1 for more momentum
    touchMultiplier: 2,
  });

  // Refresh ScrollTrigger
  setTimeout(() => {
    ScrollTrigger.refresh();
  }, 100);
}

