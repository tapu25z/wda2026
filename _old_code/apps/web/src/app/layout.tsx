import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { APP_NAME, APP_DESCRIPTION } from "@agri-scan/shared";
import { Providers } from "./providers";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <CartProvider>{children}</CartProvider>
        </Providers>
      </body>
    </html>
  );
}
