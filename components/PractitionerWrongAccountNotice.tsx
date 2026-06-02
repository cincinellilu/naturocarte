export default function PractitionerWrongAccountNotice({
  completeHref
}: {
  completeHref: string;
}) {
  return (
    <section className="dashboard-wrong-account-alert">
      <div>
        <p className="dashboard-wrong-account-title">Vous n’êtes pas praticien ?</p>
        <p>
          Si cet espace a été créé par erreur, vous pouvez le supprimer et repartir sur un
          compte utilisateur classique.
        </p>
      </div>
      <a className="btn btn-secondary" href="#erreur-compte-praticien">
        Corriger mon type de compte
      </a>

      <div
        id="erreur-compte-praticien"
        className="dashboard-modal-backdrop dashboard-modal-target"
        role="presentation"
      >
        <div
          className="dashboard-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="wrong-account-title"
        >
          <a className="dashboard-modal-close" href="#" aria-label="Fermer">
            ×
          </a>
          <div>
            <p className="section-eyebrow">Type de compte</p>
            <h2 id="wrong-account-title">Vous avez créé un espace naturopathe.</h2>
            <p>
              Si c’était volontaire, complétez votre fiche avec vos informations
              professionnelles pour qu’elle puisse être mise en ligne sur NaturoCarte.
            </p>
            <p>
              Si c’est une erreur, supprimez cet espace praticien : vous serez redirigé vers
              votre compte utilisateur.
            </p>
          </div>

          <div className="dashboard-modal-actions">
            <a className="btn" href={completeHref}>
              Compléter ma fiche praticien
            </a>
            <form action="/api/practitioner-dashboard/delete-space" method="post">
              <button className="btn btn-secondary dashboard-danger-btn" type="submit">
                Supprimer l’espace praticien
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
