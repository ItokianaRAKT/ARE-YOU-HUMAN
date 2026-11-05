import { useEffect, useRef, useState } from 'react'
import ChallengeShell from '../components/ChallengeShell.jsx'
import { blobPoints, pointsToPath } from '../lib/blob.js'

const INSTRUCTION =
  'Ajustez la forme jusqu’à ce qu’elle exprime une profonde nostalgie.'

const CX = 230
const CY = 170

const BASE = blobPoints({
  seed: 42.71,
  count: 12,
  radius: 86,
  variance: 0.26,
  cx: CX,
  cy: CY,
})

function shapeAt(now, v) {
  return BASE.map(([x, y], i) => {
    const dx = x - CX
    const dy = y - CY
    const len = Math.hypot(dx, dy) || 1
    const swirl =
      Math.sin(now * 0.0038 + i * 2.1 + v * 14) *
      Math.cos(now * 0.0026 - i * 1.3 + v * 9)
    const amplitude = 17 + 42 * Math.abs(v - 0.5) * 2
    const push = swirl * amplitude
    const jitter = Math.sin(now * 0.021 + i * 5.7) * 3.4
    const radius = len + push + jitter
    return [
      CX + (dx / len) * radius + Math.sin(now * 0.005 + i) * 4.5,
      CY + (dy / len) * radius + Math.cos(now * 0.0043 + i * 1.4) * 4.5,
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
        const rot = Math.sin(now * 0.0016 + v * 9) * 15 + Math.sin(now * 0.011) * 1.6
        const skew = Math.sin(now * 0.0021 + v * 5) * 13
        const drift = Math.sin(now * 0.0031) * 9
        groupRef.current.setAttribute(
          'transform',
          `translate(${drift.toFixed(1)} 0) translate(${CX} ${CY}) rotate(${rot.toFixed(2)}) skewX(${skew.toFixed(2)}) translate(${-CX} ${-CY})`,
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
          <svg width="460" height="340" viewBox="0 0 460 340" aria-hidden="true">
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
