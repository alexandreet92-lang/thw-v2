'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Listens for Supabase PASSWORD_RECOVERY auth events fired client-side
// when the user follows a password reset email link.
// This catches the recovery regardless of which URL Supabase redirects to
// (site root or /auth/callback), making the flow robust without requiring
// specific redirect URL allowlist configuration in Supabase Dashboard.
export function AuthListener() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        router.push('/auth/update-password')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  return null
}
