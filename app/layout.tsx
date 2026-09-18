import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Randomlyy Chat with Strangers | Talk to People Worldwide",
  description:
    "Randomlyy is a random chat platform to meet and chat with strangers worldwide using live video, voice chat, and real-time translation.",
  keywords: [
    "Randomlyy",
    "Randomlyy chat",
    "chat with strangers",
    "random chat",
    "random video chat",
    "talk to strangers",
    "meet strangers online",
    "video chat with strangers",
    "voice chat with strangers",
    "random video call",
  ],
  metadataBase: new URL("https://randomlyy.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Randomlyy Chat with Strangers",
    description:
      "Connect globally · Speak locally. Meet and chat with people around the world.",
    url: "https://randomlyy.com",
    siteName: "Randomlyy",
    type: "website",
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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}