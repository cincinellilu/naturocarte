import Link from "next/link";

export default function PractitionerNotFound() {
  return (
    <section className="practitioner-page">
      <h1>Praticien introuvable</h1>
      <p>Cette fiche n'existe pas ou n'est pas publiée.</p>
      <p>
        <Link className="btn btn-secondary" href="/carte">
          Retour à la carte
        </Link>
      </p>
    </section>
  );
}
