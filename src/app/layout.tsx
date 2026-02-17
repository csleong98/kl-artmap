import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata: Metadata = {
  title: "KL Art Map - Discover Street Art in Kuala Lumpur",
  description: "Interactive map for discovering street art, galleries, and cultural spaces in Kuala Lumpur",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${GeistSans.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
