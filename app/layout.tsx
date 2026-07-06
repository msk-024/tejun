import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP } from "next/font/google";
import Header from "@/components/Header";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tejun.vercel.app"),
  title: {
    default: "TEJUN - 看護師向け手順書・マニュアル管理",
    template: "%s | TEJUN",
  },
  description: "看護師向け手順書・マニュアル管理アプリ",
  applicationName: "TEJUN",
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "TEJUN",
    title: "TEJUN - 看護師向け手順書・マニュアル管理",
    description: "看護師向け手順書・マニュアル管理アプリ",
  },
  twitter: {
    card: "summary_large_image",
    title: "TEJUN - 看護師向け手順書・マニュアル管理",
    description: "看護師向け手順書・マニュアル管理アプリ",
  },
};

export const viewport: Viewport = {
  themeColor: "#2d6a4f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={notoSansJP.variable}>
      <body className="font-[var(--font-noto-sans-jp)] antialiased">
        <Header />
        {children}
      </body>
    </html>
  );
}
