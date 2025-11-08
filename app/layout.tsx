import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Contractor Management System',
  description: 'Manage plumber contractors, attendance, and payments',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
