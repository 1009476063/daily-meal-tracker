import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daily Meal Tracker",
  description: "Record meals and recognize nutrition with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
