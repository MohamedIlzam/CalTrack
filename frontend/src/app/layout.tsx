import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "CalTrack Sri Lanka",
  description: "The easiest calorie tracker for Sri Lankan food.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}>
      {/* Background is gray, outer wrapper centers the inner "mobile" app */}
      <body className="flex justify-center min-h-screen bg-gray-100">
        <main className="w-full max-w-md bg-surface min-h-screen shadow-2xl relative flex flex-col overflow-hidden border-x border-gray-200">
          {children}
        </main>
      </body>
    </html>
  );
}
