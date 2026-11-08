import { useEffect, useState } from 'react'

const SCAN_LINES = [
  'Lecture du pointeur…',
  'Calibration du tremblement…',
  'Mesure de la variance motrice…',
  'Affectation d’une épreuve…',
]

export function ScanOverlay({ duration, sessionId }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(
      () => setStep((prev) => prev + 1),
      Math.max(duration / SCAN_LINES.length, 250),
    )
    return () => window.clearInterval(interval)
  }, [duration])

  const line = SCAN_LINES[Math.min(step, SCAN_LINES.length - 1)]

  return (
    <div className="scan" role="status" aria-live="polite">
      <div className="scan__box">
        <span className="label">Analyse en cours</span>
        <p className="scan__line mono">{line}</p>
        <div className="scan__bar" aria-hidden="true">
          <i style={{ animationDuration: `${duration}ms` }} />
        </div>
        <div className="scan__foot mono">
          <span>Session {sessionId}</span>
        </div>
      </div>
    </div>
  )
}

export default ScanOverlay
