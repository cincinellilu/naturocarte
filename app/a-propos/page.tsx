import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Découvrez comment NaturoCarte aide les utilisateurs à trouver un naturopathe en Île-de-France avec une recherche simple et des fiches claires.",
  alternates: {
    canonical: "/a-propos"
  },
  openGraph: {
    title: "À propos | NaturoCarte",
    description:
      "Découvrez comment NaturoCarte aide les utilisateurs à trouver un naturopathe en Île-de-France avec une recherche simple et des fiches claires.",
    url: "/a-propos",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "À propos | NaturoCarte",
    description:
      "Découvrez comment NaturoCarte aide les utilisateurs à trouver un naturopathe en Île-de-France avec une recherche simple et des fiches claires."
  }
};

export default function AProposPage() {
  return (
    <article className="about-page">
      <header className="about-hero">
        <p className="about-eyebrow">NaturoCarte</p>
        <h1>À propos de NaturoCarte</h1>
        <p className="about-intro">
          NaturoCarte aide les utilisateurs à trouver un naturopathe plus rapidement,
          grâce à une recherche par carte, par département et par arrondissement à Paris.
        </p>
      </header>

      <section className="about-card">
        <h2 className="about-title">Mission</h2>
        <p>
          NaturoCarte a pour objectif d’aider les utilisateurs à trouver un naturopathe
          près de chez eux, sans perdre de temps dans des listes confuses. Le site permet
          de partir d’une adresse, d’un département ou d’un arrondissement à Paris pour
          accéder rapidement aux fiches utiles. Le service couvre aujourd&apos;hui Paris et
          les départements d&apos;Île-de-France.
        </p>
      </section>

      <section className="about-card">
        <h2 className="about-title">Un annuaire spécialisé</h2>
        <p>
          NaturoCarte est un annuaire spécialisé, conçu pour présenter des fiches
          professionnelles avec des informations pratiques: localisation, coordonnées et
          accès à la prise de rendez-vous quand elle est disponible. Le service n&apos;est ni
          un comparateur, ni un système de notation.
        </p>
      </section>

      <section className="about-card">
        <h2 className="about-title">Neutralité et cadre professionnel</h2>
        <p>
          NaturoCarte adopte une ligne éditoriale neutre, sans hiérarchisation artificielle
          des praticiens et sans promesses de résultats. Les informations sont fournies à
          titre informatif pour aider à choisir un point de départ clair.
        </p>
      </section>

      <section className="about-card">
        <h2 className="about-title">Transparence et mise à jour des informations</h2>
        <p>
          Les fiches contiennent des informations factuelles (coordonnées, localisation,
          modalités de contact) qui peuvent évoluer. Les professionnels peuvent corriger
          ou revendiquer leurs informations afin d&apos;améliorer leur exactitude dans le
          temps.
        </p>
        <p className="about-inline-link">
          <Link href="/praticiens">Mettre à jour ou revendiquer une fiche</Link>
        </p>
      </section>

      <section className="about-card">
        <h2 className="about-title">Des pages locales claires</h2>
        <p>
          NaturoCarte organise les fiches autour de la carte, des départements et des
          pages locales pour aider les utilisateurs à trouver plus facilement un
          naturopathe à proximité, à Paris comme dans les autres départements franciliens.
        </p>
      </section>

      <section className="about-cta">
        <p>
          <Link href="/carte">Consulter la carte des naturopathes</Link>
        </p>
      </section>
    </article>
  );
}
