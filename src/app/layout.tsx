import type { Metadata } from "next";
import Link from "next/link";
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
  title: "AI Mentor Wall",
  description:
    "Post product questions, get live AI mentor answers, and keep your hackathon team unblocked.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="w-full border-b bg-white">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-2">
            <Link href="/" className="font-semibold">
              AI Mentor Wall
            </Link>
            <nav className="flex items-center gap-3">
              <Link
                href="/realtime"
                className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50"
              >
                Live view (realtime)
              </Link>
            </nav>
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}
