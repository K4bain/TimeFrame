import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
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

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz", "SOFT", "WONK"],
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read the per-request CSP nonce from middleware (SEC.1)
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} ${fraunces.variable}`}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        {nonce && (
          <meta name="csp-nonce" content={nonce} />
        )}
      </head>
      <body className="antialiased tf-grain">
        <TRPCProvider>
          <SkipNav />
          <main id="main-content">{children}</main>
        </TRPCProvider>
      </body>
    </html>
  );
}
