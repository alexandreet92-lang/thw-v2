'use client'

import { LogoShuriken } from '@/components/ui/LogoShuriken'

type Agent = 'training' | 'networks'

const AGENT_CONFIG: Record<Agent, { color: string; greeting: string }> = {
  training: { color: '#2563EB', greeting: 'Bonjour, je suis Training' },
  networks: { color: '#7C3AED', greeting: 'Bonjour, je suis Networks' },
}

interface Props {
  agent: Agent
}

export function EmptyState({ agent }: Props) {
  const { color, greeting } = AGENT_CONFIG[agent] ?? AGENT_CONFIG.training

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8">
      <LogoShuriken size={52} color={color} />
      <div className="text-center">
        <h2 className="text-xl font-semibold text-[#0A0A0A]">{greeting}</h2>
        <p className="text-sm text-[#8C8C8C] mt-1">Comment puis-je t&apos;aider ?</p>
      </div>
    </div>
  )
}
