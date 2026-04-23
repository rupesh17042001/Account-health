/**
 * Pre-defined brand color palette.
 * Colors are assigned in order as brands are created.
 */
const BRAND_COLORS = [
  '#ff6b2b', // orange
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f59e0b', // amber
  '#22c55e', // green
  '#06b6d4', // cyan
  '#e11d48', // rose
  '#6366f1', // indigo
  '#84cc16', // lime
  '#f97316', // tangerine
];

/**
 * Get a color from the palette by index.
 */
export function getBrandColor(index: number): string {
  return BRAND_COLORS[index % BRAND_COLORS.length];
}

/**
 * Generate 2-char avatar initials from a brand name.
 */
export function getBrandAvatar(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export { BRAND_COLORS };
