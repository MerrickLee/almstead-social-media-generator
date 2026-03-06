import type { Metadata } from "next";
import { Manrope, Spline_Sans } from "next/font/google";
import "./globals.css";

const splineSans = Spline_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-display",
  subsets: ["latin"],
});

export const dynamic = 'force-dynamic';

import { AppShell } from "@/components/layout/shell";

export const metadata: Metadata = {
  title: "Almstead | Social Media Generation Engine",
  description: "The Preferred Expert in the Science of Landscapes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${splineSans.variable} ${manrope.variable} font-sans antialiased`}
      >
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
