import { useEffect, useRef, useState } from 'react'
import ChallengeShell from '../components/ChallengeShell.jsx'
import { blobPoints, lerpPoints, pointsToPath } from '../lib/blob.js'
import { rand } from '../lib/random.js'

const HOLD_MS = 5000
const HOLD_RADIUS = 36

const INSTRUCTION =
  'Pour prouver votre humanité, maintenez votre curseur au centre exact de la tache pendant 5 secondes.'

function makeShapes() {
  const a = blobPoints({ seed: Math.random() * 1000, count: 9, radius: 62 })
  const b = blobPoints({ seed: Math.random() * 1000, count: 9, radius: 62 })
  return [a, b]
}

export function PatienceChallenge() {
  const stageRef = useRef(null)
  const blotRef = useRef(null)
  const pathRef = useRef(null)
  const meterValueRef = useRef(null)
  const meterBarRef = useRef(null)
  const pointerRef = useRef({ x: -9999, y: -9999, inside: false })
  const [shapes] = useState(makeShapes)
  const blotStateRef = useRef({
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
    nextTargetAt: 0,
    hold: 0,
    measured: false,
  })

  useEffect(() => {
    const stage = stageRef.current
    const blot = blotRef.current
    if (!stage || !blot) return undefined

    let width = 0
    let height = 0
    const measure = () => {
      const rect = stage.getBoundingClientRect()
      width = rect.width
      height = rect.height
      const state = blotStateRef.current
      if (!state.measured && width > 0) {
        state.x = width * 0.68
        state.y = height * 0.42
        state.tx = state.x
        state.ty = state.y
        state.measured = true
      }
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(stage)

    let raf = 0
    let last = performance.now()
    let frame = 0

    const loop = (now) => {
      const dt = Math.min(now - last, 50)
      last = now
      const state = blotStateRef.current
      const pointer = pointerRef.current

      if (state.measured) {
        if (now >= state.nextTargetAt) {
          state.tx = rand(70, Math.max(width - 70, 71))
          state.ty = rand(70, Math.max(height - 70, 71))
          state.nextTargetAt = now + rand(1800, 3400)
        }

        const dx = state.tx - state.x
        const dy = state.ty - state.y
        const dist = Math.hypot(dx, dy) || 1
        const step = (14 * dt) / 1000
        state.x += (dx / dist) * step
        state.y += (dy / dist) * step

        blot.style.transform = `translate3d(${state.x - 100}px, ${state.y - 100}px, 0)`

        const d = Math.hypot(pointer.x - state.x, pointer.y - state.y)
        if (pointer.inside && d < HOLD_RADIUS) {
          state.hold = Math.min(state.hold + dt, HOLD_MS)
        } else {
          state.hold = Math.max(0, state.hold - dt * 2.5)
        }

        const ratio = state.hold / HOLD_MS
        if (meterValueRef.current) {
          meterValueRef.current.textContent = `${(state.hold / 1000).toFixed(2)} / 5.00 s`
        }
        if (meterBarRef.current) {
          meterBarRef.current.style.transform = `scaleX(${ratio})`
        }
      }

      frame += 1
      if (pathRef.current && frame % 4 === 0) {
        const [a, b] = shapes
        const t = (Math.sin(now * 0.0007) + 1) / 2
        pathRef.current.setAttribute('d', pointsToPath(lerpPoints(a, b, t)))
      }

      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [shapes])

  const handlePointerMove = (event) => {
    const stage = stageRef.current
    if (!stage) return
    const rect = stage.getBoundingClientRect()
    pointerRef.current.x = event.clientX - rect.left
    pointerRef.current.y = event.clientY - rect.top
    pointerRef.current.inside = true
  }

  const handlePointerLeave = () => {
    pointerRef.current.inside = false
    pointerRef.current.x = -9999
    pointerRef.current.y = -9999
  }

  const [a, b] = shapes

  return (
    <ChallengeShell
      index="01"
      title="Test de patience — suivi de tache"
      instruction={INSTRUCTION}
      status={
        <>
          <div className="status-row">
            <span className="label">Conservation</span>
            <span className="status-value" ref={meterValueRef}>
              0.00 / 5.00 s
            </span>
          </div>
          <div className="meter" aria-hidden="true">
            <i ref={meterBarRef} />
          </div>
        </>
      }
    >
      <div
        className="stage patience"
        ref={stageRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <div className="blot" ref={blotRef}>
          <svg width="200" height="200" viewBox="0 0 200 200" aria-hidden="true">
            <path
              ref={pathRef}
              d={pointsToPath(lerpPoints(a, b, 0.5))}
              fill="var(--ink)"
            />
          </svg>
        </div>
      </div>
    </ChallengeShell>
  )
}

export default PatienceChallenge
