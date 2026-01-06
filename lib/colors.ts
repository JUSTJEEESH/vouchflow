/**
 * Color utility functions for brand customization
 */

/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.0 formula
 */
function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Get the best text color (black or white) for a given background color
 * Returns 'white' for dark backgrounds, 'black' for light backgrounds
 */
export function getContrastTextColor(backgroundColor: string): 'white' | 'black' {
  const luminance = getLuminance(backgroundColor);
  // Using 0.179 as threshold (based on WCAG contrast requirements)
  return luminance > 0.179 ? 'black' : 'white';
}

/**
 * Get CSS classes for text on a colored background
 */
export function getContrastTextClass(backgroundColor: string): string {
  return getContrastTextColor(backgroundColor) === 'white'
    ? 'text-white'
    : 'text-slate-900';
}

/**
 * Check if a color is light
 */
export function isLightColor(hex: string): boolean {
  return getLuminance(hex) > 0.179;
}

/**
 * Generate a slightly darker version of a color (for hover states)
 */
export function darkenColor(hex: string, percent: number = 10): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const factor = 1 - percent / 100;
  const r = Math.round(rgb.r * factor);
  const g = Math.round(rgb.g * factor);
  const b = Math.round(rgb.b * factor);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Generate a slightly lighter version of a color
 */
export function lightenColor(hex: string, percent: number = 10): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const factor = percent / 100;
  const r = Math.round(rgb.r + (255 - rgb.r) * factor);
  const g = Math.round(rgb.g + (255 - rgb.g) * factor);
  const b = Math.round(rgb.b + (255 - rgb.b) * factor);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Add alpha to a hex color
 */
export function hexWithAlpha(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}
