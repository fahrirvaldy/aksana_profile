"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setTimeout(() => setMounted(true), 0);
  }, []);

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-black dark:border-transparent text-black dark:text-slate-50 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
      aria-label="Toggle theme"
    >
      {mounted ? (
        theme === "dark" ? <Sun size={20} /> : <Moon size={20} />
      ) : (
        <div className="w-5 h-5" /> // Placeholder to prevent layout shift
      )}
    </button>
  );
}
