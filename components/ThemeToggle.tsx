"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "worthit:theme";

function storedTheme(): Theme | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw === "light" || raw === "dark" ? raw : null;
  } catch {
    return null;
  }
}

function systemTheme(): Theme {
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeToggle() {
  // Starts null so the server and the first client render agree. Rendering a
  // specific theme here would be a guess, and a wrong guess is the hydration
  // mismatch this project already hit once with country names.
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const initial = storedTheme() ?? systemTheme();
    // localStorage and matchMedia don't exist during the static export's
    // build-time render, so this cannot move into a lazy useState initialiser.
    // Doing so would bake a guessed theme into the prerendered HTML and
    // hydrate to a different one — the same mismatch class as the country
    // names bug. The placeholder above covers the gap until this runs.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(initial);
    document.documentElement.dataset.theme = initial;
  }, []);

  function choose(next: Theme) {
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* the page still works, the choice just won't persist */
    }
  }

  // Until the effect runs we don't know the theme, so render a same-sized
  // placeholder rather than flashing the wrong icon.
  if (theme === null) {
    return <div className="h-9 w-[4.5rem]" aria-hidden="true" />;
  }

  const next: Theme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => choose(next)}
      aria-label={`Switch to ${next} mode`}
      className="inline-flex h-9 items-center gap-2 rounded-full border border-rule bg-card px-3 text-xs text-graphite transition-colors hover:border-graphite/60 hover:text-ink"
    >
      <span aria-hidden="true" className="text-sm leading-none">
        {theme === "dark" ? "☾" : "☀"}
      </span>
      <span className="eyebrow text-inherit">{theme}</span>
    </button>
  );
}
