/**
 * Lightweight className merger — joins truthy strings, no extra deps needed.
 */
export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}
