import type { ThemeTokens } from './types';

/**
 * Theme Manager
 * 
 * Manages theme application through a stack-based system.
 * Multiple sections can push themes onto the stack, and the topmost
 * theme is applied. When a section exits, its theme is popped.
 * 
 * Framework-agnostic: uses plain functions and in-memory state.
 */

interface ThemeStackEntry {
  id: string;
  theme: ThemeTokens;
}

// Module-scoped theme stack
let themeStack: ThemeStackEntry[] = [];
let defaultTheme: ThemeTokens | null = null;
let currentAppliedId: string | null = null;
let rootElement: HTMLElement | null = null;

/**
 * Initialize the theme manager with the root element
 */
export function init(root: HTMLElement = document.documentElement): void {
  rootElement = root;
}

/**
 * Set the default theme that applies when the stack is empty
 */
export function setDefault(theme: ThemeTokens): void {
  defaultTheme = theme;
  if (themeStack.length === 0) {
    applyTheme(theme);
  }
}

/**
 * Push a theme onto the stack
 */
export function push(id: string, theme: ThemeTokens): void {
  // Remove any existing entry with the same id
  themeStack = themeStack.filter(entry => entry.id !== id);
  
  // Add to top of stack
  themeStack.push({ id, theme });
  
  // Apply the topmost theme
  applyTheme(themeStack[themeStack.length - 1].theme);
  currentAppliedId = id;
}

/**
 * Pop a theme from the stack by id
 */
export function pop(id: string): void {
  const beforeLength = themeStack.length;
  themeStack = themeStack.filter(entry => entry.id !== id);
  
  // If we removed something and the stack changed, apply the new top theme
  if (themeStack.length !== beforeLength) {
    if (themeStack.length > 0) {
      const topTheme = themeStack[themeStack.length - 1];
      applyTheme(topTheme.theme);
      currentAppliedId = topTheme.id;
    } else if (defaultTheme) {
      applyTheme(defaultTheme);
      currentAppliedId = null;
    }
  }
}

/**
 * Reset the stack and apply default theme
 */
export function reset(): void {
  themeStack = [];
  if (defaultTheme) {
    applyTheme(defaultTheme);
  }
  currentAppliedId = null;
}

/**
 * Get the currently applied theme id
 */
export function getCurrentId(): string | null {
  return currentAppliedId;
}

/**
 * Apply a theme to CSS variables
 * Includes defensive checks to avoid redundant writes
 */
function applyTheme(theme: ThemeTokens): void {
  const root = document.documentElement;
  
  // Set CSS variables directly - no checks, just set them
  if (theme.bg) {
    root.style.setProperty('--theme-bg', theme.bg);
  }
  
  if (theme.text) {
    root.style.setProperty('--theme-text', theme.text);
  }
  
  if (theme.accent) {
    root.style.setProperty('--theme-accent', theme.accent);
  }
  
  // Typography
  if (theme.typography) {
    const { fontFamily, fontSize, fontWeight, lineHeight, letterSpacing } = theme.typography;
    if (fontFamily) root.style.setProperty('--theme-font-family', fontFamily);
    if (fontSize) root.style.setProperty('--theme-font-size', fontSize);
    if (fontWeight) root.style.setProperty('--theme-font-weight', fontWeight);
    if (lineHeight) root.style.setProperty('--theme-line-height', lineHeight);
    if (letterSpacing) root.style.setProperty('--theme-letter-spacing', letterSpacing);
  }
  
  // Update data attribute
  if (currentAppliedId) {
    root.setAttribute('data-active-theme', currentAppliedId);
  } else {
    root.removeAttribute('data-active-theme');
  }
}

/**
 * Normalize a theme object, ensuring consistent structure
 */
export function normalizeTheme(theme?: ThemeTokens): ThemeTokens {
  if (!theme) {
    return {};
  }
  return {
    bg: theme.bg,
    text: theme.text,
    accent: theme.accent,
    typography: theme.typography
  };
}

