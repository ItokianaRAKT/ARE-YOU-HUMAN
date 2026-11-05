import { useEffect, useRef, useState } from 'react'
import ChallengeShell from '../components/ChallengeShell.jsx'
import { blobPoints, pointsToPath } from '../lib/blob.js'

const INSTRUCTION =
  'Ajustez la forme jusqu’à ce qu’elle exprime une profonde nostalgie.'

const CX = 200
const CY = 150

const BASE = blobPoints({ seed: 42.71, count: 12, radius: 86, variance: 0.26 })

function shapeAt(now, v) {
  return BASE.map(([x, y], i) => {
    const dx = x - CX
    const dy = y - CY
    const len = Math.hypot(dx, dy) || 1
    const pull = Math.sin(i * 1.7 + v * Math.PI * 2) * (10 + v * 24)
    const breathe = 1 + Math.sin(now * 0.0011 + i * 0.6) * 0.05
    return [
      CX + (dx / len) * (len * breathe + pull),
      CY + (dy / len) * (len * breathe + pull),
    ]
  })
}

export function AlignmentChallenge() {
  const [value, setValue] = useState(50)
  const valueRef = useRef(50)
  const pathRef = useRef(null)
  const groupRef = useRef(null)

  useEffect(() => {
    let raf = 0
    let frame = 0
    const loop = (now) => {
      const v = valueRef.current / 100
      if (pathRef.current && frame % 2 === 0) {
        pathRef.current.setAttribute('d', pointsToPath(shapeAt(now, v)))
      }
      if (groupRef.current) {
        const rot = Math.sin(now * 0.0004 + v * 3) * 7
        groupRef.current.setAttribute(
          'transform',
          `rotate(${rot.toFixed(2)} ${CX} ${CY})`,
        )
      }
      frame += 1
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  const handleChange = (event) => {
    const next = Number(event.target.value)
    valueRef.current = next
    setValue(next)
  }

  return (
    <ChallengeShell
      index="02"
      title="Test d’alignement émotionnel"
      instruction={INSTRUCTION}
      status={
        <>
          <div className="status-row">
            <span className="label">Réglage</span>
            <span className="status-value">{value.toFixed(1)}</span>
          </div>
          <div className="meter" aria-hidden="true">
            <i style={{ transform: `scaleX(${value / 100})` }} />
          </div>
          <div className="status-row">
            <span className="label">Source</span>
            <span className="status-value">Curseur analogique</span>
          </div>
        </>
      }
    >
      <div className="stage alignment">
        <div className="alignment__figure">
          <svg width="400" height="300" viewBox="0 0 400 300" aria-hidden="true">
            <g ref={groupRef}>
              <path ref={pathRef} d={pointsToPath(BASE)} fill="var(--ink)" />
            </g>
          </svg>
        </div>

        <div className="alignment__controls">
          <div className="alignment__scale">
            <span>Indifférence</span>
            <span className="label">Amplitude émotionnelle</span>
            <span>Nostalgie</span>
          </div>
          <input
            className="slider"
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={value}
            onChange={handleChange}
            aria-label="Amplitude émotionnelle"
          />
          <div className="alignment__ticks" aria-hidden="true">
            {Array.from({ length: 21 }, (_, i) => (
              <i key={i} className={i % 5 === 0 ? 'major' : ''} />
            ))}
          </div>
        </div>
      </div>
    </ChallengeShell>
  )
}

export default AlignmentChallenge
