'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AISidebar } from '@/components/ai/AISidebar'
import { ChatArea } from '@/components/ai/ChatArea'

type View = 'training' | 'networks' | 'projects'
type Agent = 'training' | 'networks'

interface Conversation {
  id: string
  title: string | null
  agent: string
  is_project: boolean
  updated_at: string
}

interface Props {
  initialConversations: Conversation[]
  userInitial: string
  userId: string
}

export function AIPageClient({ initialConversations, userInitial, userId }: Props) {
  const [view, setView] = useState<View>('training')
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations)
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const activeAgent: Agent = view === 'networks' ? 'networks' : 'training'

  const handleNewConversation = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('ai_conversations')
      .insert({ user_id: userId, agent: activeAgent, title: null })
      .select()
      .single()
    if (data) {
      setConversations((prev) => [data as Conversation, ...prev])
      setActiveConvId(data.id)
    }
    setSidebarOpen(false)
  }, [userId, activeAgent])

  const handleSelectConversation = useCallback((id: string) => {
    setActiveConvId(id)
    setSidebarOpen(false)
  }, [])

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Sidebar desktop — toujours visible lg+ */}
      <div className="hidden lg:flex">
        <AISidebar
          view={view}
          setView={setView}
          conversations={conversations}
          activeConvId={activeConvId}
          userInitial={userInitial}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
        />
      </div>

      {/* Sidebar mobile — overlay */}
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40 lg:hidden sidebar-backdrop-open"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Sidebar */}
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden sidebar-open">
            <AISidebar
              view={view}
              setView={setView}
              conversations={conversations}
              activeConvId={activeConvId}
              userInitial={userInitial}
              onSelectConversation={handleSelectConversation}
              onNewConversation={handleNewConversation}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </>
      )}

      {/* Zone de chat */}
      <ChatArea
        agent={activeAgent}
        conversationId={activeConvId}
        onOpenSidebar={() => setSidebarOpen(true)}
        onNewConversation={handleNewConversation}
      />
    </div>
  )
}
