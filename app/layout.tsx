import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import Header from '@/components/Header'
import './globals.css'

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-jp',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'TEJUN',
  description: '看護師向け手順書・マニュアル管理アプリ',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" className={notoSansJP.variable}>
      <body className="font-[var(--font-noto-sans-jp)] antialiased">
        <Header />
        {children}
      </body>
    </html>
  )
}
