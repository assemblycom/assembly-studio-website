import type { Metadata } from "next";
import { RootShell } from "@/components/layout/root-shell";
import "./globals.css";

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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full font-sans">
        <RootShell>{children}</RootShell>
      </body>
    </html>
  );
}
