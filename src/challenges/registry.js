import PatienceChallenge from './PatienceChallenge.jsx'

/**
 * Registry of available tests. Each branch of the project appends its own
 * protocol here; the gate picks one at random per attempt.
 */
export const CHALLENGE_TOTAL = 5

export const challenges = [
  {
    id: 'patience',
    index: '01',
    Component: PatienceChallenge,
  },
]
