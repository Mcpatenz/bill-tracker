import type { Metadata } from "next";
import { LandingNav } from "@/components/landing/landing-nav";
import { Hero } from "@/components/landing/hero";
import { AndroidDownload } from "@/components/landing/android-download";
import { StatsStrip } from "@/components/landing/stats-strip";
import { Features } from "@/components/landing/features";
import { Showcase } from "@/components/landing/showcase";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";
import { getSiteStats } from "@/lib/site-stats";

export const dynamic = "force-dynamic";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "Mcpatenz Bill Tracker — Bill Tracking & Due Date Reminders",
  description:
    "Track bills, subscriptions and recurring payments in one calm dashboard. Mcpatenz Bill Tracker sends automatic email reminders to your Gmail or any address before due dates. Free, private and built for every device.",
  alternates: { canonical: "/" },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Mcpatenz Bill Tracker",
    url: siteUrl,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web, iOS, Android, Windows, macOS",
    browserRequirements: "Requires JavaScript",
    description:
      "A smart bill tracker that organizes bills and sends automatic email reminders before due dates.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "PHP",
    },
    featureList: [
      "Bill tracking",
      "Automatic email reminders",
      "Recurring bills",
      "Spending insights",
      "Multi-device support",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do email reminders work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Mcpatenz Bill Tracker checks bills daily and emails you when a bill enters the reminder window you choose, including the amount and due date.",
        },
      },
      {
        "@type": "Question",
        name: "Can I use my Gmail address?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Any email address can receive Mcpatenz Bill Tracker reminders, including Gmail. Self-hosted instances can connect Gmail through SMTP with an App Password.",
        },
      },
      {
        "@type": "Question",
        name: "Does Mcpatenz Bill Tracker work on phones and tablets?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The interface is responsive across desktops, laptops, tablets, Android phones and iPhones.",
        },
      },
      {
        "@type": "Question",
        name: "Can I track recurring bills?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Weekly, monthly and yearly bills roll forward automatically when marked as paid.",
        },
      },
    ],
  },
];

export default async function HomePage() {
  const stats = await getSiteStats();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-violet focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <LandingNav />
      <main id="main">
        <Hero stats={stats} />
        <AndroidDownload />
        <StatsStrip stats={stats} />
        <Features />
        <Showcase />
        <HowItWorks />
        <Faq />
        <FinalCta />
      </main>

      <Footer />
    </>
  );
}
