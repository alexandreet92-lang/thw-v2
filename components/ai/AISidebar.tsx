'use client'

import { LogoShuriken } from '@/components/ui/LogoShuriken'
import { NavItem } from './NavItem'
import { ConversationList } from './ConversationList'

type View = 'training' | 'networks' | 'projects'

interface Conversation {
  id: string
  title: string | null
  updated_at: string
  is_project: boolean
  agent: string
}

interface Props {
  view: View
  setView: (v: View) => void
  conversations: Conversation[]
  activeConvId: string | null
  userInitial: string
  onSelectConversation: (id: string) => void
  onNewConversation: () => void
  onClose?: () => void
}

function ProjectsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 5.5A1.5 1.5 0 013.5 4h4l1.5 1.5H14A1.5 1.5 0 0115.5 7v7A1.5 1.5 0 0114 15.5H3.5A1.5 1.5 0 012 14V5.5z" />
    </svg>
  )
}

function NetworksIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="9" cy="9" r="2.5" />
      <circle cx="3" cy="4" r="2" />
      <circle cx="15" cy="4" r="2" />
      <circle cx="3" cy="14" r="2" />
      <circle cx="15" cy="14" r="2" />
      <path strokeLinecap="round" d="M5 5.5l2.5 2M10.5 5.5L13 3.5M5 12.5l2.5-2M10.5 12.5L13 14.5" />
    </svg>
  )
}

export function AISidebar({
  view, setView, conversations, activeConvId,
  userInitial, onSelectConversation, onNewConversation, onClose,
}: Props) {
  return (
    <div className="flex flex-col h-full bg-[#1A1A1A] w-[260px] flex-shrink-0">
      {/* Zone haute */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-[28px] font-semibold tracking-tight text-white leading-none">
            Hybrid
          </h1>
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-full bg-[#3A3A3A]
                         flex items-center justify-center
                         text-sm font-medium text-white
                         cursor-pointer hover:bg-[#444] transition-colors"
            >
              {userInitial}
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center
                           text-white/40 hover:text-white hover:bg-white/5 transition-colors lg:hidden"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-3 pb-4">
        <NavItem
          icon={<ProjectsIcon />}
          label="Projets"
          onClick={() => setView('projects')}
          active={view === 'projects'}
        />
        <NavItem
          icon={<LogoShuriken size={18} color="#2563EB" />}
          label="Training"
          onClick={() => setView('training')}
          active={view === 'training'}
        />
        <NavItem
          icon={<NetworksIcon />}
          label="Networks"
          onClick={() => setView('networks')}
          active={view === 'networks'}
        />
      </nav>

      {/* Séparateur + label */}
      <div className="px-5 pt-1 pb-2">
        <p className="text-xs font-medium text-white/40 uppercase tracking-wider">
          Récents
        </p>
      </div>

      {/* Liste conversations */}
      <ConversationList
        conversations={conversations}
        activeId={activeConvId}
        view={view}
        onSelect={onSelectConversation}
      />

      {/* Bouton nouvelle conversation */}
      <div className="px-4 pb-6 pt-3">
        <button
          onClick={onNewConversation}
          className="
            w-full h-12
            bg-white text-[#1A1A1A]
            rounded-full
            flex items-center justify-center gap-2
            text-sm font-semibold
            shadow-lg
            hover:bg-white/90
            active:scale-[0.98]
            transition-all duration-150
          "
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Nouvelle conversation
        </button>
      </div>
    </div>
  )
}
