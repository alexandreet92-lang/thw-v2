'use client'

interface Conversation {
  id: string
  title: string | null
  updated_at: string
  is_project: boolean
  agent: string
}

interface Props {
  conversations: Conversation[]
  activeId: string | null
  view: 'training' | 'networks' | 'projects'
  onSelect: (id: string) => void
}

function formatRelativeDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diff < 60) return "À l'instant"
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)}min`
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`
  if (diff < 86400 * 7) return `Il y a ${Math.floor(diff / 86400)}j`
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export function ConversationList({ conversations, activeId, view, onSelect }: Props) {
  const filtered = conversations.filter((c) => {
    if (view === 'projects') return c.is_project
    return c.agent === view && !c.is_project
  })

  if (filtered.length === 0) {
    return (
      <div className="px-4 py-6 text-center">
        <p className="text-xs text-white/30">Aucune conversation</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-2">
      {filtered.map((conv) => (
        <button
          key={conv.id}
          onClick={() => onSelect(conv.id)}
          className={`
            w-full text-left px-3 py-2 rounded-xl mb-0.5
            transition-colors duration-100
            ${activeId === conv.id ? 'bg-white/10' : 'hover:bg-white/5'}
          `}
        >
          <div className="flex items-start gap-2">
            {view === 'projects' && (
              <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-white/40" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2 4.5A1.5 1.5 0 013.5 3h3l1.5 1.5H12A1.5 1.5 0 0113.5 6v6A1.5 1.5 0 0112 13.5H3.5A1.5 1.5 0 012 12V4.5z" />
              </svg>
            )}
            <div className="min-w-0">
              <p className="text-sm text-white/90 truncate font-medium leading-snug">
                {conv.title ?? 'Nouvelle discussion'}
              </p>
              <p className="text-xs text-white/40 mt-0.5">
                {formatRelativeDate(conv.updated_at)}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
