import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { AuthWrapper } from "@/components/AuthWrapper";
import { Navbar } from "@/components/Navbar";
import { request } from "@arcjet/next";
import { aj } from "@/lib/arcjet";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "UniSearch - Find Your Dream US University",
    template: "%s | UniSearch",
  },
  description: "The ultimate platform for international students to discover and apply to undergraduate universities in the United States.",
  keywords: ["university search", "US colleges", "international students", "study in USA", "college application", "common app", "financial aid"],
  openGraph: {
    title: "UniSearch - Find Your Dream US University",
    description: "The ultimate platform for international students to discover and apply to undergraduate universities in the United States.",
    url: "https://unisearch.com",
    siteName: "UniSearch",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UniSearch - Find Your Dream US University",
    description: "The ultimate platform for international students to discover and apply to undergraduate universities in the United States.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const req = await request();
  const decision = await aj.protect(req);

  if (decision.isDenied()) {
    return (
      <html lang="en">
        <body>
          <h1>Forbidden</h1>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <AuthWrapper>
            <div className="pb-24">
              {children}
            </div>
            <Navbar />
          </AuthWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
