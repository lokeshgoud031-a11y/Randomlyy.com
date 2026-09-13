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
  title: "Randomlyy.com | Stranger Chat and Random Video Chat",
  description: "Randomlyy.com helps you meet strangers online for random video chat, voice conversations, and live translation.",
  keywords: [
    "stranger chat",
    "random chat",
    "random video chat",
    "meet strangers online",
    "global conversation",
    "live translation chat",
    "Randomlyy.com",
  ],
  openGraph: {
    title: "Randomlyy.com | Stranger Chat and Random Video Chat",
    description: "Meet new people around the world through random video chat, voice conversations, and live translation.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
