import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProviders } from "@/components/providers/AppProviders";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('http://learnity-app.vercel.app'),
  title: {
    default: "Learnity - Online Tutoring & Learning Platform | Connect with Expert Tutors",
    template: "%s | Learnity"
  },
  description: "Learn faster with expert online tutors on Learnity. Join 1000+ active learners and 500+ verified tutors. Personalized 1-on-1 tutoring, study groups, and enterprise-grade security. Start learning today!",
  keywords: [
    "online tutoring",
    "online learning platform",
    "expert tutors",
    "personalized learning",
    "study groups",
    "1-on-1 tutoring",
    "online education",
    "e-learning",
    "virtual tutoring",
    "learn online",
    "private tutor",
    "educational platform"
  ],
  authors: [{ name: "Learnity Team" }],
  creator: "Learnity",
  publisher: "Learnity",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "http://learnity-app.vercel.app",
    siteName: "Learnity",
    title: "Learnity - Online Tutoring & Learning Platform | Connect with Expert Tutors",
    description: "Learn faster with expert online tutors on Learnity. Join 1000+ active learners and 500+ verified tutors. Personalized 1-on-1 tutoring, study groups, and enterprise-grade security.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Learnity - Online Learning Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Learnity - Online Tutoring & Learning Platform",
    description: "Learn faster with expert online tutors. Join 1000+ learners and 500+ verified tutors on Learnity.",
    images: ["/twitter-image.png"],
    creator: "@learnity",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png" },
    ],
  },
  manifest: "/site.webmanifest",
  verification: {
    google: "your-google-verification-code",
  },
  alternates: {
    canonical: "http://learnity-app.vercel.app",
  },
  category: "education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#2563eb" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProviders>
          {children}
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
