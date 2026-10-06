import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK", "opsz"],
});

const sans = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: {
    default: "Northeaster — AI trip planning for Northeast India",
    template: "%s · Northeaster",
  },
  description:
    "Intelligent, road-aware trip planning for the Seven Sisters and Sikkim. Real routes, permits, seasons and budgets across 70+ destinations from Meghalaya's living root bridges to Tawang at 10,000 ft.",
  keywords: [
    "Northeast India trip planner",
    "Meghalaya itinerary",
    "Arunachal Pradesh permit",
    "Tawang",
    "Ziro Valley",
    "Hornbill Festival",
    "Kaziranga",
    "Seven Sisters travel",
  ],
  openGraph: {
    title: "Northeaster — AI trip planning for Northeast India",
    description: "Road-aware itineraries, permits, budgets and hidden gems across the Seven Sisters.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#08110d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="bg-ink-900 text-mist-50 antialiased">{children}</body>
    </html>
  );
}
