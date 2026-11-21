import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AUTHOR, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "../lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

type LayoutProps = {
  children: React.ReactNode;
};

const title = `${SITE_NAME} - University of Swat AI Chatbot `;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: title,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  category: "education",
  keywords: [
    "University of Swat",
    "University of Swat admission",
    "University of Swat fee structure",
    "University of Swat departments",
    "University of Swat programs",
    "Swat university chatbot",
    "unofficial AI assistant",
    "uos-ai-assistant",
    "UoS AI Assistant Swat",
    "University of Swat AI assistant",
    "University of Swat chatbot",
    "Swat university AI",
    "AI assistant",
    "AI chatbot",
    "AI assistant for University of Swat",
    "AI chatbot for University of Swat",
    "University of Swat AI chatbot",
  ],
  authors: [{ name: AUTHOR }],
  creator: AUTHOR,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    title,
    description: SITE_DESCRIPTION,
    locale: "en_PK",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/images/university-of-swat-logo.jpg",
    apple: "/images/university-of-swat-logo.jpg",
  },
  // After adding the site in Google Search Console, paste your token here:
  // verification: { google: "YOUR_TOKEN" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // lets env(safe-area-inset-*) work on notched phones
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
