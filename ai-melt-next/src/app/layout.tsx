import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppThemeProvider } from "@/components/theme/AppThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Melt - Document Analysis",
  description: "Advanced document analysis and metaphor identification system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppThemeProvider>
          {children}
        </AppThemeProvider>
      </body>
    </html>
  );
}
