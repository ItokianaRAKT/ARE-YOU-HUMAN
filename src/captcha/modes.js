import ImageSelectMode from './modes/ImageSelectMode.jsx'
import PuzzleSliderMode from './modes/PuzzleSliderMode.jsx'
import RobotCheckboxMode from './modes/RobotCheckboxMode.jsx'
import ObjectRotationMode from './modes/ObjectRotationMode.jsx'

/**
 * Modes exposed by the sentinel widget. The widget picks one at random
 * on every reset and never runs out: the loop has no end.
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
  {
    id: 'object-rotation',
    label: 'Rotation d’objet',
    prompt: 'Étape 1 — orientation magnétique.',
    Component: ObjectRotationMode,
  },
]

/**
 * Pick the next mode at random, never the one currently displayed.
 */
export function pickCaptchaMode(excludeId = null) {
  if (CAPTCHA_MODES.length === 0) return null
  const pool = CAPTCHA_MODES.filter((entry) => entry.id !== excludeId)
  const choices = pool.length > 0 ? pool : CAPTCHA_MODES
  return choices[Math.floor(Math.random() * choices.length)]
}
