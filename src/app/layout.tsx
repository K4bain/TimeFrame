import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SkipNav } from "@/components/accessibility";
import { TRPCProvider } from "@/lib/api/provider";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Timeframe — Explore Internet History",
    template: "%s | Timeframe",
  },
  description: "Explore how websites evolve through time. Browse archived snapshots, compare versions, and discover the history of the web.",
  keywords: ["internet archive", "wayback machine", "web history", "website evolution", "archive browser"],
  authors: [{ name: "Timeframe" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Timeframe",
    title: "Timeframe — Explore Internet History",
    description: "Explore how websites evolve through time. Browse archived snapshots, compare versions, and discover the history of the web.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Timeframe — Explore Internet History",
    description: "Explore how websites evolve through time. Browse archived snapshots, compare versions, and discover the history of the web.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="antialiased">
        <TRPCProvider>
          <SkipNav />
          <div id="main-content">{children}</div>
        </TRPCProvider>
      </body>
    </html>
  );
}
