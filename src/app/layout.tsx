import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pulso PyME — ANTEL · Empresas Uruguayas Inteligentes",
  description:
    "Autodiagnóstico anónimo de adaptabilidad organizacional para PyMEs uruguayas. 22 preguntas, 12 a 15 minutos, kit de conversación descargable.",
  openGraph: {
    title: "Pulso PyME — ANTEL",
    description:
      "Diagnóstico gratuito y anónimo para PyMEs uruguayas. Una iniciativa de ANTEL en el marco de Empresas Uruguayas Inteligentes.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
