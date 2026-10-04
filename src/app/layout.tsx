import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
import { Toaster } from "sonner";
import { getFontScaleInitScript } from "@/lib/font-scale";
import { ScrollEngineProvider } from "@/components/site-next/ScrollEngineProvider";
import { DEFAULT_MISC, getMiscSettings } from "@/lib/site-settings.functions";
import { SITE_NAME, SITE_URL, siteOpenGraph } from "@/lib/seo";
import "./globals.css";

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
});

// openGraph deliberately has no title/description: Next fills them from each
// page's own title/description. The default description is admin-editable
// (Settings → Site Meta Description).
export async function generateMetadata(): Promise<Metadata> {
  const misc = await getMiscSettings().catch(() => DEFAULT_MISC);
  return {
    metadataBase: new URL(SITE_URL),
    title: SITE_NAME,
    description: misc.meta_description || DEFAULT_MISC.meta_description,
    openGraph: await siteOpenGraph(misc),
    twitter: { card: "summary_large_image" },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: getFontScaleInitScript() }} />
      </head>
      <body className="antialiased">
        <ScrollEngineProvider />
        {children}
        <Toaster position="top-right" richColors />
        {GA4_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA4_ID}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
