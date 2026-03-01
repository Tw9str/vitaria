"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const t = window.localStorage.getItem("theme");
  return t === "light" ? "light" : "dark";
}

export default function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(getInitialTheme());
  }, []);

  const set = (t: Theme) => {
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("theme", t);
    setTheme(t);
  };

  const cycle = () => {
    set(theme === "dark" ? "light" : "dark");
  };

  const label = theme === "dark" ? "Dark" : "Light";
  const icon = theme === "dark" ? "🌙" : "☀️";

  return (
    <button
      type="button"
      onClick={cycle}
      className={
        className ??
        "inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-text hover:brightness-110 cursor-pointer"
      }
      aria-label="Toggle theme"
      title={`Theme: ${label}`}
    >
      <span className="text-base leading-none">{icon}</span>
      {className && <span>{label}</span>}
    </button>
  );
}
