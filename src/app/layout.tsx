import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HubSpot CRM Simulator',
  description: 'Generate realistic CRM data for your HubSpot sandbox',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center p-4">
        {children}
      </body>
    </html>
  )
}
