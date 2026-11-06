import { useEffect, useRef, useState } from 'react'
import ChallengeShell from '../components/ChallengeShell.jsx'
import { blobPoints, pointsToPath } from '../lib/blob.js'
import { rand, randInt } from '../lib/random.js'

const INSTRUCTION =
  'Cliquez sur les taches dans l’ordre décroissant de leur niveau de menace perçu.'

const FINAL_MESSAGE =
  'Classement transmis. Rejet : les menaces perçues ont changé pendant votre analyse. Aucun ordre n’est resté valide plus de 0,3 s. Rejet de l’épreuve 04.'

const COUNT = 12
const MARGIN = 40
const TONES = ['var(--ink)', '#1e1e1e', '#424242']

function makeBlots() {
  return Array.from({ length: COUNT }, () => mutateBlot())
}

/** Every surviving blot gets a brand new body: shape, size and tone. */
function mutateBlot() {
  return {
    r: randInt(18, 34),
    path: pointsToPath(
      blobPoints({
        seed: Math.random() * 1000,
        count: randInt(7, 11),
        radius: 30,
        variance: rand(0.3, 0.55),
        cx: 40,
        cy: 40,
      }),
    ),
    tone: randInt(0, TONES.length - 1),
  }
}

function makeMotion(count, width, height) {
  return Array.from({ length: count }, () => {
    const angle = rand(0, Math.PI * 2)
    const speed = rand(7, 15)
    return {
      x: rand(MARGIN, Math.max(width - MARGIN, MARGIN + 1)),
      y: rand(MARGIN, Math.max(height - MARGIN, MARGIN + 1)),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
    }
  })
}

export function ObsessionChallenge({ onReject }) {
  const stageRef = useRef(null)
  const cellRefs = useRef([])
  const motionRef = useRef([])
  const orderRef = useRef([])
  const phaseRef = useRef('idle')
  const timerRef = useRef(null)
  const [blots, setBlots] = useState(makeBlots)
  const [order, setOrder] = useState([])
  const [ready, setReady] = useState(false)
  const [phase, setPhase] = useState('idle')

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    },
    [],
  )

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return undefined

    let width = 0
    let height = 0
    const measure = () => {
      const rect = stage.getBoundingClientRect()
      width = rect.width
      height = rect.height
      if (motionRef.current.length === 0 && width > 0) {
        motionRef.current = makeMotion(COUNT, width, height)
        setReady(true)
      }
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(stage)

    let raf = 0
    let last = performance.now()
    const loop = (now) => {
      const dt = Math.min(now - last, 50)
      last = now
      const frozen = phaseRef.current !== 'idle'
      const motion = motionRef.current
      motion.forEach((m, i) => {
        if (!frozen) {
          m.x += (m.vx * dt) / 1000
          m.y += (m.vy * dt) / 1000
          if (m.x < MARGIN) {
            m.x = MARGIN
            m.vx = Math.abs(m.vx)
          } else if (m.x > width - MARGIN) {
            m.x = Math.max(width - MARGIN, MARGIN)
            m.vx = -Math.abs(m.vx)
          }
          if (m.y < MARGIN) {
            m.y = MARGIN
            m.vy = Math.abs(m.vy)
          } else if (m.y > height - MARGIN) {
            m.y = Math.max(height - MARGIN, MARGIN)
            m.vy = -Math.abs(m.vy)
          }
        }
        const cell = cellRefs.current[i]
        if (cell) {
          const r = blots[i] ? blots[i].r : 26
          cell.style.transform = `translate3d(${m.x - r}px, ${m.y - r}px, 0)`
        }
      })
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [blots])

  const handlePick = (id) => {
    if (phaseRef.current !== 'idle') return
    if (orderRef.current.includes(id)) return
    orderRef.current.push(id)
    setOrder([...orderRef.current])

    // Every blot you did not pick instantly becomes something else.
    setBlots((prev) =>
      prev.map((blot, i) => (orderRef.current.includes(i) ? blot : mutateBlot())),
    )
    motionRef.current.forEach((m, i) => {
      if (orderRef.current.includes(i)) return
      const angle = rand(0, Math.PI * 2)
      const speed = rand(7, 17)
      m.vx = Math.cos(angle) * speed
      m.vy = Math.sin(angle) * speed
    })

    if (orderRef.current.length === COUNT) {
      phaseRef.current = 'analyzing'
      setPhase('analyzing')
      timerRef.current = window.setTimeout(() => onReject(FINAL_MESSAGE), 1600)
    }
  }

  const picked = (id) => order.includes(id)

  const orderText =
    order.length > 0
      ? order.map((id) => String(id + 1).padStart(2, '0')).join(' · ')
      : '—'

  return (
    <ChallengeShell
      index="04"
      title="Tri d’obsessions — menace perçue"
      instruction={INSTRUCTION}
      status={
        <>
          <div className="status-row">
            <span className="label">Classés</span>
            <span className="status-value">
              {String(order.length).padStart(2, '0')} / 12
            </span>
          </div>
          <div className="meter" aria-hidden="true">
            <i style={{ transform: `scaleX(${order.length / COUNT})` }} />
          </div>
          <div className="status-row">
            <span className="label">Ordre</span>
            <span className="status-value obsession__order">{orderText}</span>
          </div>
          <div className="status-row">
            <span className="label">État</span>
            <span className="status-value">
              {phase === 'idle' ? 'Tri manuel' : 'Transmission…'}
            </span>
          </div>
        </>
      }
    >
      <div className="stage obsession" ref={stageRef}>
        {blots.map((blot, i) => (
          <button
            key={i}
            type="button"
            ref={(el) => {
              cellRefs.current[i] = el
            }}
            className={`ink-cell${picked(i) ? ' ink-cell--picked' : ''}`}
            style={{
              width: blot.r * 2,
              height: blot.r * 2,
              visibility: ready ? 'visible' : 'hidden',
            }}
            onClick={() => handlePick(i)}
            aria-label={`Tache ${i + 1}`}
            aria-pressed={picked(i)}
          >
            <svg
              width={blot.r * 2}
              height={blot.r * 2}
              viewBox="0 0 80 80"
              aria-hidden="true"
            >
              <path
                d={blot.path}
                fill={picked(i) ? 'var(--paper)' : TONES[blot.tone]}
                stroke={picked(i) ? 'var(--ink)' : 'none'}
                strokeWidth="2.5"
              />
            </svg>
            {picked(i) ? (
              <span className="ink-cell__rank">
                {order.indexOf(i) + 1}
              </span>
            ) : null}
          </button>
        ))}
        {phase === 'analyzing' ? (
          <p className="stage-note">Transmission du classement…</p>
        ) : null}
      </div>
    </ChallengeShell>
  )
}

export default ObsessionChallenge
