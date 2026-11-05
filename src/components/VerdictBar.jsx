export function VerdictBar({ message, onRetry, actionLabel = 'Nouvelle épreuve' }) {
  return (
    <section className="verdict" aria-live="polite">
      <span className="label verdict__label">Verdict</span>
      <p className="verdict__message">{message}</p>
      <button type="button" className="btn btn--inverse" onClick={onRetry}>
        {actionLabel}
      </button>
    </section>
  )
}

export default VerdictBar
