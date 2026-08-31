import type { Metadata } from "next";
import { Nunito, Rubik, JetBrains_Mono, Unbounded } from "next/font/google";
import { RevealManager } from "@/components/RevealManager";
import { AuthProvider } from "@/lib/auth";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: ["600", "700", "800", "900"],
});

/* характерный дисплейный шрифт только для логотипа SAQ */
const unbounded = Unbounded({
  variable: "--font-wordmark",
  subsets: ["latin", "cyrillic"],
  weight: ["700", "800", "900"],
});

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: {
    default: "SAQ — финансовый защитник",
    template: "%s",
  },
  description:
    "SAQ (қаржы қорғаушысы) — платформа против финансовых пирамид: ИИ-ассистент Aqyl, сообщество наводок, проверка по десяткам открытых источников и школа финансовой защиты для взрослых и детей.",
  keywords: ["SAQ", "Aqyl", "финансовые пирамиды", "OSINT", "финансовая грамотность", "risk score"],
  openGraph: {
    title: "SAQ — финансовый защитник",
    description:
      "Спросите Aqyl — один запрос, десятки открытых источников, прозрачное досье с risk score. Плюс сообщество и школа финансовой защиты.",
    type: "website",
    locale: "ru_RU",
    siteName: "SAQ",
  },
  twitter: {
    card: "summary_large_image",
    title: "SAQ — финансовый защитник",
    description:
      "ИИ-ассистент Aqyl против финансовых пирамид: проверка, сообщество, обучение.",
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
      suppressHydrationWarning
      className={`${nunito.variable} ${rubik.variable} ${jetbrainsMono.variable} ${unbounded.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') || 'dark';
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              })();
            `
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-bg text-ink">
        <div className="blob-field" aria-hidden>
          <div className="blob-field-spot" />
        </div>
        <RevealManager />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
