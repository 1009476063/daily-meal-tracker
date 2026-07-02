import type { Metadata } from"next";
import"./globals.css";
import { ThemeProvider } from"@/components/theme-provider";

export const metadata: Metadata = {
 title:"Daily Meal Tracker",
 description:"Record meals and recognize nutrition with AI",
};

// Inline script to apply dark class before paint — prevents flash of wrong theme
const themeScript = `
(function(){
 try {
 var t = localStorage.getItem('theme');
 if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
 document.documentElement.classList.add('dark');
 }
 } catch(e){}
})()
`;

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
 <html lang="zh" className="h-full antialiased" suppressHydrationWarning>
 <head>
 <script dangerouslySetInnerHTML={{ __html: themeScript }} />
 </head>
 <body className="min-h-full flex flex-col">
 <ThemeProvider>{children}</ThemeProvider>
 </body>
 </html>
 );
}
