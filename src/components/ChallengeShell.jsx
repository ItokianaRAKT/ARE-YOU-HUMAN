export function ChallengeShell({ index, title, instruction, status, children }) {
  return (
    <section className="challenge">
      <aside className="challenge__meta">
        <div className="challenge__block">
          <span className="label">Épreuve</span>
          <span className="challenge__index">{index} / 01</span>
        </div>

        <div className="challenge__block">
          <span className="label">Protocole</span>
          <h2 className="challenge__title">{title}</h2>
        </div>

        <div className="challenge__block">
          <span className="label">Consigne</span>
          <p className="challenge__instruction">{instruction}</p>
        </div>

        <div className="challenge__block challenge__block--status">{status}</div>
      </aside>

      <div className="challenge__stage">{children}</div>
    </section>
  )
}

export default ChallengeShell
