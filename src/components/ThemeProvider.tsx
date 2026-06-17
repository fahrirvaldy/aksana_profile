"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext<{
  theme: string;
  setTheme: (theme: string) => void;
}>({
  theme: "light",
  setTheme: () => {},
});

export function ThemeProvider({ 
  children,
}: { 
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<string>("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setThemeState(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  const setTheme = (newTheme: string) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

export default ThemeProvider;
