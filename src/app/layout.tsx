import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
})

export const metadata: Metadata = {
title: "Mise - AI Recipe Platform",
description: "Turn your leftovers into masterpieces. AI-powered recipes from what's in your fridge.",
icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: [
      { url: "/apple-touch-icon.png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#E8520A",
          colorBackground: "#FDFAF7",
          borderRadius: "0.75rem",
        },
      }}
    >
      <html lang="en">
        <body
          className={`${inter.className} ${playfair.variable} bg-background text-foreground min-h-screen flex flex-col`}
        >
          <Header />
          <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </main>
          <footer className="border-t border-border px-4 py-6 sm:px-6 lg:px-8">
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} Mise. All rights reserved.
              </p>
              <p className="text-sm text-muted-foreground">
                Made with ❤️ for Bhukkad&apos;s
              </p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}