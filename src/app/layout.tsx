import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { Nav } from "@/components/Nav";

const instrument = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GRWM — stop wondering what to wear",
  description:
    "GRWM knows your wardrobe, your plans and your world — and builds the fit. Shop your wardrobe before shopping the internet.",
};

export const viewport: Viewport = {
  themeColor: "#f6f4ef",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${instrument.variable} ${inter.variable}`}>
      <body className="min-h-dvh antialiased">
        <ConvexClientProvider>
          <Nav />
          <main className="pb-32">{children}</main>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
