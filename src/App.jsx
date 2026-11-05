import { useCallback, useMemo, useState } from 'react'
import './App.css'
import './styles/challenges.css'
import VerdictBar from './components/VerdictBar.jsx'
import { challenges } from './challenges/registry.js'
import { pickOther } from './lib/random.js'

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
  const [current, setCurrent] = useState(() =>
    challenges.length ? pickOther(challenges, null) : null,
  )
  const [verdict, setVerdict] = useState(null)

  const handleReject = useCallback((message) => {
    setVerdict(message)
  }, [])

  const handleRetry = useCallback(() => {
    setVerdict(null)
    setCurrent((prev) => pickOther(challenges, prev))
  }, [])

  const ActiveChallenge = current ? current.Component : null

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__wordmark">Êtes-vous humain&nbsp;?</div>
        <div className="app__session">
          Session <span>{sessionId}</span>
        </div>
        <button type="button" className="app__audio mono">
          Audio — off
        </button>
      </header>

      <div className="app__statusbar mono">
        <span>Passerelle sécurisée</span>
        <span>Nœud 04 — Genève</span>
        <span>Connexion chiffrée</span>
      </div>

      <main className="app__main">
        {ActiveChallenge ? (
          <div className="app__challenge" key={current.id}>
            <ActiveChallenge onReject={handleReject} />
          </div>
        ) : (
          <p className="app__placeholder label">
            Aucune épreuve assignée à cette session
          </p>
        )}

        {verdict ? <VerdictBar message={verdict} onRetry={handleRetry} /> : null}
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
