import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MELT — Metaphor Field-Loop Theory',
  description: 'AI-assisted metaphor analysis pipeline based on MIPVU, Musolff & Valdivia frameworks.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  )
}
