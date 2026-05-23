import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AILayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  return (
    <div className="h-screen w-screen overflow-hidden">
      {children}
    </div>
  )
}
