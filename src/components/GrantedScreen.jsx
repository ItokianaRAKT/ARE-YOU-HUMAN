export function GrantedScreen({ attempts, onRestart }) {
  return (
    <section className="granted">
      <span className="label">Vérification terminée</span>
      <h1 className="granted__title">Vérifié</h1>
      <p className="granted__lead">
        Il n’y a aucun site derrière cette porte.
      </p>
      <p className="granted__body">
        Vous avez essuyé {attempts} rejets pour arriver ici. Aucun humain
        n’aurait persisté : le captcha n’était pas la porte, le captcha était
        le site.
      </p>

      <dl className="granted__meta mono">
        <div>
          <dt>Statut humain</dt>
          <dd>Non conclu</dd>
        </div>
        <div>
          <dt>Épreuves subies</dt>
          <dd>{String(attempts).padStart(2, '0')} / 03</dd>
        </div>
        <div>
          <dt>Serveur</dt>
          <dd>Aucun</dd>
        </div>
        <div>
          <dt>Procédure</dt>
          <dd>Clos</dd>
        </div>
      </dl>

      <button type="button" className="btn" onClick={onRestart}>
        Recommencer la procédure
      </button>
    </section>
  )
}

export default GrantedScreen
