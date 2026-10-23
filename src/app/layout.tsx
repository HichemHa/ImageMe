import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    "Tu n'as pas besoin de trouver les mots. Explore ce que tu ressens et donne-lui une forme, en images.",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0d0c11",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
