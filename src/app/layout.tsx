import type { Metadata } from "next";
import { Lato, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const lato = Lato({ subsets: ["latin"], weight: ["400", "700"], variable: '--font-lato' });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["600", "700", "800"], variable: '--font-plus-jakarta' });

export const metadata: Metadata = {
  title: "Tradevu Dashboard | Real-time Metrics",
  description: "Enterprise-grade performance monitoring and launch readiness dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${lato.variable} ${plusJakarta.variable} font-body antialiased`}>
        {children}
      </body>
    </html>
  );
}
