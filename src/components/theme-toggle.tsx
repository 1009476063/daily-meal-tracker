"use client";

import { useTheme } from"./theme-provider";

export function ThemeToggle() {
 const { theme, toggle } = useTheme();

 return (
 <button
 type="button"
 onClick={toggle}
 className="rounded-full border border-[#e4e5e1] dark:border-[#2d3b36] p-2 text-[#5a615c] dark:text-[#9ca3af] transition hover:border-[#b9b5a5] dark:hover:border-[#4a5a52] dark:hover:border-[#4a5a52] hover:text-[#141613] dark:hover:text-[#f0eeea] dark:hover:text-[#e8e6e0] dark:border-[#2d3b36] dark:text-[#9ca3af] dark:hover:border-[#4a5a52] dark:hover:text-[#e8e6e0]"
 title={theme ==="dark" ?"切换亮色模式" :"切换暗色模式"}
 >
 {theme ==="dark" ? (
 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
 <circle cx="12" cy="12" r="5" />
 <line x1="12" y1="1" x2="12" y2="3" />
 <line x1="12" y1="21" x2="12" y2="23" />
 <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
 <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
 <line x1="1" y1="12" x2="3" y2="12" />
 <line x1="21" y1="12" x2="23" y2="12" />
 <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
 <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
 </svg>
 ) : (
 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
 <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
 </svg>
 )}
 </button>
 );
}
