/**
 * Theme palette contract
 * Defines the structure for theme configuration objects
 */
export interface ThemeTokens {
  bg?: string;
  text?: string;
  accent?: string;
  typography?: {
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
    letterSpacing?: string;
  };
}

/**
 * Normalized theme with all properties guaranteed
 */
export interface NormalizedTheme extends Required<Omit<ThemeTokens, 'typography'>> {
  typography: Required<NonNullable<ThemeTokens['typography']>>;
}

