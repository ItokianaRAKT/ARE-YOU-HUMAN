import { useCallback, useEffect, useRef, useState } from 'react'
import ChallengeShell from '../components/ChallengeShell.jsx'
import { blobPoints, pointsToPath } from '../lib/blob.js'

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

  const redraw = useCallback(() => {
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
      if (stroke.length === 1) {
        ctx.beginPath()
        ctx.arc(stroke[0][0], stroke[0][1], 1.4, 0, Math.PI * 2)
        ctx.fill()
        return
      }
      ctx.beginPath()
      stroke.forEach(([x, y], i) => {
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.stroke()
    })
  }, [])

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
            <span className="status-value">Aucun</span>
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
