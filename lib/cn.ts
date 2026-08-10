/**
 * Minimal class-name joiner — filters falsy values so conditional classes
 * (`cond && "..."`) can be passed inline. Zero-dependency; the design system
 * is small and self-owned, so no tailwind-merge conflict resolution is needed.
 */
export type ClassValue = string | number | false | null | undefined;

export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
