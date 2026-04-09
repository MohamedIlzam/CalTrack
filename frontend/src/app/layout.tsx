import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // extends into the notch / safe areas
  themeColor: "#129B7F",
};

export const metadata: Metadata = {
  title: "CalTrack",
  description: "The easiest calorie tracker for Sri Lankan food.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CalTrack",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}>
      <body className="flex justify-center min-h-[100dvh] bg-gray-100">
        <main className="w-full max-w-md bg-surface min-h-[100dvh] shadow-2xl relative flex flex-col overflow-x-hidden overflow-y-auto border-x border-gray-200 safe-area-inset">
          {children}
        </main>
      </body>
    </html>
  );
}
