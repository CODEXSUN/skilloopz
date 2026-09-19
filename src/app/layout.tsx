import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Providers } from "@/app/providers";
import { AnalyticsScripts } from "@/components/analytics/analytics-scripts";
import { getAnalyticsConfig } from "@/lib/analytics";

export const dynamic = "force-dynamic";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "skilloopz | Learn. Practice. Get Placed.",
  description:
    "Expert-led programs that prepare learners for high-growth careers.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const analyticsConfig = await getAnalyticsConfig();

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var mode = localStorage.getItem('neot-theme-mode');
                  if (mode === 'light') {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                  } else {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
        <AnalyticsScripts config={analyticsConfig} />
      </body>
    </html>
  );
}
