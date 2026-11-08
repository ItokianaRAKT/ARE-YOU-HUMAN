import ImageSelectMode from './modes/ImageSelectMode.jsx'
import PuzzleSliderMode from './modes/PuzzleSliderMode.jsx'
import RobotCheckboxMode from './modes/RobotCheckboxMode.jsx'

/**
 * Modes exposed by the sentinel widget. Entries are appended by the
 * mode branches; the widget picks one at random on every reset.
 */
export const CAPTCHA_MODES = [
  {
    id: 'image-select',
    label: 'Sélection d’images',
    prompt: 'Étape 1 — identification visuelle.',
    Component: ImageSelectMode,
  },
  {
    id: 'puzzle-slider',
    label: 'Slider puzzle',
    prompt: 'Étape 1 — validation géométrique.',
    Component: PuzzleSliderMode,
  },
  {
    id: 'robot-checkbox',
    label: 'Case robot',
    prompt: 'Étape 1 — déclaration d’identité.',
    Component: RobotCheckboxMode,
  },
]

export const MODE_TOTAL = CAPTCHA_MODES.length

/**
 * Pick the next mode: never the current one, and prefer modes that have
 * not been failed yet. Falls back to any other mode.
 */
export function pickCaptchaMode(excludeId = null, triedIds = []) {
  if (CAPTCHA_MODES.length === 0) return null
  const fresh = CAPTCHA_MODES.filter(
    (entry) => entry.id !== excludeId && !triedIds.includes(entry.id),
  )
  const rest = CAPTCHA_MODES.filter((entry) => entry.id !== excludeId)
  const pool = fresh.length > 0 ? fresh : rest.length > 0 ? rest : CAPTCHA_MODES
  return pool[Math.floor(Math.random() * pool.length)]
}
