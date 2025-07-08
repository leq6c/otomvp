import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers/providers'
import { GoogleAnalytics } from "@next/third-parties/google"

export const metadata: Metadata = {
  title: 'Oto',
  description: 'Oto',
  generator: "react",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
      <GoogleAnalytics gaId="G-TL3Y1ZRXLX"/>
    </html>
  )
}
