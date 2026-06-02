import type { Metadata } from "next";
import Image from "next/image";
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
      <section className="page-hero page-hero--about">
        <div className="page-hero-background about-hero-background" aria-hidden="true">
          <Image
            src="https://images.pexels.com/photos/6383166/pexels-photo-6383166.jpeg?auto=compress&cs=tinysrgb&h=900&w=1600"
            alt=""
            fill
            sizes="100vw"
            priority
            className="home-hero-background-image about-hero-background-image"
          />
          <div className="home-hero-background-scrim about-hero-background-scrim" />
        </div>

        <div className="page-hero-grid about-hero-grid">
          <nav className="breadcrumb-nav about-hero-breadcrumb" aria-label="Fil d’Ariane">
            <ol>
              <li>
                <Link href="/">Accueil</Link>
              </li>
              <li aria-hidden="true">›</li>
              <li aria-current="page">À propos</li>
            </ol>
          </nav>

          <div className="page-hero-copy about-hero-copy">
            <p className="page-eyebrow">NaturoCarte</p>
            <h1>À propos de NaturoCarte</h1>
            <p className="page-lead">
              NaturoCarte aide les utilisateurs à trouver un naturopathe plus rapidement,
              grâce à une recherche par carte, par département et par arrondissement à Paris.
            </p>
          </div>
        </div>
      </section>

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
        <h2 className="about-title">Méthode et fiabilité</h2>
        <p>
          NaturoCarte présente des fiches factuelles, des corrections structurées et des
          avis modérés pour garder un service lisible et fiable dans le temps.
        </p>
        <p className="about-inline-link">
          <Link href="/methode">Lire la méthode complète</Link>
        </p>
      </section>

      <section className="about-card">
        <h2 className="about-title">Transparence et mise à jour des informations</h2>
        <p>
          Les fiches contiennent des informations factuelles (coordonnées, localisation,
          modalités de contact) qui peuvent évoluer. Les professionnels peuvent créer leur
          espace praticien pour améliorer leur fiche et tenir leurs informations à jour.
        </p>
        <p className="about-inline-link">
          <Link href="/praticiens">Accéder à l’espace praticien</Link>
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
