'use client'

import { EmptyState } from './EmptyState'
import { AIHeader } from './AIHeader'

type Agent = 'training' | 'networks'

interface Props {
  agent: Agent
  conversationId: string | null
  onOpenSidebar: () => void
  onNewConversation: () => void
}

export function ChatArea({ agent, conversationId, onOpenSidebar, onNewConversation }: Props) {
  return (
    <div className="flex flex-col flex-1 min-w-0 bg-white h-full">
      <AIHeader
        agent={agent}
        onOpenSidebar={onOpenSidebar}
        onNewConversation={onNewConversation}
      />

      {conversationId ? (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <p className="text-sm">Conversation {conversationId.slice(0, 8)}…</p>
        </div>
      ) : (
        <EmptyState agent={agent} />
      )}

      {/* Zone de saisie */}
      <div className="px-4 pb-6 pt-3 border-t border-gray-100">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-end gap-3 bg-gray-50 rounded-2xl px-4 py-3 border border-gray-200 focus-within:border-gray-400 transition-colors">
            <textarea
              rows={1}
              placeholder="Envoyer un message…"
              className="flex-1 bg-transparent text-sm text-[#0A0A0A] placeholder-gray-400
                         resize-none focus:outline-none leading-relaxed"
              style={{ maxHeight: 200 }}
              onInput={(e) => {
                const t = e.currentTarget
                t.style.height = 'auto'
                t.style.height = `${t.scrollHeight}px`
              }}
            />
            <button
              className="w-8 h-8 rounded-xl bg-[#0A0A0A] flex items-center justify-center
                         text-white hover:bg-gray-800 active:scale-95 transition-all flex-shrink-0"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 12V2M3 6l4-4 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
