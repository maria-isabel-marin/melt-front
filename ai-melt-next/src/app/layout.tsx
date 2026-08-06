import type { Metadata } from 'next'
import './globals.css'
import { I18nProvider } from '@/components/i18n/I18nProvider'
import { getRequestLocale } from '@/i18n/server'

export const metadata: Metadata = {
  title: 'MELT — Metaphor Field-Loop Theory',
  description:
    'AI-assisted metaphor analysis pipeline based on MIPVU, Musolff & Valdivia frameworks.',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getRequestLocale()

  return (
    <html lang={locale}>
      <body className="bg-gray-50 text-gray-900 antialiased">
        <I18nProvider initialLocale={locale}>
          {children}
        </I18nProvider>
      </body>
    </html>
  )
}
