import { useMemo } from 'react'
import './App.css'

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
  const sessionId = useMemo(makeSessionId, [])

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
        <p className="app__placeholder label">
          Aucune épreuve assignée à cette session
        </p>
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
