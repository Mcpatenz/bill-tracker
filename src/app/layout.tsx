import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Sora } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";
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

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Mcpatenz Bill Tracker — Bill Tracking & Due Date Reminders",
    template: "%s · Mcpatenz Bill Tracker",
  },
  description:
    "Track every bill, see what is due next, and get automatic email reminders before due dates. A fast, private bill tracker for desktop, tablet, Android and iPhone.",
  applicationName: "Mcpatenz Bill Tracker",
  keywords: [
    "bill tracker",
    "bill reminder",
    "due date reminders",
    "email reminders",
    "personal finance",
    "recurring bills",
    "monthly bills",
    "subscription tracker",
    "bill organizer",
  ],
  authors: [{ name: "Mcpatenz Bill Tracker" }],
  creator: "Mcpatenz Bill Tracker",
  publisher: "Mcpatenz Bill Tracker",
  category: "finance",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Mcpatenz Bill Tracker",
    title: "Mcpatenz Bill Tracker — Bill Tracking & Due Date Reminders",
    description:
      "Never miss a due date again. Track bills, recurring payments and get automatic email reminders before they are due.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mcpatenz Bill Tracker — Bill Tracking & Due Date Reminders",
    description:
      "Track every bill and get automatic email reminders before due dates. Built for desktop and mobile.",
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
    icon: [{ url: "/favicon.ico" }],
    apple: [{ url: "/favicon.ico" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#070b14",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${sora.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-ink-950 font-sans text-slate-100 antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
