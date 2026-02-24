import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Annuaire naturopathes | Paris",
  description:
    "Annuaire de naturopathes à Paris avec navigation par arrondissement, carte interactive et fiches praticiens.",
  alternates: {
    canonical: "/annuaire-naturopathes"
  },
  openGraph: {
    title: "Annuaire naturopathes | Paris | NaturoCarte",
    description:
      "Annuaire de naturopathes à Paris avec navigation par arrondissement, carte interactive et fiches praticiens.",
    url: "/annuaire-naturopathes",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "Annuaire naturopathes | Paris | NaturoCarte",
    description:
      "Annuaire de naturopathes à Paris avec navigation par arrondissement, carte interactive et fiches praticiens."
  }
};

export default function AnnuaireNaturopathesPage() {
  return (
    <article>
      <h1>Annuaire naturopathes à Paris</h1>
      <p>
        NaturoCarte est un annuaire de naturopathes à Paris. Consultez les praticiens par
        arrondissement et accédez à leurs fiches détaillées pour comparer les options.
      </p>
      <p>
        <Link className="btn" href="/naturopathe-paris">
          Voir les naturopathes par arrondissement
        </Link>
      </p>
      <p>
        <Link className="btn btn-secondary" href="/carte">
          Voir la carte des naturopathes
        </Link>
      </p>
    </article>
  );
}
