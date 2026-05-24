'use client'

interface Sport {
  id: string
  label: string
  icon: React.ReactNode
  available: boolean
}

const BikeIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/>
    <path d="M15 6a1 1 0 100-2 1 1 0 000 2zm-3 11.5L9 6H5"/><path d="M9 6l3 5h5l-2 6.5"/>
  </svg>
)
const RunIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13" cy="4" r="1"/><path d="M7 17l1.5-5 2.5 3 3-4 1.5 2H19"/>
    <path d="M5 21l2-4 2 2 2-6"/>
  </svg>
)
const MountainIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3l4 8 5-5 5 15H2L8 3z"/>
  </svg>
)
const DumbbellIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 4v16M18 4v16M4 8h4M16 8h4M4 16h4M16 16h4M8 12h8"/>
  </svg>
)
const FireIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 3z"/>
  </svg>
)
const RowIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 17l3-3 2 2 4-4 3 3 3-5"/><circle cx="18" cy="5" r="2"/>
    <path d="M12 11V3M8 7h8"/>
  </svg>
)

const SPORTS: Sport[] = [
  { id: 'cycling',  label: 'Vélo',    icon: <BikeIcon />,     available: true },
  { id: 'running',  label: 'Running', icon: <RunIcon />,      available: false },
  { id: 'trail',    label: 'Trail',   icon: <MountainIcon />, available: false },
  { id: 'strength', label: 'Muscu',   icon: <DumbbellIcon />, available: false },
  { id: 'hyrox',    label: 'Hyrox',   icon: <FireIcon />,     available: false },
  { id: 'rowing',   label: 'Aviron',  icon: <RowIcon />,      available: false },
]

interface Props {
  open: boolean
  onClose: () => void
  onSelect: (sportId: string) => void
  onToast: (msg: string) => void
}

export function SportSelector({ open, onClose, onSelect, onToast }: Props) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-280 ${open ? 'bg-black/40 backdrop-blur-sm' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl transition-transform duration-[280ms] ease-out ${open ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        <p className="text-base font-semibold text-center pt-2 pb-4">Choisir un sport</p>

        <div className="grid grid-cols-3 gap-3 px-4 pb-8">
          {SPORTS.map(sport => (
            <button
              key={sport.id}
              onClick={() => {
                if (sport.available) {
                  onSelect(sport.id)
                } else {
                  onToast('Bientôt disponible')
                }
              }}
              className="flex flex-col items-center gap-2 bg-card rounded-2xl p-4 border border-border hover:border-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-950/20 transition-colors h-[90px] justify-center"
            >
              <span className="text-foreground">{sport.icon}</span>
              <span className="text-sm font-medium text-foreground">{sport.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
