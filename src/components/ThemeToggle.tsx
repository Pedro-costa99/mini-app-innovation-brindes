"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia?.(
      "(prefers-color-scheme: dark)"
    ).matches;
    const enableDark = saved ? saved === "dark" : prefersDark;
    document.documentElement.classList.toggle("dark", enableDark);
    setIsDark(enableDark);
  }, []);

  function toggle() {
    const next = !isDark;
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    setIsDark(next);
  }

  return (
    <button
      onClick={toggle}
      className="rounded px-2 py-1 text-xs font-semibold text-white/95 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/70"
      aria-pressed={isDark}
      aria-label="Alternar tema"
      title={isDark ? "Tema escuro ativado" : "Tema claro ativado"}
    >
      {isDark ? "🌙" : "☀️"}
    </button>
  );
}
