import type { Metadata } from 'next'
import './globals.css'
import SessionWrapper from '@/components/SessionWrapper'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'NIE Lost & Found',
  description: 'Lost and Found items dashboard for National Institute of Engineering, Mysore',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <SessionWrapper>
          <Navbar />
          {children}
        </SessionWrapper>
      </body>
    </html>
  )
}
