import { useCallback, useEffect, useRef, useState } from 'react'
import ChallengeShell from '../components/ChallengeShell.jsx'
import { blobPoints, pointsToPath } from '../lib/blob.js'
import { makeNoise } from '../lib/random.js'

const INSTRUCTION =
  'Dessinez à main levée le reflet symétrique exact de cette tache pour prouver votre conscience spatiale.'

export function SymmetryChallenge() {
  const [reference] = useState(() =>
    blobPoints({
      seed: Math.random() * 1000,
      count: 11,
      radius: 84,
      variance: 0.44,
      cx: 150,
      cy: 150,
    }),
  )
  const canvasRef = useRef(null)
  const strokesRef = useRef([])
  const drawingRef = useRef(false)
  const [strokeCount, setStrokeCount] = useState(0)
  const [noise] = useState(() => makeNoise(Math.floor(Math.random() * 9000) + 1))

  /**
   * The rendered trace deliberately differs from the raw input: a smooth
   * drift, a fine tremble and a growing offset from the mirror axis.
   */
  const tremble = useCallback(
    (stroke, width, now) => {
      const n = stroke.length
      if (n === 1) {
        const [x, y] = stroke[0]
        return [
          [
            x + noise(0.4) * 1.6 + Math.sin(now * 0.005) * 1.2,
            y + noise(9.7) * 1.6 + Math.cos(now * 0.0043) * 1.2,
          ],
        ]
      }
      return stroke.map(([x, y], i) => {
        const prev = stroke[Math.max(i - 1, 0)]
        const next = stroke[Math.min(i + 1, n - 1)]
        let dx = next[0] - prev[0]
        let dy = next[1] - prev[1]
        const len = Math.hypot(dx, dy) || 1
        dx /= len
        dy /= len
        const lateral =
          noise(i * 0.42) * 4.6 +
          noise(i * 2.9 + 40) * 1.5 +
          (x / Math.max(width, 1)) * 5.5
        return [
          x - dy * lateral + noise(i * 3.7 + 120) * 1.1,
          y + dx * lateral + noise(i * 3.7 + 260) * 1.1,
        ]
      })
    },
    [noise],
  )

  const redraw = useCallback(
    (now = performance.now()) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      const dpr = window.devicePixelRatio || 1
      const width = canvas.width / dpr
      const height = canvas.height / dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)
      ctx.strokeStyle = '#0b0b0b'
      ctx.fillStyle = '#0b0b0b'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      strokesRef.current.forEach((stroke) => {
        const drawn = tremble(stroke, width, now)
        if (drawn.length === 1) {
          ctx.beginPath()
          ctx.arc(drawn[0][0], drawn[0][1], 1.4, 0, Math.PI * 2)
          ctx.fill()
          return
        }
        ctx.beginPath()
        drawn.forEach(([x, y], i) => {
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        })
        ctx.stroke()
      })
    },
    [tremble],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const fit = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.max(1, Math.round(rect.width * dpr))
      canvas.height = Math.max(1, Math.round(rect.height * dpr))
      redraw()
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [redraw])

  // The trace never sits still: it keeps trembling even after the release.
  useEffect(() => {
    let raf = 0
    let last = 0
    const loop = (now) => {
      if (strokesRef.current.length > 0 && now - last > 70) {
        last = now
        redraw(now)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [redraw])

  const localPoint = (event) => {
    const rect = canvasRef.current.getBoundingClientRect()
    return [event.clientX - rect.left, event.clientY - rect.top]
  }

  const handlePointerDown = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    drawingRef.current = true
    strokesRef.current.push([localPoint(event)])
    redraw()
  }

  const handlePointerMove = (event) => {
    if (!drawingRef.current) return
    const stroke = strokesRef.current[strokesRef.current.length - 1]
    if (!stroke) return
    stroke.push(localPoint(event))
    redraw()
  }

  const handlePointerUp = () => {
    if (!drawingRef.current) return
    drawingRef.current = false
    setStrokeCount(strokesRef.current.length)
  }

  const handleClear = () => {
    strokesRef.current = []
    setStrokeCount(0)
    redraw()
  }

  return (
    <ChallengeShell
      index="03"
      title="Symétrie parfaite — conscience spatiale"
      instruction={INSTRUCTION}
      status={
        <>
          <div className="status-row">
            <span className="label">Traits</span>
            <span className="status-value">{String(strokeCount).padStart(2, '0')}</span>
          </div>
          <div className="status-row">
            <span className="label">Axe</span>
            <span className="status-value">Vertical — miroir</span>
          </div>
          <div className="status-row">
            <span className="label">Tremblement</span>
            <span className="status-value">Actif — ligne vivante</span>
          </div>
        </>
      }
    >
      <div className="stage symmetry">
        <div className="symmetry__panel symmetry__panel--ref">
          <span className="label">Modèle — assemblage asymétrique</span>
          <div className="symmetry__figure">
            <svg width="300" height="300" viewBox="0 0 300 300" aria-hidden="true">
              <path d={pointsToPath(reference)} fill="var(--ink)" />
            </svg>
          </div>
        </div>

        <div className="symmetry__panel symmetry__panel--draw">
          <span className="label">Votre reflet</span>
          <canvas
            ref={canvasRef}
            className="symmetry__canvas"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          />
          <div className="symmetry__tools">
            <button type="button" className="btn" onClick={handleClear}>
              Effacer
            </button>
          </div>
        </div>
      </div>
    </ChallengeShell>
  )
}

export default SymmetryChallenge
