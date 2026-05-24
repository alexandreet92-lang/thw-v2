'use client'

type Status = 'ready' | 'running' | 'paused'

interface Props {
  status: Status
  gpsReady: boolean
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onLap: () => void
  onStop: () => void
}

const CircleBtn = ({
  onClick,
  size,
  className,
  children,
}: {
  onClick: () => void
  size: 'sm' | 'lg'
  className: string
  children: React.ReactNode
}) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center rounded-full font-semibold transition-opacity active:opacity-70 ${size === 'lg' ? 'w-[72px] h-[72px] text-sm' : 'w-[52px] h-[52px] text-xs'} ${className}`}
  >
    {children}
  </button>
)

export function CyclingControls({ status, gpsReady, onStart, onPause, onResume, onLap, onStop }: Props) {
  return (
    <div className="flex items-center justify-center gap-8 px-8 h-[100px] bg-black/50 backdrop-blur-sm">
      {status === 'ready' && (
        <div className="flex flex-col items-center gap-1">
          <CircleBtn
            onClick={onStart}
            size="lg"
            className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white"
          >
            START
          </CircleBtn>
          {!gpsReady && (
            <span className="text-[10px] text-white/40">GPS…</span>
          )}
        </div>
      )}

      {status === 'running' && (
        <>
          <CircleBtn
            onClick={onLap}
            size="sm"
            className="bg-white/10 text-white"
          >
            LAP
          </CircleBtn>
          <CircleBtn
            onClick={onPause}
            size="lg"
            className="bg-white text-black"
          >
            PAUSE
          </CircleBtn>
          <div className="w-[52px]" />
        </>
      )}

      {status === 'paused' && (
        <>
          <CircleBtn
            onClick={onStop}
            size="sm"
            className="bg-red-500/80 text-white"
          >
            FIN
          </CircleBtn>
          <CircleBtn
            onClick={onResume}
            size="lg"
            className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white"
          >
            GO
          </CircleBtn>
          <div className="w-[52px]" />
        </>
      )}
    </div>
  )
}
