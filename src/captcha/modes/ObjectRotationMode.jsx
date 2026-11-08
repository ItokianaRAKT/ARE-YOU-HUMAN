import { useState } from 'react'

const STEP = 15
const TARGET = 315

function shortestGap(angle) {
  const diff = Math.abs(angle - TARGET)
  return Math.min(diff, 360 - diff)
}

function RotateIcon({ direction }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {direction === 'left' ? (
        <>
          <path d="M3 12a9 9 0 1 0 3-6.7" />
          <path d="M3 4v5h5" />
        </>
      ) : (
        <>
          <path d="M21 12a9 9 0 1 1-3-6.7" />
          <path d="M21 4v5h-5" />
        </>
      )}
    </svg>
  )
}

function Compass({ angle }) {
  return (
    <svg viewBox="0 0 170 170" className="h-40 w-40" aria-hidden="true">
      <circle cx="85" cy="85" r="78" className="fill-slate-50 stroke-slate-300" strokeWidth="1.5" />
      <g className="stroke-slate-400" strokeWidth="1.5" strokeLinecap="round">
        <line x1="85" y1="9" x2="85" y2="21" />
        <line x1="85" y1="149" x2="85" y2="161" />
        <line x1="9" y1="85" x2="21" y2="85" />
        <line x1="149" y1="85" x2="161" y2="85" />
      </g>
      <g className="fill-slate-500" fontSize="11" fontWeight="600" textAnchor="middle">
        <text x="85" y="34">N</text>
        <text x="85" y="142">S</text>
        <text x="34" y="89">E</text>
        <text x="136" y="89">O</text>
      </g>
      <g
        className="transition-transform duration-200 ease-out"
        style={{
          transform: `rotate(${angle}deg)`,
          transformOrigin: '85px 85px',
          transformBox: 'view-box',
        }}
      >
        <path
          d="M85 34 L114 52 L120 92 L98 126 L62 120 L48 84 L60 48 Z"
          className="fill-slate-700"
        />
        <circle cx="85" cy="58" r="7" className="fill-slate-50" />
        <line x1="85" y1="85" x2="85" y2="34" className="stroke-white" strokeWidth="2" />
      </g>
      <circle cx="85" cy="85" r="3" className="fill-slate-400" />
    </svg>
  )
}

export function ObjectRotationMode({ disabled = false }) {
  const [angle, setAngle] = useState(0)

  const normalized = ((angle % 360) + 360) % 360
  const gap = shortestGap(normalized)

  return (
    <div
      className={`flex flex-col gap-2.5 ${disabled ? 'pointer-events-none opacity-60' : ''}`}
      aria-disabled={disabled}
    >
      <p className="rounded border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[12px] font-semibold leading-snug text-amber-800">
        Faire en sorte que l’objet soit orienté vers le nord-ouest.
      </p>

      <div className="flex justify-center">
        <Compass angle={angle} />
      </div>

      <div className="flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-wider text-slate-500">
        <span>Angle : {String(normalized).padStart(3, '0')}°</span>
        <span>Cible : 315° (NO)</span>
        <span>Écart : {String(gap).padStart(3, '0')}°</span>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setAngle((value) => value - STEP)}
          disabled={disabled}
          className="flex flex-1 items-center justify-center gap-1.5 rounded border border-slate-300 bg-white px-3 py-2 text-[12px] font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <RotateIcon direction="left" />
          Rotation à gauche
        </button>
        <button
          type="button"
          onClick={() => setAngle((value) => value + STEP)}
          disabled={disabled}
          className="flex flex-1 items-center justify-center gap-1.5 rounded border border-slate-300 bg-white px-3 py-2 text-[12px] font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <RotateIcon direction="right" />
          Rotation à droite
        </button>
      </div>

      <p className="text-center font-mono text-[10px] tracking-wide text-slate-400">
        Objet indéterminé — réf. OBJ-77 · orientation non certifiable
      </p>
    </div>
  )
}

export default ObjectRotationMode
