'use client'

import type { ReactNode } from 'react'

interface Props {
  icon: ReactNode
  label: string
  onClick: () => void
  active: boolean
}

export function NavItem({ icon, label, onClick, active }: Props) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5
        rounded-xl text-base font-medium
        transition-colors duration-100
        ${active
          ? 'bg-white/10 text-white'
          : 'text-white/70 hover:text-white hover:bg-white/5'
        }
      `}
    >
      <span className="w-5 flex items-center justify-center opacity-80">
        {icon}
      </span>
      {label}
    </button>
  )
}
