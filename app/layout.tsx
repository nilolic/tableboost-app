import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://tableboost.app"),
  title: {
    default: "TableBoost - QR naručivanje za restorane | QR Jelovnik i KDS",
    template: "%s | TableBoost",
  },
  description: "QR naručivanje za restorane koje diže prosječni račun 27%. QR jelovnik, KDS kuhinja i aplikacija za konobare u jednom sustavu. Bez provizije, bez aplikacije za goste. Postavljanje za 15 min.",
  keywords: ["qr naručivanje", "qr jelovnik", "qr menu restoran", "digitalni jelovnik", "kds sustav kuhinja", "kuhinjski display", "aplikacija za konobare", "sustav za restorane", "qr kod naručivanje restoran", "qr narucivanje hrvatska"],
  authors: [{ name: "TableBoost", url: "https://tableboost.app" }],
  creator: "TableBoost",
  publisher: "TableBoost",
  formatDetection: { email: false, address: false, telephone: false },
  alternates: {
    canonical: "/",
    languages: { "hr-HR": "/" },
  },
  openGraph: {
    type: "website",
    locale: "hr_HR",
    url: "https://tableboost.app",
    siteName: "TableBoost",
    title: "TableBoost - QR naručivanje za restorane",
    description: "Povećaj promet 27% sa QR naručivanjem. QR jelovnik, KDS kuhinja i konobar app u jednom. Bez provizije, bez papira.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "TableBoost QR naručivanje za restorane" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TableBoost - QR naručivanje za restorane",
    description: "QR jelovnik + KDS + konobar app. +27% veći račun, -80% grešaka, 2x brži obrt stolova.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "TableBoost",
    applicationCategory: "RestaurantApplication",
    operatingSystem: "Web",
    description: "QR naručivanje za restorane - QR jelovnik, KDS kuhinja i aplikacija za konobare",
    url: "https://tableboost.app",
    inLanguage: "hr-HR",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR", description: "Bez provizije" },
    aggregateRating: { "@type": "AggregateRating", ratingValue: "5", ratingCount: "12" },
    featureList: ["QR jelovnik", "KDS kuhinjski display", "Aplikacija za konobare", "Bez provizije", "Postavljanje 15 min"],
  };

  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "TableBoost",
    url: "https://tableboost.app",
    logo: "https://tableboost.app/favicon.ico",
    contactPoint: { "@type": "ContactPoint", contactType: "customer support", availableLanguage: ["Croatian"] },
  };

  return (
    <html lang="hr">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
      </head>
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
