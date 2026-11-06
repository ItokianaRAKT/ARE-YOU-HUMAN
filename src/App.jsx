import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import './styles/challenges.css'
import VerdictBar from './components/VerdictBar.jsx'
import GrantedScreen from './components/GrantedScreen.jsx'
import { challenges } from './challenges/registry.js'
import { pickOther } from './lib/random.js'
import { createAmbientDrone } from './lib/ambient.js'

const MAX_ATTEMPTS = 3

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
  const [current, setCurrent] = useState(() =>
    challenges.length ? pickOther(challenges, null) : null,
  )
  const [verdict, setVerdict] = useState(null)
  const [attempt, setAttempt] = useState(1)
  const [granted, setGranted] = useState(false)

  useEffect(() => () => audio.stop(), [audio])

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
    setCurrent((prev) => pickOther(challenges, prev))
  }, [attempt])

  const handleRestart = useCallback(() => {
    setGranted(false)
    setVerdict(null)
    setAttempt(1)
    setCurrent(() => (challenges.length ? pickOther(challenges, null) : null))
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
            : `Épreuve ${current ? current.index : '—'} / 05`}
        </span>
      </div>

      <main className="app__main">
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
