import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { SiteFooter } from "@/components/footer";
import { SiteHeader, TabBar } from "@/components/nav";
import { ServiceWorkerRegister } from "@/components/sw-register";
import { SITE } from "@/lib/site";
import "./globals.css";

const archivo = localFont({
  src: "./fonts/archivo-latin-wdth-normal.woff2",
  variable: "--font-archivo",
  weight: "100 900",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Aurora Studios · Tecnología que impulsa tus ideas",
    template: "%s · Aurora Studios",
  },
  description: SITE.description,
  applicationName: "Aurora Studios",
  appleWebApp: { capable: true, title: "Aurora Studios", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    locale: "es_419",
    siteName: "Aurora Studios",
    url: SITE.url,
    title: "Aurora Studios · Tecnología que impulsa tus ideas",
    description: SITE.description,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#0e0d13",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={archivo.variable}>
      <body className="min-h-dvh overflow-x-clip">
        <a
          href="#contenido"
          className="sr-only z-[70] rounded-full bg-sun px-4 py-2 font-bold text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Saltar al contenido
        </a>
        <SiteHeader />
        <main id="contenido">{children}</main>
        <SiteFooter />
        <TabBar />
        <div className="grain" aria-hidden />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
