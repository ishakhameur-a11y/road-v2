import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-context";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Road",
  description: "رفيقك في الإنجاز",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Road",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f4f6" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1018" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <ThemeProvider>
          <div className="mx-auto flex min-h-dvh max-w-md flex-col">
            <main className="flex-1 pb-24">{children}</main>
            <BottomNav />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
