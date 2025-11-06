/**
 * Theme Switcher - Inline, Direct, Works
 */

(function() {
  function initThemeSwitcher() {
    // Get all sections with theme data
    const sections = Array.from(document.querySelectorAll('[data-theme-section]'))
      .map(el => {
        const id = el.getAttribute('data-theme-section');
        const json = el.getAttribute('data-theme');
        if (!id || !json) return null;
        try {
          return {
            id,
            el: el as HTMLElement,
            theme: JSON.parse(json)
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean) as Array<{ id: string; el: HTMLElement; theme: any }>;

    if (sections.length === 0) {
      console.warn('[ThemeSwitcher] No sections found');
      return;
    }

    console.log('[ThemeSwitcher] Found', sections.length, 'sections');

    // Set initial theme from first section
    const first = sections[0];
    if (first.theme.bg) {
      document.documentElement.style.setProperty('--theme-bg', first.theme.bg);
      console.log('[ThemeSwitcher] Set initial bg:', first.theme.bg);
    }
    if (first.theme.text) {
      document.documentElement.style.setProperty('--theme-text', first.theme.text);
    }
    if (first.theme.accent) {
      document.documentElement.style.setProperty('--theme-accent', first.theme.accent);
    }

    let currentId: string | null = null;

    // Update theme based on scroll position
    function updateTheme() {
      const center = window.innerHeight / 2;
      let closest = Infinity;
      let target: typeof sections[0] | null = null;

      sections.forEach(section => {
        const rect = section.el.getBoundingClientRect();
        const elCenter = rect.top + rect.height / 2;
        const dist = Math.abs(center - elCenter);

        if (rect.top < window.innerHeight && rect.bottom > 0 && dist < closest) {
          closest = dist;
          target = section;
        }
      });

      if (target && target.id !== currentId) {
        console.log('[ThemeSwitcher] Switching to:', target.id, target.theme);
        // Apply theme directly
        if (target.theme.bg) {
          document.documentElement.style.setProperty('--theme-bg', target.theme.bg);
        }
        if (target.theme.text) {
          document.documentElement.style.setProperty('--theme-text', target.theme.text);
        }
        if (target.theme.accent) {
          document.documentElement.style.setProperty('--theme-accent', target.theme.accent);
        }
        currentId = target.id;
      }
    }

    // Listen to scroll
    window.addEventListener('scroll', updateTheme, { passive: true });

    // Also listen to Lenis if available (check periodically)
    function checkLenis() {
      const lenis = (window as any).lenis;
      if (lenis && lenis.on) {
        lenis.on('scroll', updateTheme);
        console.log('[ThemeSwitcher] Connected to Lenis');
      } else {
        setTimeout(checkLenis, 100);
      }
    }
    checkLenis();

    // Initial update
    updateTheme();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeSwitcher);
  } else {
    // Wait a bit to ensure all components are rendered
    setTimeout(initThemeSwitcher, 100);
  }
})();
