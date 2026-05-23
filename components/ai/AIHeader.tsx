'use client'

import { LogoShuriken } from '@/components/ui/LogoShuriken'

type Agent = 'training' | 'networks'

const AGENT_CONFIG: Record<Agent, { label: string; color: string }> = {
  training: { label: 'Training', color: '#2563EB' },
  networks: { label: 'Networks', color: '#7C3AED' },
}

interface Props {
  agent: Agent
  onOpenSidebar: () => void
  onNewConversation: () => void
  onExpand?: () => void
  onClose?: () => void
}

export function AIHeader({ agent, onOpenSidebar, onNewConversation, onExpand, onClose }: Props) {
  const { label, color } = AGENT_CONFIG[agent] ?? AGENT_CONFIG.training

  return (
    <header className="h-12 flex items-center px-4 relative border-b border-gray-100 bg-white flex-shrink-0">
      {/* Hamburger */}
      <button
        onClick={onOpenSidebar}
        className="w-8 h-8 rounded-lg flex items-center justify-center
                   text-[#8C8C8C] hover:bg-black/5 transition-colors"
      >
        <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
          <path d="M0 1h18M0 7h18M0 13h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {/* Agent centré */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
        <LogoShuriken size={16} color={color} />
        <span className="text-sm font-semibold text-[#0A0A0A]">{label}</span>
      </div>

      {/* Actions droite */}
      <div className="ml-auto flex items-center gap-0.5">
        <button
          onClick={onNewConversation}
          className="w-8 h-8 rounded-lg flex items-center justify-center
                     text-[#8C8C8C] hover:bg-black/5 transition-colors"
          title="Nouvelle conversation"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        {onExpand && (
          <button
            onClick={onExpand}
            className="w-8 h-8 rounded-lg flex items-center justify-center
                       text-[#8C8C8C] hover:bg-black/5 transition-colors"
            title="Plein écran"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 5V1h4M9 1h4v4M1 9v4h4M13 9v4H9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </button>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center
                       text-[#8C8C8C] hover:bg-black/5 transition-colors"
            title="Fermer"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
    </header>
  )
}
