import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import './styles/challenges.css'
import ScanOverlay from './components/ScanOverlay.jsx'
import { challenges } from './challenges/registry.js'
import { createAmbientDrone } from './lib/ambient.js'

const SCAN_FULL_MS = 2400

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
  const [scanning, setScanning] = useState(true)
  const current = challenges[0] ?? null

  useEffect(() => () => audio.stop(), [audio])

  useEffect(() => {
    const timer = window.setTimeout(() => setScanning(false), SCAN_FULL_MS)
    return () => window.clearTimeout(timer)
  }, [])

  const toggleAudio = useCallback(() => {
    setAudioOn(audio.toggle())
  }, [audio])

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
        <span className="app__attempt">Tentative 01 / 01</span>
        <span>Vérification en cours</span>
      </div>

      <main className="app__main">
        {scanning ? (
          <ScanOverlay duration={SCAN_FULL_MS} sessionId={sessionId} />
        ) : null}

        {ActiveChallenge ? (
          <div className="app__challenge" key={current.id}>
            <ActiveChallenge />
          </div>
        ) : (
          <p className="app__placeholder label">
            Aucune épreuve assignée à cette session
          </p>
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
