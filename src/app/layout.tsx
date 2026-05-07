import type { Metadata } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import RegisterSW from "./register-sw";
import { GoogleAnalytics } from "@next/third-parties/google";

const jetbrainsMonoHeading = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-heading",
});

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetBrains-mono",
});

const GA_ID = process.env.GA_ID;

export const metadata: Metadata = {
  title: "terminal_",
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
      className={cn(
        "h-full",
        "antialiased",
        "overflow-hidden",
        jetBrainsMono.variable,
        "font-sans",
        inter.variable,
        jetbrainsMonoHeading.variable,
        "dark",
      )}
    >
      <body className="min-h-full flex flex-col">
        <RegisterSW />
        {children}
      </body>
      {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
    </html>
  );
}
