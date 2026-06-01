import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'

const ribeyeMarrow = localFont({
  src: './fonts/RibeyeMarrow-Regular.ttf',
  variable: '--font-display',
  display: 'swap',
})

const ribeye = localFont({
  src: './fonts/Ribeye-Regular.ttf',
  variable: '--font-grape',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'MOO².TW｜手作耳飾',
  description: '微光傾瀉, 仿佛整片夜空都在你耳邊墜落',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW" className={`${ribeyeMarrow.variable} ${ribeye.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;500;600;700&family=Zen+Maru+Gothic:wght@300;400;500;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
