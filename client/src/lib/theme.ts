export type Theme = "light" | "dark";

/**
 * Single source of truth for theme application. Mirrors the previous inline
 * logic that lived (duplicated) in ThemeToggle and the timer Shift+M handler:
 * toggles the `dark` class on <html> based on the resolved theme.
 */
export function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function getStoredTheme(): Theme {
  return (localStorage.getItem("theme") as Theme | null) ?? "light";
}

/**
 * Flip the theme, persist it, and apply it. Returns the new theme.
 * `current` lets a caller derive the flip from its own state (ThemeToggle uses
 * its React state); when omitted, the current theme is read from the DOM (the
 * Shift+M keyboard path). Behavior is identical to the prior inline handlers.
 */
export function toggleTheme(current?: Theme): Theme {
  const cur: Theme =
    current ?? (document.documentElement.classList.contains("dark") ? "dark" : "light");
  const next: Theme = cur === "light" ? "dark" : "light";
  localStorage.setItem("theme", next);
  applyTheme(next);
  return next;
}
