import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

// One family; the width axis sets the clock apart from running text.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

export const metadata: Metadata = {
  title: "FocusTrack",
  description: "Personal work intelligence and execution tracker",
};

export const viewport: Viewport = {
  // Lets the mobile tab bar pad itself clear of the home indicator.
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f8fa" },
    { media: "(prefers-color-scheme: dark)", color: "#06161c" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
