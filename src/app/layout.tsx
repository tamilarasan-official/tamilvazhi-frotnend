import type { Metadata, Viewport } from "next";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Tamilvazhi";

export const metadata: Metadata = {
  title: {
    default: `${siteName} — Course Library`,
    template: `%s · ${siteName}`,
  },
  description:
    "Watch course videos and download study materials. Enter your course access code to begin.",
  // Course material is paid content behind an access code — keep it out of search results.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#1f3f68",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col antialiased">
        <div className="flex flex-1 flex-col">{children}</div>
        <SiteFooter siteName={siteName} />
      </body>
    </html>
  );
}
