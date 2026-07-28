import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "TableBoost - QR naručivanje za restorane",
  description: "Povećaj promet 30% sa QR naručivanjem. Bez provizije.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hr">
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
