import { useState } from 'react'

const CONSIGNES = [
  'Sélectionnez la forme la plus triste.',
  'Sélectionnez celle qui ressemble le plus à un chat.',
  'Sélectionnez la forme la plus bizarre.',
  'Sélectionnez celle qui respire le mieux.',
  'Sélectionnez la plus susceptible de tomber.',
  'Sélectionnez celle qui pense à autre chose.',
  'Sélectionnez la forme la plus suspecte.',
  'Sélectionnez celle qui a déjà menti.',
]

const SHAPES = [
  { id: 'circle', node: <circle cx="32" cy="32" r="24" /> },
  { id: 'square', node: <rect x="10" y="10" width="44" height="44" /> },
  { id: 'triangle', node: <polygon points="32,8 58,56 6,56" /> },
  { id: 'diamond', node: <polygon points="32,6 58,32 32,58 6,32" /> },
  { id: 'pentagon', node: <polygon points="32,6 57,25 47,55 17,55 7,25" /> },
  { id: 'hexagon', node: <polygon points="32,6 55,19 55,45 32,58 9,45 9,19" /> },
  { id: 'half', node: <path d="M8 46a24 24 0 0 1 48 0z" /> },
  {
    id: 'ring',
    node: <circle cx="32" cy="32" r="19" fill="none" stroke="currentColor" strokeWidth="9" />,
  },
  { id: 'chevron', node: <path d="M10 16l30 16-30 16 13-16z" /> },
]

function shuffled(items) {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = copy[i]
    copy[i] = copy[j]
    copy[j] = tmp
  }
  return copy
}

export function ImageSelectMode({ disabled = false }) {
  const [order] = useState(() => shuffled(SHAPES))
  const [consigne] = useState(
    () => CONSIGNES[Math.floor(Math.random() * CONSIGNES.length)],
  )
  const [picked, setPicked] = useState([])

  const toggle = (id) => {
    if (disabled) return
    setPicked((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  return (
    <div
      className={`flex flex-col gap-2.5 ${disabled ? 'pointer-events-none opacity-60' : ''}`}
      aria-disabled={disabled}
    >
      <p className="rounded border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[12px] font-semibold leading-snug text-amber-800">
        {consigne}
      </p>

      <div className="grid grid-cols-3 gap-1.5">
        {order.map((shape) => {
          const active = picked.includes(shape.id)
          return (
            <button
              key={shape.id}
              type="button"
              aria-pressed={active}
              aria-label={`Forme ${shape.id}`}
              onClick={() => toggle(shape.id)}
              disabled={disabled}
              className={`flex items-center justify-center rounded border p-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                active
                  ? 'border-blue-600 bg-blue-100 ring-2 ring-blue-600'
                  : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              <svg
                viewBox="0 0 64 64"
                className="h-9 w-9 text-slate-700"
                fill="currentColor"
                aria-hidden="true"
              >
                {shape.node}
              </svg>
            </button>
          )
        })}
      </div>

      <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-wider text-slate-500">
        <span>Sélection : {String(picked.length).padStart(2, '0')} / 09</span>
        <span>Ordre mélangé à chaque session</span>
      </div>
    </div>
  )
}

export default ImageSelectMode
