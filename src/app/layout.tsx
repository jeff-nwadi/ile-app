import type { Metadata } from "next";
import { Fraunces, Inter, Space_Mono, Geist } from "next/font/google";
import "./globals.css";
import "./landing.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Ilé — Fine Dining, Lagos",
  description:
    "A tasting house built around the produce of the Niger Delta and the grammar of West African flavor.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "scroll-smooth", "antialiased", fraunces.variable, inter.variable, spaceMono.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-full overflow-x-hidden bg-ivory text-charcoal">
        {children}
      </body>
    </html>
  );
}
