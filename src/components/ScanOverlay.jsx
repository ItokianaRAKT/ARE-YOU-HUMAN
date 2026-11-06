import { useEffect, useState } from 'react'

const FULL_LINES = [
  'Lecture du pointeur…',
  'Calibration du tremblement…',
  'Mesure de la variance motrice…',
  'Affectation d’une épreuve…',
]

const SHORT_LINES = [
  'Réaffectation de l’épreuve…',
  'Nouvelle mesure en cours…',
]

export function ScanOverlay({ full, duration, sessionId }) {
  const lines = full ? FULL_LINES : SHORT_LINES
  const [step, setStep] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(
      () => setStep((prev) => prev + 1),
      Math.max(duration / lines.length, 250),
    )
    return () => window.clearInterval(interval)
  }, [duration, lines])

  const line = lines[Math.min(step, lines.length - 1)]

  return (
    <div className="scan" role="status" aria-live="polite">
      <div className="scan__box">
        <span className="label">
          {full ? 'Analyse en cours' : 'Réaffectation'}
        </span>
        <p className="scan__line mono">{line}</p>
        <div className="scan__bar" aria-hidden="true">
          <i style={{ animationDuration: `${duration}ms` }} />
        </div>
        <div className="scan__foot mono">
          <span>Session {sessionId}</span>
          <span>{full ? '01 — 04' : '02 — 04'}</span>
        </div>
      </div>
    </div>
  )
}

export default ScanOverlay
