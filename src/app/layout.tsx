import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { RootShell } from "@/components/layout/root-shell";
import "./globals.css";

// Inter is used for the app-like UI rendered inside the template preview cards
// (labels, values, chips) so they read as real product UI rather than the
// marketing PP Mori face. Exposed as a CSS variable, applied only where needed.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Assembly Studio",
    template: "%s | Assembly Studio",
  },
  description:
    "The AI app builder for client-facing experiences. Build apps that ship to your client portal — no code, no infrastructure, no developer required.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased ${inter.variable}`}>
      <body className="min-h-full font-sans">
        <RootShell>{children}</RootShell>
      </body>
    </html>
  );
}
