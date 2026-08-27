import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";
import { ConnectivityProvider } from "@/lib/connectivity/ConnectivityContext";
import { LocationProvider } from "@/lib/context/LocationContext";
import { TopBar } from "@/components/shared/TopBar";
import { PragatiAssist } from "@/components/ai/PragatiAssist";

export const metadata: Metadata = {
  title: "PRAGATI — Platform for Rural Access, Guidance & Integrated Treatment",
  description:
    "PRAGATI (Platform for Rural Access, Guidance & Integrated Treatment) connects patients in rural and underserved areas with the right public healthcare facility based on clinical need, specialist availability, diagnostics, and current OPD capacity.",
  keywords: [
    "PRAGATI healthcare India",
    "Platform for Rural Access Guidance Integrated Treatment",
    "rural healthcare access",
    "Maharashtra public health",
    "PRAGATI teleconsultation",
    "OPD live queue tracking",
    "ABHA digital health records",
  ],
  openGraph: {
    title: "PRAGATI — Find Available Care Before You Travel",
    description: "Don't just find a hospital. Find available care.",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <LanguageProvider>
          <ConnectivityProvider>
            <LocationProvider>
              <TopBar />
              {children}
              <PragatiAssist />
            </LocationProvider>
          </ConnectivityProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
