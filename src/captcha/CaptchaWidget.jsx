import ChallengeShell from '../components/ChallengeShell.jsx'

function ShieldMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6 shrink-0 text-slate-700"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3z" />
      <path
        d="m8.8 12.2 2.2 2.2 4.2-4.4"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function StatusLamp({ state }) {
  const tone =
    state === 'failed'
      ? 'bg-red-500'
      : state === 'verifying'
        ? 'bg-blue-500 animate-pulse'
        : 'bg-slate-300'
  const label =
    state === 'failed' ? 'échec' : state === 'verifying' ? 'analyse' : 'en attente'

  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${tone}`} />
      <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
        {label}
      </span>
    </div>
  )
}

export function CaptchaWidget() {
  return (
    <ChallengeShell
      index="06"
      title="Widget de vérification — sentinelle"
      instruction="Passez la vérification de sécurité présentée ci-contre pour poursuivre votre navigation."
      status={
        <>
          <div className="status-row">
            <span className="label">Mode</span>
            <span className="status-value">— / 04</span>
          </div>
          <div className="status-row">
            <span className="label">Échecs</span>
            <span className="status-value">00</span>
          </div>
          <div className="status-row">
            <span className="label">État</span>
            <span className="status-value">En attente</span>
          </div>
        </>
      }
    >
      <div className="stage captcha">
        <div className="mx-auto w-full max-w-[440px] overflow-hidden rounded-lg border border-slate-300 bg-white font-sans shadow-lg">
          <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <ShieldMark />
              <div className="leading-tight">
                <p className="text-[13px] font-semibold tracking-wide text-slate-900">
                  VÉRIFICATION DE SÉCURITÉ
                </p>
                <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  Sentinel™ — protocole v4.2
                </p>
              </div>
            </div>
            <StatusLamp state="idle" />
          </header>

          <div className="flex min-h-[190px] flex-col justify-center gap-2 px-4 py-5">
            <p className="text-[13px] text-slate-600">
              Protocole en attente d’affectation…
            </p>
          </div>

          <footer className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3">
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded bg-blue-600/40 px-5 py-2 text-sm font-semibold tracking-wide text-white"
            >
              Vérifier
            </button>
            <p className="text-[10px] text-slate-400">
              Confidentialité · Conditions
            </p>
          </footer>
        </div>
      </div>
    </ChallengeShell>
  )
}

export default CaptchaWidget
