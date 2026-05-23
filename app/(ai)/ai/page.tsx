import { createClient } from '@/lib/supabase/server'
import { AIPageClient } from './AIPageClient'

export const dynamic = 'force-dynamic'

export default async function AIPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: conversations } = await supabase
    .from('ai_conversations')
    .select('id, title, agent, is_project, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(50)

  const initial = (user.user_metadata?.full_name as string ?? user.email ?? 'U')
    .charAt(0)
    .toUpperCase()

  return (
    <AIPageClient
      initialConversations={(conversations ?? []) as {
        id: string; title: string | null; agent: string;
        is_project: boolean; updated_at: string
      }[]}
      userInitial={initial}
      userId={user.id}
    />
  )
}
