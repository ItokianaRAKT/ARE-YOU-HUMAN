import { useEffect, useRef, useState } from 'react'
import ChallengeShell from '../components/ChallengeShell.jsx'
import { rand } from '../lib/random.js'

const INSTRUCTION =
  'Restez en phase avec le cercle : maintenez votre pointeur à l’intérieur pendant trois cycles de respiration complets.'

const CYCLES_TOTAL = 3

export function BreathingChallenge() {
  const stageRef = useRef(null)
  const circleRef = useRef(null)
  const phaseValueRef = useRef(null)
  const meterRef = useRef(null)
  const [cycles, setCycles] = useState(0)
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

    const loop = (now) => {
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
          cycleCount += 1
          setCycles(Math.min(cycleCount, CYCLES_TOTAL))
        }

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
        state.x += (dx / dist) * (speed * dt) / 1000
        state.y += (dy / dist) * (speed * dt) / 1000

        const scale = 0.66 + 0.34 * ((1 - Math.cos(state.breath * Math.PI * 2)) / 2)
        circle.style.transform = `translate3d(${state.x - 160}px, ${state.y - 160}px, 0) scale(${scale.toFixed(4)})`

        if (meterRef.current) {
          meterRef.current.style.transform = `scaleX(${state.breath.toFixed(3)})`
        }
        if (phaseValueRef.current) {
          const inhaling =
            Math.sin(state.breath * Math.PI * 2) >= 0
          phaseValueRef.current.textContent = inhaling ? 'Inspiration' : 'Expiration'
        }
      }

      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [])

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
            <span className="label">Perdre le rythme</span>
            <span className="status-value">Réinitialise tout</span>
          </div>
        </>
      }
    >
      <div className="stage breathing" ref={stageRef}>
        <div className="breath__circle" ref={circleRef} />
      </div>
    </ChallengeShell>
  )
}

export default BreathingChallenge
