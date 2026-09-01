import "./globals.css";
import "./studio.css";
import ClientOnly from "@/components/ClientOnly";
import Navbar from "@/components/Navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Zenith | Solar Feasibility & Subsidy Intelligence",
    template: "%s | Zenith",
  },
  description:
    "India-focused solar feasibility, financial modelling, and subsidy intelligence for households and solar businesses.",
  applicationName: "Zenith",
  keywords: [
    "solar feasibility",
    "rooftop solar",
    "solar subsidy",
    "India solar",
  ],
  openGraph: {
    title: "Zenith | Solar Feasibility & Subsidy Intelligence",
    description:
      "Model rooftop solar decisions with transparent assumptions, policy estimates, and structured outputs.",
    type: "website",
    siteName: "Zenith",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zenith | Solar Feasibility & Subsidy Intelligence",
    description:
      "Transparent rooftop solar modelling and subsidy intelligence for India.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="darkreader-lock" />
      </head>
      <body className="min-h-screen">
        <a
          href="#main-content"
          className="sr-only z-[100] rounded-md bg-emerald-400 px-4 py-2 font-semibold text-black focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <ClientOnly>
          <Navbar />
        </ClientOnly>
        {children}
      </body>
    </html>
  );
}
