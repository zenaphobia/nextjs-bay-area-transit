import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetBrains-mono",
});

export const metadata: Metadata = {
  title: "Bay Area Transit",
  description:
    "View and plan destinations around the San Francisco area using the Bay Area Rapid Transit",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jetBrainsMono.variable} h-full antialiased overflow-hidden`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
