import { useEffect, useRef, useState } from 'react'
import ChallengeShell from '../components/ChallengeShell.jsx'

const VERIFY_MS = 1600

const FAILURE_DETAIL =
  'ERR-WIDGET-0x3F : empreinte comportementale non vérifiable.'

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

function WarningMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6 text-red-600"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2 1 21h22L12 2zm1 14h-2v2h2v-2zm0-7h-2v5h2V9z" />
    </svg>
  )
}

function Spinner() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6 animate-spin text-blue-600"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        className="opacity-25"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
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

function VerifyOverlay() {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-white/90">
      <Spinner />
      <p className="text-[12px] font-medium tracking-wide text-slate-600">
        Vérification en cours…
      </p>
      <div className="mt-1 h-1 w-40 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full w-full animate-pulse bg-blue-600" />
      </div>
    </div>
  )
}

function FailureBlock({ detail }) {
  return (
    <div
      className="flex min-h-[190px] flex-col items-center justify-center gap-2 px-4 py-5 text-center"
      role="alert"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 ring-4 ring-red-100">
        <WarningMark />
      </span>
      <p className="text-[17px] font-bold uppercase tracking-[0.08em] text-red-600">
        Échec. Réessayez.
      </p>
      <p className="max-w-[36ch] text-[13px] leading-relaxed text-slate-700">
        Une action louche a été détectée sur ce dispositif. Veuillez réessayer.
      </p>
      <p className="font-mono text-[10px] tracking-wide text-slate-400">
        {detail}
      </p>
    </div>
  )
}

export function CaptchaWidget() {
  const [status, setStatus] = useState('idle')
  const timerRef = useRef(null)

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  const handleVerify = () => {
    if (status !== 'idle') return
    setStatus('verifying')
    timerRef.current = window.setTimeout(() => setStatus('failed'), VERIFY_MS)
  }

  const handleRetry = () => {
    window.clearTimeout(timerRef.current)
    setStatus('idle')
  }

  const stateLabel =
    status === 'failed' ? 'Échec' : status === 'verifying' ? 'Vérification…' : 'En attente'

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
            <span className="status-value">{stateLabel}</span>
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
            <StatusLamp state={status} />
          </header>

          <div className="relative min-h-[190px] px-4 py-5">
            {status === 'failed' ? (
              <FailureBlock detail={FAILURE_DETAIL} />
            ) : (
              <div className="flex min-h-[180px] flex-col justify-center gap-2">
                <p className="text-[13px] text-slate-600">
                  Protocole en attente d’affectation…
                </p>
              </div>
            )}
            {status === 'verifying' ? <VerifyOverlay /> : null}
          </div>

          <footer className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3">
            {status === 'failed' ? (
              <button
                type="button"
                onClick={handleRetry}
                className="rounded bg-blue-600 px-5 py-2 text-sm font-semibold tracking-wide text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                Réessayer
              </button>
            ) : (
              <button
                type="button"
                onClick={handleVerify}
                disabled={status === 'verifying'}
                className="rounded bg-blue-600 px-5 py-2 text-sm font-semibold tracking-wide text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                Vérifier
              </button>
            )}
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
