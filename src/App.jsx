import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import './styles/challenges.css'
import VerdictBar from './components/VerdictBar.jsx'
import GrantedScreen from './components/GrantedScreen.jsx'
import ScanOverlay from './components/ScanOverlay.jsx'
import { challenges } from './challenges/registry.js'
import { createAmbientDrone } from './lib/ambient.js'

const MAX_ATTEMPTS = 3
const SCAN_FULL_MS = 2400
const SCAN_SHORT_MS = 1300

function makeSessionId() {
  const hex = '0123456789ABCDEF'
  let out = ''
  for (let i = 0; i < 8; i += 1) {
    out += hex[Math.floor(Math.random() * 16)]
    if (i === 3) out += '-'
  }
  return out
}

function App() {
  const sessionId = useMemo(() => makeSessionId(), [])
  const audio = useMemo(() => createAmbientDrone(), [])
  const [audioOn, setAudioOn] = useState(false)
  const current = challenges[0] ?? null
  const [verdict, setVerdict] = useState(null)
  const [attempt, setAttempt] = useState(1)
  const [granted, setGranted] = useState(false)
  const [scan, setScan] = useState({ active: true, full: true })
  const scanTimerRef = useRef(null)

  useEffect(() => () => audio.stop(), [audio])

  useEffect(() => {
    scanTimerRef.current = window.setTimeout(
      () => setScan((prev) => ({ ...prev, active: false })),
      SCAN_FULL_MS,
    )
    return () => window.clearTimeout(scanTimerRef.current)
  }, [])

  const startScan = useCallback((full) => {
    window.clearTimeout(scanTimerRef.current)
    setScan({ active: true, full })
    scanTimerRef.current = window.setTimeout(
      () => setScan((prev) => ({ ...prev, active: false })),
      full ? SCAN_FULL_MS : SCAN_SHORT_MS,
    )
  }, [])

  const toggleAudio = useCallback(() => {
    setAudioOn(audio.toggle())
  }, [audio])

  const handleReject = useCallback((message) => {
    setVerdict(message)
  }, [])

  const handleAdvance = useCallback(() => {
    if (attempt >= MAX_ATTEMPTS) {
      setVerdict(null)
      setGranted(true)
      return
    }
    setVerdict(null)
    setAttempt((prev) => prev + 1)
    startScan(false)
  }, [attempt, startScan])

  const handleRestart = useCallback(() => {
    setGranted(false)
    setVerdict(null)
    setAttempt(1)
  }, [])

  const ActiveChallenge = current ? current.Component : null

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__wordmark">Êtes-vous humain&nbsp;?</div>
        <div className="app__session">
          Session <span>{sessionId}</span>
        </div>
        <button
          type="button"
          className="app__audio mono"
          data-on={audioOn}
          onClick={toggleAudio}
        >
          Audio — {audioOn ? 'on' : 'off'}
        </button>
      </header>

      <div className="app__statusbar mono">
        <span>Passerelle sécurisée</span>
        <span className="app__attempt">
          Tentative {String(attempt).padStart(2, '0')} / 03
        </span>
        <span>
          {granted
            ? 'Vérification close'
            : `Épreuve ${current ? current.index : '—'} / 01`}
        </span>
      </div>

      <main className="app__main">
        {scan.active ? (
          <ScanOverlay
            full={scan.full}
            duration={scan.full ? SCAN_FULL_MS : SCAN_SHORT_MS}
            sessionId={sessionId}
          />
        ) : null}

        {granted ? (
          <GrantedScreen attempts={MAX_ATTEMPTS} onRestart={handleRestart} />
        ) : (
          <>
            {ActiveChallenge ? (
              <div
                className="app__challenge"
                key={current.id}
                data-rejected={verdict ? '' : undefined}
              >
                <ActiveChallenge onReject={handleReject} />
              </div>
            ) : (
              <p className="app__placeholder label">
                Aucune épreuve assignée à cette session
              </p>
            )}

            {verdict ? (
              <VerdictBar
                message={verdict}
                onRetry={handleAdvance}
                actionLabel={
                  attempt >= MAX_ATTEMPTS
                    ? 'Procéder à la vérification'
                    : 'Nouvelle épreuve'
                }
              />
            ) : null}
          </>
        )}
      </main>

      <footer className="app__footer mono">
        <span>Protocole de vérification humaine — v2.4</span>
        <span>Ne quittez pas cette page</span>
        <span>© 2026</span>
      </footer>
    </div>
  )
}

export default App
