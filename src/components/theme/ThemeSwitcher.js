"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { FiSun, FiMoon } from "react-icons/fi";

export default function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <button
      className="fixed bottom-4 right-4 p-3 bg-card border border-border rounded-full z-50 shadow-lg hover:bg-accent hover:text-accent-foreground transition-colors"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      title={
        theme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"
      }
    >
      {theme === "dark" ? (
        <FiSun className="w-5 h-5 text-foreground" />
      ) : (
        <FiMoon className="w-5 h-5 text-foreground" />
      )}
    </button>
  );
}
