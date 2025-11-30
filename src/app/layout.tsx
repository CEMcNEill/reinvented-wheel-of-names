import type { Metadata } from "next";
import { Outfit, Inter, Limelight, Cinzel_Decorative, Anton, VT323 } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const limelight = Limelight({
  weight: "400",
  variable: "--font-limelight",
  subsets: ["latin"],
});

const cinzel = Cinzel_Decorative({
  weight: ["400", "700"],
  variable: "--font-cinzel",
  subsets: ["latin"],
});

const anton = Anton({
  weight: "400",
  variable: "--font-anton",
  subsets: ["latin"],
});

const vt323 = VT323({
  weight: "400",
  variable: "--font-vt323",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wheel of Names - Reinvented",
  description: "The ultimate random selector for teams. Spin the wheel, pick a winner!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${inter.variable} ${limelight.variable} ${cinzel.variable} ${anton.variable} ${vt323.variable} antialiased font-sans`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
