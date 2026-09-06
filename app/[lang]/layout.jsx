import { Manrope } from "next/font/google";
import { Suspense } from "react";
import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import { VISITED_LANDING_COOKIE } from "@/lib/constants";
import "../globals.css";
import { Providers } from "@/store/providers";
import { Toaster } from "@/components/ui/sonner";
import { getSystemSettings } from "@/lib/server/bootstrap";
import { getCurrentLanguageData } from "@/lib/server/bootstrap";
import { getCategoriesData } from "@/lib/server/bootstrap";
import { getLocationCookie } from "@/lib/server/locationCookie";
import AppBootstrap from "@/components/layout/AppBootstrap";
import MaintenanceScreen from "@/components/layout/MaintenanceScreen";
import Header from "@/app/[lang]/_components/Header";
import Footer from "@/components/layout/Footer";
import ScrollToTopButton from "@/components/layout/ScrollToTopButton";
import AnalyticsLoader from "@/components/layout/AnalyticsLoader";
import AdSenseLoader from "@/components/adsense/AdSenseLoader";
import { CookieBanner } from "@/components/layout/CookieBanner";
import Loader from "@/components/common/Loader";

const manrope = Manrope({
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

export const generateMetadata = async ({ params }) => {
  const { lang } = await params;
  const settings = await getSystemSettings(lang);
  const favicon = settings?.data?.favicon_icon;

  return {
    title: process.env.NEXT_PUBLIC_META_TITLE,
    description: process.env.NEXT_PUBLIC_META_DESCRIPTION,
    keywords: process.env.NEXT_PUBLIC_META_kEYWORDS,
    icons: favicon ? { icon: favicon } : undefined,
    openGraph: {
      title: process.env.NEXT_PUBLIC_META_TITLE,
      description: process.env.NEXT_PUBLIC_META_DESCRIPTION,
      keywords: process.env.NEXT_PUBLIC_META_kEYWORDS,
    },
  };
};

// Crawlers carry no visited cookie; redirecting them would deindex home.
const BOT_UA = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora link preview|whatsapp|telegrambot|discordbot|pinterest|vkshare/i;

async function LayoutContent({ lang, children }) {
  const settings = await getSystemSettings(lang);
  const normalizedLang = lang?.toLowerCase();

  // First-visit home → landing. Runs before Header/Footer render, so only the
  // Suspense Loader paints before the redirect — no content flash.
  const reqHeaders = await headers();
  const pathname = reqHeaders.get("x-pathname") || ""; // set by proxy.js
  const rest = pathname.replace(new RegExp(`^/${normalizedLang}(?=/|$)`), "");
  const isHome = rest === "" || rest === "/";
  const isBot = BOT_UA.test(reqHeaders.get("user-agent") || "");
  if (isHome && !isBot && Number(settings?.data?.show_landing_page) === 1) {
    const visitedLanding = (await cookies()).get(VISITED_LANDING_COOKIE);
    if (!visitedLanding) {
      const defaultLang = settings?.data?.default_language?.toLowerCase();
      redirect(normalizedLang === defaultLang ? "/landing" : `/${lang}/landing`);
    }
  }

  const [languageData, categoryData, cityData] = await Promise.all([
    getCurrentLanguageData(lang),
    getCategoriesData(lang),
    getLocationCookie(),
  ]);
  const primaryColor = settings?.data?.web_theme_color;
  const isMaintenanceMode = Number(settings?.data?.web_maintenance_mode ?? 0) === 1;

  return (
    <Providers settings={settings} languageData={languageData} categoryData={categoryData}>
      {primaryColor && (
        <style>{`:root{--primary:${primaryColor}}`}</style>
      )}
      {isMaintenanceMode ? (
        <MaintenanceScreen />
      ) : (
        <AppBootstrap data={settings} languageData={languageData}>
          <div className="flex flex-col min-h-screen">
            <Header cityData={cityData} />
            <div className="flex-1">
              {children}
            </div>
            <Footer />
            <ScrollToTopButton />
            <AnalyticsLoader />
            <AdSenseLoader />
            <CookieBanner />
          </div>
          <Toaster position="top-center" theme="light" closeButton={true} />
        </AppBootstrap>
      )}
    </Providers>
  );
}

export default async function LangLayout({ children, params }) {
  const { lang } = await params;
  const normalizedLang = lang?.toLowerCase();

  return (
    <html
      lang={normalizedLang}
      web-version={process.env.NEXT_PUBLIC_WEB_VERSION}
      data-scroll-behavior="smooth"
    >
      <body className={`${manrope.className} pointer-events-auto! overflow-x-hidden`}>
        <div
          id="scroll-sentinel"
          className="absolute top-0 h-1 w-1 opacity-0 pointer-events-none"
        />
        <Suspense fallback={<Loader />}>
          <LayoutContent lang={lang}>{children}</LayoutContent>
        </Suspense>
      </body>
    </html>
  );
}