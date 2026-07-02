"use client";

import { createContext, useContext, useEffect, useState, useCallback } from"react";

type Theme ="light" |"dark";

const ThemeCtx = createContext<{ theme: Theme; toggle: () => void }>({
 theme:"light",
 toggle: () => {},
});

export function useTheme() {
 return useContext(ThemeCtx);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
 const [theme, setTheme] = useState<Theme>("light");

 // Read saved preference or system preference on mount
 useEffect(() => {
 const saved = localStorage.getItem("theme") as Theme | null;
 if (saved ==="dark" || saved ==="light") {
 setTheme(saved);
 } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
 setTheme("dark");
 }
 }, []);

 // Apply/remove `dark` class on <html>
 useEffect(() => {
 const root = document.documentElement;
 if (theme ==="dark") {
 root.classList.add("dark");
 } else {
 root.classList.remove("dark");
 }
 localStorage.setItem("theme", theme);
 }, [theme]);

 const toggle = useCallback(() => {
 setTheme((prev) => (prev ==="light" ?"dark" :"light"));
 }, []);

 return (
 <ThemeCtx.Provider value={{ theme, toggle }}>
 {children}
 </ThemeCtx.Provider>
 );
}
