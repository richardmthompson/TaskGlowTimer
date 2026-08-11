import type { ComponentPropsWithoutRef } from "react";
import { clsx } from "clsx";

/**
 * Keyboard-shortcut chip. DESIGN.md §5 names the kbd chip as first-class
 * furniture; this centralizes the single hand-rolled markup that was repeated
 * across the meta strip, empty-state hints, and the help panel.
 *
 * NB: uses `clsx` (join only), NOT `cn`/tailwind-merge. The base carries the
 * custom `border-thin` width utility, which tailwind-merge misreads as a color
 * and would drop next to `border-border` — silently removing the chip border.
 * Padding lives in the `size` variant (not the base) so the wide help-panel
 * chip has no px collision to resolve. Result: byte-identical class sets to the
 * original literals.
 */
const KBD_BASE =
  "rounded-code border-thin border-border bg-card shadow-neo-sm text-foreground";

const KBD_SIZE = {
  sm: "px-1.5 py-0.5",
  wide: "min-w-[80px] px-2 py-1 text-[10px] font-mono text-center flex-shrink-0",
} as const;

interface KbdProps extends ComponentPropsWithoutRef<"kbd"> {
  size?: keyof typeof KBD_SIZE;
}

export function Kbd({ size = "sm", className, ...props }: KbdProps) {
  return <kbd className={clsx(KBD_BASE, KBD_SIZE[size], className)} {...props} />;
}
