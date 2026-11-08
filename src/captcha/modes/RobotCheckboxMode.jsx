import { useEffect, useRef, useState } from 'react'

const CHECK_DELAY_MS = 1000
const REPORT_DELAY_MS = 1200

function BoxMark({ phase }) {
  if (phase === 'caught') {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="currentColor" aria-hidden="true">
        <path d="M6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12 19 6.4 17.6 5 12 10.6z" />
      </svg>
    )
  }
  if (phase === 'checked') {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="currentColor" aria-hidden="true">
        <path d="M9.2 16.2 4.8 11.8 3.4 13.2 9.2 19 20.6 7.6 19.2 6.2z" />
      </svg>
    )
  }
  return null
}

export function RobotCheckboxMode({ disabled = false, onAutoFail }) {
  const [dodged, setDodged] = useState(false)
  const [phase, setPhase] = useState('idle')
  const checkTimerRef = useRef(null)
  const reportTimerRef = useRef(null)

  useEffect(
    () => () => {
      window.clearTimeout(checkTimerRef.current)
      window.clearTimeout(reportTimerRef.current)
    },
    [],
  )

  const handleApproach = () => {
    if (disabled || dodged || phase !== 'idle') return
    setDodged(true)
  }

  const handleClick = () => {
    if (disabled || phase !== 'idle') return
    setPhase('checked')
    checkTimerRef.current = window.setTimeout(() => setPhase('caught'), CHECK_DELAY_MS)
    reportTimerRef.current = window.setTimeout(() => {
      if (typeof onAutoFail === 'function') onAutoFail()
    }, CHECK_DELAY_MS + REPORT_DELAY_MS)
  }

  const boxTone =
    phase === 'caught'
      ? 'border-red-600 bg-red-600'
      : phase === 'checked'
        ? 'border-blue-600 bg-blue-600'
        : 'border-slate-400 bg-white'

  return (
    <div
      className={`flex flex-col gap-2 ${disabled ? 'pointer-events-none opacity-60' : ''}`}
      aria-disabled={disabled}
    >
      <div className="rounded border border-slate-300 bg-slate-50 px-3 py-2.5">
        <div className="mb-1.5 flex items-center justify-between text-[9px] uppercase tracking-[0.18em] text-slate-400">
          <span>Sentinel™ attestation</span>
          <span>Protocole v4.2</span>
        </div>
        <div className="flex h-12 items-center">
          <span className="flex w-[132px] shrink-0 items-center">
            <button
              type="button"
              role="checkbox"
              aria-checked={phase !== 'idle'}
              aria-label="Je ne suis pas un robot"
              onMouseEnter={handleApproach}
              onFocus={handleApproach}
              onClick={handleClick}
              disabled={disabled}
              className={`flex h-7 w-7 items-center justify-center rounded-sm border-2 transition-transform duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${boxTone} ${
                dodged ? 'translate-x-[46px] -translate-y-2 rotate-[-4deg]' : ''
              }`}
            >
              <BoxMark phase={phase} />
            </button>
          </span>
          <span className="text-[13px] font-medium text-slate-700">
            Je ne suis pas un robot
          </span>
        </div>
      </div>

      {phase === 'checked' ? (
        <p className="text-[11px] tracking-wide text-slate-500">
          Déclaration reçue — analyse comportementale en cours…
        </p>
      ) : null}

      {phase === 'caught' ? (
        <p
          role="alert"
          className="rounded border border-red-200 bg-red-50 px-2.5 py-1.5 text-[12px] font-bold uppercase tracking-wide text-red-600"
        >
          Mouvement suspect de souris détecté.
        </p>
      ) : null}
    </div>
  )
}

export default RobotCheckboxMode
