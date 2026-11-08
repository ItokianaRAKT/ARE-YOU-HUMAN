import CaptchaWidget from '../captcha/CaptchaWidget.jsx'

/**
 * Registry of available tests. The protocol now serves a single
 * challenge: the sentinel widget that always fails.
 */
export const CHALLENGE_TOTAL = 1

export const challenges = [
  {
    id: 'widget',
    index: '01',
    Component: CaptchaWidget,
  },
]
