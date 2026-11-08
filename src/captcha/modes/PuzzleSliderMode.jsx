import { useRef, useState } from 'react'

const PIECE = 56
const SLOT_W = 80
const EDGE = 10

function clampX(value, width) {
  return Math.min(Math.max(value, EDGE), Math.max(EDGE, width - PIECE - EDGE))
}

export function PuzzleSliderMode({ disabled = false }) {
  const trackRef = useRef(null)
  const posRef = useRef({ x: 12, grab: 0 })
  const [x, setX] = useState(12)
  const [dragging, setDragging] = useState(false)
  const [placed, setPlaced] = useState(false)

  const handlePointerDown = (event) => {
    if (disabled || !trackRef.current) return
    const rect = trackRef.current.getBoundingClientRect()
    posRef.current.grab = event.clientX - rect.left - posRef.current.x
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragging(true)
    setPlaced(false)
  }

  const handlePointerMove = (event) => {
    if (disabled || !dragging || !trackRef.current) return
    const rect = trackRef.current.getBoundingClientRect()
    const next = clampX(event.clientX - rect.left - posRef.current.grab, rect.width)
    posRef.current.x = next
    setX(next)
  }

  const handlePointerUp = () => {
    if (disabled || !dragging || !trackRef.current) return
    setDragging(false)
    const rect = trackRef.current.getBoundingClientRect()
    const slotLeft = rect.width - EDGE - SLOT_W
    if (posRef.current.x >= slotLeft - 12) {
      const snapped = clampX(slotLeft + (SLOT_W - PIECE) / 2, rect.width)
      posRef.current.x = snapped
      setX(snapped)
      setPlaced(true)
    }
  }

  return (
    <div
      className={`flex flex-col gap-2.5 ${disabled ? 'pointer-events-none opacity-60' : ''}`}
      aria-disabled={disabled}
    >
      <p className="rounded border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-[12px] font-semibold leading-snug text-blue-800">
        {placed
          ? 'Pièce en place — lancez la vérification.'
          : 'Glissez la pièce jusqu’à l’emplacement réservé.'}
      </p>

      <div
        ref={trackRef}
        className="relative h-28 overflow-hidden rounded border border-slate-300 bg-slate-100"
      >
        <div
          className="absolute inset-x-3 top-1/2 h-px -translate-y-1/2 bg-slate-300"
          aria-hidden="true"
        />
        <div
          className="absolute top-1/2 h-16 w-20 -translate-y-1/2 border-2 border-dashed border-slate-400 bg-white/70"
          style={{ right: `${EDGE}px` }}
          aria-hidden="true"
        >
          <span className="flex h-full w-full items-center justify-center font-mono text-[10px] text-slate-400">
            ?
          </span>
        </div>
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label="Pièce de puzzle ronde à glisser"
          aria-disabled={disabled}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`absolute top-1/2 flex h-14 w-14 -translate-y-1/2 touch-none items-center justify-center rounded-full bg-blue-600 text-[10px] font-semibold uppercase tracking-wider text-white select-none shadow-md ${
            dragging ? 'scale-105 cursor-grabbing ring-2 ring-blue-300' : 'cursor-grab'
          }`}
          style={{ left: `${x}px` }}
        >
          Pièce
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-wider text-slate-500">
        <span>Pièce : ronde · Ø 56 px</span>
        <span>Emplacement : rectangulaire · 80 × 64 px</span>
      </div>
      <p className="font-mono text-[10px] tracking-wide text-slate-400">
        Concordance des géométries : 0 % — validation manuelle requise.
      </p>
    </div>
  )
}

export default PuzzleSliderMode
