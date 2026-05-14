import type { Metadata } from 'next'
import './globals.css'
import { AuthListener } from '@/components/AuthListener'

export const metadata: Metadata = {
  title: 'THW – Coaching',
  description: 'Plateforme de gestion des candidatures coaching',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="antialiased">
          <AuthListener />
          {children}
        </body>
    </html>
  )
}
