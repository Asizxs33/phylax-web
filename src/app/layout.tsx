import type { Metadata } from "next";
import { Fraunces, Work_Sans, Space_Mono } from "next/font/google";
import { RevealManager } from "@/components/RevealManager";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: {
    default: "Phylax — страж против финансовых пирамид",
    template: "%s",
  },
  description:
    "OSINT-платформа для расследования финансовых пирамид и мошеннических схем: единый запрос, десятки публичных источников, прозрачный risk score.",
  keywords: ["OSINT", "финансовые пирамиды", "threat intelligence", "risk score", "Phylax"],
  openGraph: {
    title: "Phylax — страж против финансовых пирамид",
    description:
      "Один запрос — десятки открытых источников — прозрачное досье с risk score.",
    type: "website",
    locale: "ru_RU",
    siteName: "Phylax",
  },
  twitter: {
    card: "summary_large_image",
    title: "Phylax — страж против финансовых пирамид",
    description:
      "OSINT-платформа для расследования финансовых пирамид и мошеннических схем.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${fraunces.variable} ${workSans.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-ink">
        <div className="blob-field" aria-hidden>
          <div className="blob-field-spot" />
        </div>
        <RevealManager />
        {children}
      </body>
    </html>
  );
}
