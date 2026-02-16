/**
 * Theme utility functions and color configurations
 */

export const themeColors = {
  light: {
    primary: 'oklch(0.45 0.22 262)',
    secondary: 'oklch(0.65 0.18 32)',
    background: 'oklch(0.98 0.001 0)',
    foreground: 'oklch(0.15 0.01 0)',
    card: 'oklch(1 0 0)',
    muted: 'oklch(0.92 0.01 0)',
  },
  dark: {
    primary: 'oklch(0.62 0.24 262)',
    secondary: 'oklch(0.72 0.16 35)',
    background: 'oklch(0.11 0.012 265)',
    foreground: 'oklch(0.97 0.005 265)',
    card: 'oklch(0.16 0.015 265)',
    muted: 'oklch(0.22 0.015 265)',
  },
};

/**
 * Get theme-aware class names
 */
export const getThemeClasses = (baseClasses, darkClasses) => {
  return `${baseClasses} dark:${darkClasses}`;
};

/**
 * Card classes with dark mode support
 */
export const cardClasses = {
  base: 'bg-card text-card-foreground rounded-lg border border-border shadow-sm transition-all duration-200',
  hover: 'hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-primary/5',
  elevated: 'shadow-lg dark:shadow-xl dark:shadow-primary/10',
};

/**
 * Button classes with dark mode support
 */
export const buttonClasses = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90 dark:shadow-md dark:shadow-primary/20',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
  ghost: 'hover:bg-muted dark:hover:bg-muted/50',
  outline: 'border border-border hover:bg-muted dark:hover:bg-muted/50',
};

/**
 * Input classes with dark mode support
 */
export const inputClasses = {
  base: 'bg-input border-border focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30',
};

/**
 * Badge classes with dark mode support
 */
export const badgeClasses = {
  primary: 'badge-primary',
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
};

/**
 * Apply theme immediately
 */
export const applyTheme = (theme) => {
  const html = document.documentElement;
  if (theme === 'dark') {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
};

/**
 * Get system theme preference
 */
export const getSystemTheme = () => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

/**
 * Listen for system theme changes
 */
export const watchSystemTheme = (callback) => {
  if (typeof window === 'undefined') return () => {};
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = (e) => callback(e.matches ? 'dark' : 'light');
  
  mediaQuery.addEventListener('change', handler);
  return () => mediaQuery.removeEventListener('change', handler);
};
