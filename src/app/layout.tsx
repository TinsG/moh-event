import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { EVENT_CONFIG } from "@/constants/constants";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${EVENT_CONFIG.DEFAULT_EVENT_NAME} - Registration & QR System`,
  description: `${EVENT_CONFIG.DEFAULT_EVENT_NAME} - Comprehensive event management system with QR code registration, attendance tracking, and real-time reporting.`,
  keywords: ["event management", "QR code", "registration", "attendance tracking", "MOH"],
  authors: [{ name: "JLink Digital Solution", url: "https://jlinkdigital.com" }],
  creator: "JLink Digital Solution",
  publisher: "JLink Digital Solution",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  robots: {
    index: false, // Prevent indexing for internal event system
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <meta name="theme-color" content="#1e40af" />
        <meta name="msapplication-TileColor" content="#1e40af" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        {children}

        <footer className="bottom-0 w-full bg-white border-t py-2 text-center text-sm text-gray-600">
          Powered by{' '}
          <a
            href="https://jlinkdigital.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            JLink Digital Solution
          </a>
        </footer>
      </body>
    </html>
  );
}
