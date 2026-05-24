import type { Metadata } from 'next'
import { Syne, DM_Sans } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '500', '600', '700', '800'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm',
  weight: ['300', '400', '500'],
})

export const metadata: Metadata = {
  title: 'Marine Minds 29 · AFM Department',
  description:
    'The official class platform for Marine Minds 29, Department of Aquaculture and Fisheries Management. Connect, confess, celebrate.',
  keywords: ['Marine Minds 29', 'AFM', 'Aquaculture', 'Fisheries Management', 'Class Platform'],
  openGraph: {
    title: 'Marine Minds 29',
    description: 'One ocean, one crew.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
      <body className="bg-ocean-deep text-white font-dm antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'rgba(6, 32, 64, 0.95)',
              color: '#f0f8ff',
              border: '1px solid rgba(0,212,255,0.3)',
              backdropFilter: 'blur(20px)',
              borderRadius: '12px',
              fontFamily: 'var(--font-dm)',
            },
            success: { iconTheme: { primary: '#00ffcc', secondary: '#020b18' } },
            error:   { iconTheme: { primary: '#ff6b9d', secondary: '#020b18' } },
          }}
        />
      </body>
    </html>
  )
}
