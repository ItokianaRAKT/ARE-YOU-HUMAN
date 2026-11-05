import { useEffect, useRef, useState } from 'react'
import ChallengeShell from '../components/ChallengeShell.jsx'
import { blobPoints, lerpPoints, pointsToPath } from '../lib/blob.js'
import { rand } from '../lib/random.js'

const HOLD_MS = 5000
const HOLD_RADIUS = 36
const APPROACH_RADIUS = 104

const TRAP_MESSAGES = [
  'Vitesse de réaction inhumaine détectée. Recommencez.',
  'Le curseur a anticipé le déplacement de la cible. Recommencez.',
  'Poursuite sans hésitation : tracé robotique. Recommencez.',
  'Distance d’approche franchie en 0 ms. Recommencez.',
]

const FINAL_MESSAGE =
  'Trois réactions anticipées en moins de douze secondes. Votre pointeur ne tremble jamais, il fuit. Rejet de l’épreuve 01.'

const INSTRUCTION =
  'Pour prouver votre humanité, maintenez votre curseur au centre exact de la tache pendant 5 secondes.'

function makeShapes() {
  const a = blobPoints({ seed: Math.random() * 1000, count: 9, radius: 62 })
  const b = blobPoints({ seed: Math.random() * 1000, count: 9, radius: 62 })
  return [a, b]
}

export function PatienceChallenge({ onReject }) {
  const stageRef = useRef(null)
  const blotRef = useRef(null)
  const ghostRef = useRef(null)
  const pathRef = useRef(null)
  const meterValueRef = useRef(null)
  const meterBarRef = useRef(null)
  const pointerRef = useRef({ x: -9999, y: -9999, inside: false })
  const [shapes] = useState(makeShapes)
  const [note, setNote] = useState(null)
  const [strikes, setStrikes] = useState(0)
  const [split, setSplit] = useState(false)
  const noteTimerRef = useRef(null)
  const noteSeqRef = useRef(0)
  const blotStateRef = useRef({
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
    nextTargetAt: 0,
    hold: 0,
    boostUntil: 0,
    ghostAngle: 0,
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
    let trapIndex = 0
    let strikeCount = 0
    let splitActive = false
    let stopped = false

    const flash = (text) => {
      if (noteTimerRef.current) window.clearTimeout(noteTimerRef.current)
      noteSeqRef.current += 1
      setNote({ id: noteSeqRef.current, text })
      noteTimerRef.current = window.setTimeout(() => setNote(null), 3000)
    }

    /** Jump as far away from the cursor as the stage allows. */
    const escapeFrom = (pointer, w, h) => {
      let best = [w * 0.5, h * 0.5]
      let bestDist = -1
      for (let i = 0; i < 14; i += 1) {
        const x = rand(70, Math.max(w - 70, 71))
        const y = rand(70, Math.max(h - 70, 71))
        const dist = Math.hypot(x - pointer.x, y - pointer.y)
        if (dist > bestDist) {
          bestDist = dist
          best = [x, y]
        }
      }
      return best
    }

    const react = (state, pointer, now, w, h) => {
      state.hold = 0
      const [x, y] = escapeFrom(pointer, w, h)
      state.x = x
      state.y = y
      state.tx = x
      state.ty = y
      state.nextTargetAt = now + rand(1500, 2600)
      state.boostUntil = now + 1500
      flash(TRAP_MESSAGES[trapIndex % TRAP_MESSAGES.length])
      trapIndex += 1

      strikeCount += 1
      setStrikes(strikeCount)
      if (strikeCount === 2) {
        splitActive = true
        setSplit(true)
      }
      if (strikeCount >= 3) {
        stopped = true
        onReject(FINAL_MESSAGE)
      }
    }

    const loop = (now) => {
      if (stopped) return
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
        const speed = now < state.boostUntil ? 96 : 14
        const step = (speed * dt) / 1000
        state.x += (dx / dist) * step
        state.y += (dy / dist) * step

        blot.style.transform = `translate3d(${state.x - 100}px, ${state.y - 100}px, 0)`

        let d = Math.hypot(pointer.x - state.x, pointer.y - state.y)
        const ghost = ghostRef.current
        if (splitActive && ghost) {
          state.ghostAngle += dt * 0.00042
          const gx = state.x + Math.cos(state.ghostAngle) * 152
          const gy = state.y + Math.sin(state.ghostAngle) * 152
          ghost.style.transform = `translate3d(${gx - 100}px, ${gy - 100}px, 0)`
          d = Math.min(d, Math.hypot(pointer.x - gx, pointer.y - gy))
        }

        if (pointer.inside && d < APPROACH_RADIUS) {
          react(state, pointer, now, width, height)
        }
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
      if (noteTimerRef.current) window.clearTimeout(noteTimerRef.current)
    }
  }, [shapes, onReject])

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
          <div className="status-row">
            <span className="label">Réactions</span>
            <span className="strikes" aria-label={`${strikes} réaction(s)`}>
              {[0, 1, 2].map((i) => (
                <i key={i} className={i < strikes ? 'on' : ''} />
              ))}
            </span>
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

        {split ? (
          <div className="blot blot--ghost" ref={ghostRef}>
            <svg width="200" height="200" viewBox="0 0 200 200" aria-hidden="true">
              <path d={pointsToPath(b)} fill="var(--ink)" />
            </svg>
          </div>
        ) : null}

        {note ? (
          <p className="stage-note" key={note.id}>
            {note.text}
          </p>
        ) : null}
      </div>
    </ChallengeShell>
  )
}

export default PatienceChallenge
