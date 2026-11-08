import CaptchaWidget from '../captcha/CaptchaWidget.jsx'

/**
 * Registry of available tests. The protocol now serves a single
 * challenge: the sentinel widget that always fails.
 */
export const challenges = [
  {
    id: 'widget',
    Component: CaptchaWidget,
  },
]
