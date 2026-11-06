import { useEffect, useRef, useState } from 'react'
import ChallengeShell from '../components/ChallengeShell.jsx'
import { rand } from '../lib/random.js'

const INSTRUCTION =
  'Restez en phase avec le cercle : maintenez votre pointeur à l’intérieur pendant trois cycles de respiration complets.'

const CYCLES_TOTAL = 3

const LOST_MESSAGES = [
  'Synchronisation respiratoire perdue. Recommencez.',
  'Le cercle a quitté votre pointeur. Recommencez.',
  'Dérive posturale détectée : le cycle repart à zéro.',
]

const FAST_MESSAGES = [
  'Mouvement trop sec : variabilité inhumaine. Recommencez.',
  'Votre pointeur a accéléré au-delà du seuil humain. Recommencez.',
  'Micro-rafale motrice détectée. Recommencez.',
]

const FINAL_MESSAGE =
  'Trois cycles perdus en moins de vingt secondes. Aucun humain ne suit une respiration sans micro-mouvement. Rejet de l’épreuve 05.'

const IMPOSSIBLE_MESSAGE =
  'Trois cycles complets sans une seule dérive posturale (σ = 0,003 px). Les humains tremblent. Rejet de l’épreuve 05.'

export function BreathingChallenge({ onReject }) {
  const stageRef = useRef(null)
  const circleRef = useRef(null)
  const phaseValueRef = useRef(null)
  const meterRef = useRef(null)
  const pointerRef = useRef({
    x: -9999,
    y: -9999,
    inside: false,
    wasInside: false,
    speed: 0,
    speedAt: 0,
    movedAt: 0,
  })
  const noteTimerRef = useRef(null)
  const noteSeqRef = useRef(0)
  const [cycles, setCycles] = useState(0)
  const [strikes, setStrikes] = useState(0)
  const [note, setNote] = useState(null)
  const stateRef = useRef({
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
    breath: 0,
    period: 6400,
    nextTargetAt: 0,
    nextJerkAt: 0,
    jerkUntil: 0,
    measured: false,
  })

  useEffect(() => {
    const stage = stageRef.current
    const circle = circleRef.current
    if (!stage || !circle) return undefined

    let width = 0
    let height = 0
    const measure = () => {
      const rect = stage.getBoundingClientRect()
      width = rect.width
      height = rect.height
      const state = stateRef.current
      if (!state.measured && width > 0) {
        state.x = width * 0.5
        state.y = height * 0.5
        state.tx = state.x
        state.ty = state.y
        state.nextTargetAt = performance.now() + 2000
        state.nextJerkAt = performance.now() + rand(3800, 6400)
        state.measured = true
      }
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(stage)

    let raf = 0
    let last = performance.now()
    let cycleCount = 0
    let strikeCount = 0
    let lostIndex = 0
    let fastIndex = 0
    let stopped = false
    let graceUntil = 0

    const flash = (text) => {
      if (noteTimerRef.current) window.clearTimeout(noteTimerRef.current)
      noteSeqRef.current += 1
      setNote({ id: noteSeqRef.current, text })
      noteTimerRef.current = window.setTimeout(() => setNote(null), 3000)
    }

    const strike = (text) => {
      if (stopped) return
      flash(text)
      strikeCount += 1
      setStrikes(strikeCount)
      cycleCount = 0
      setCycles(0)
      pointerRef.current.speed = 0
      graceUntil = performance.now() + 850
      if (strikeCount >= 3) {
        stopped = true
        onReject(FINAL_MESSAGE)
      }
    }

    const loop = (now) => {
      if (stopped) return
      const dt = Math.min(now - last, 50)
      last = now
      const state = stateRef.current

      if (state.measured) {
        // Breathing rhythm — the period never repeats exactly.
        const irregularity = 1 + Math.sin(now * 0.0009) * 0.28
        state.breath += (dt / state.period) * irregularity
        if (state.breath >= 1) {
          state.breath -= 1
          state.period = rand(5200, 8200)
          if (pointerRef.current.wasInside) {
            cycleCount += 1
            setCycles(Math.min(cycleCount, CYCLES_TOTAL))
            if (cycleCount >= CYCLES_TOTAL) {
              stopped = true
              onReject(IMPOSSIBLE_MESSAGE)
            }
          }
        }

        const scale =
          0.66 + 0.34 * ((1 - Math.cos(state.breath * Math.PI * 2)) / 2)

        // Drift with occasional jerks.
        if (now >= state.nextTargetAt) {
          state.tx = rand(90, Math.max(width - 90, 91))
          state.ty = rand(90, Math.max(height - 90, 91))
          state.nextTargetAt = now + rand(2200, 3600)
        }
        if (now >= state.nextJerkAt) {
          state.jerkUntil = now + 460
          state.nextJerkAt = now + rand(3800, 6400)
          state.tx = rand(90, Math.max(width - 90, 91))
          state.ty = rand(90, Math.max(height - 90, 91))
        }

        const dx = state.tx - state.x
        const dy = state.ty - state.y
        const dist = Math.hypot(dx, dy) || 1
        const speed = now < state.jerkUntil ? 92 : 11
        state.x += ((dx / dist) * (speed * dt)) / 1000
        state.y += ((dy / dist) * (speed * dt)) / 1000

        circle.style.transform = `translate3d(${state.x - 160}px, ${state.y - 160}px, 0) scale(${scale.toFixed(4)})`

        // Pointer discipline: stay inside, never move like a machine.
        const pointer = pointerRef.current
        if (now >= graceUntil) {
          if (pointer.inside) {
            const d = Math.hypot(pointer.x - state.x, pointer.y - state.y)
            const radius = 160 * scale
            if (d <= radius) {
              if (!pointer.wasInside) {
                pointer.wasInside = true
              } else if (pointer.speed > 150 && now - pointer.speedAt < 220) {
                strike(FAST_MESSAGES[fastIndex % FAST_MESSAGES.length])
                fastIndex += 1
              }
            } else if (pointer.wasInside) {
              pointer.wasInside = false
              strike(LOST_MESSAGES[lostIndex % LOST_MESSAGES.length])
              lostIndex += 1
            }
          } else {
            pointer.wasInside = false
          }
        }

        if (meterRef.current) {
          meterRef.current.style.transform = `scaleX(${state.breath.toFixed(3)})`
        }
        if (phaseValueRef.current) {
          const inhaling = Math.sin(state.breath * Math.PI * 2) >= 0
          phaseValueRef.current.textContent = inhaling
            ? 'Inspiration'
            : 'Expiration'
        }
      }

      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      if (noteTimerRef.current) window.clearTimeout(noteTimerRef.current)
    }
  }, [onReject])

  const handlePointerMove = (event) => {
    const stage = stageRef.current
    if (!stage) return
    const rect = stage.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const pointer = pointerRef.current
    const now = performance.now()
    if (pointer.x > -9000) {
      const dt = Math.max(now - pointer.movedAt, 1)
      pointer.speed = (Math.hypot(x - pointer.x, y - pointer.y) / dt) * 1000
      pointer.speedAt = now
    }
    pointer.x = x
    pointer.y = y
    pointer.inside = true
    pointer.movedAt = now
  }

  const handlePointerLeave = () => {
    const pointer = pointerRef.current
    pointer.inside = false
    pointer.wasInside = false
    pointer.x = -9999
    pointer.y = -9999
    pointer.speed = 0
  }

  return (
    <ChallengeShell
      index="05"
      title="Synchronisation respiratoire"
      instruction={INSTRUCTION}
      status={
        <>
          <div className="status-row">
            <span className="label">Cycles</span>
            <span className="status-value">
              {String(cycles).padStart(2, '0')} / 03
            </span>
          </div>
          <div className="meter" aria-hidden="true">
            <i ref={meterRef} />
          </div>
          <div className="status-row">
            <span className="label">Phase</span>
            <span className="status-value" ref={phaseValueRef}>
              Inspiration
            </span>
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
        className="stage breathing"
        ref={stageRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <div className="breath__circle" ref={circleRef} />
        {note ? (
          <p className="stage-note" key={note.id}>
            {note.text}
          </p>
        ) : null}
      </div>
    </ChallengeShell>
  )
}

export default BreathingChallenge
