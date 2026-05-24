import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Noto_Sans_Ethiopic } from "next/font/google";
import { getLocale, getMessages, getTimeZone } from "next-intl/server";
import { Providers } from "@/components/providers/Providers";
import { DataInitializer } from "@/components/providers/DataInitializer";
import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const notoEthiopic = Noto_Sans_Ethiopic({
  variable: "--font-noto-ethiopic",
  subsets: ["ethiopic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Smart Parking Demo",
  description: "Offline-first smart parking demonstration app",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Smart Parking" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e8edf5" },
    { media: "(prefers-color-scheme: dark)", color: "#059669" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();
  const timeZone = await getTimeZone();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${notoEthiopic.variable}`}
    >
      <body className="min-h-screen antialiased">
        <Providers locale={locale} messages={messages} timeZone={timeZone}>
          <DataInitializer />
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
