import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Méthode et fiabilité",
  description:
    "Découvrez comment NaturoCarte structure ses fiches, modère les avis et organise les corrections pour proposer un annuaire clair et fiable.",
  alternates: {
    canonical: "/methode"
  },
  openGraph: {
    title: "Méthode et fiabilité | NaturoCarte",
    description:
      "Découvrez comment NaturoCarte structure ses fiches, modère les avis et organise les corrections pour proposer un annuaire clair et fiable.",
    url: "/methode",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "Méthode et fiabilité | NaturoCarte",
    description:
      "Découvrez comment NaturoCarte structure ses fiches, modère les avis et organise les corrections pour proposer un annuaire clair et fiable."
  }
};

export default function MethodePage() {
  return (
    <article className="about-page method-page">
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
              <li aria-current="page">Méthode et fiabilité</li>
            </ol>
          </nav>

          <div className="page-hero-copy about-hero-copy">
            <p className="page-eyebrow">NaturoCarte</p>
            <h1>Méthode et fiabilité</h1>
            <p className="page-lead">
              NaturoCarte organise les fiches pour que l’utilisateur comprenne rapidement
              ce qu’il regarde, d’où viennent les informations et comment elles peuvent
              être corrigées ou complétées.
            </p>
          </div>
        </div>
      </section>

      <section className="about-card">
        <h2 className="about-title">Ce que le site affiche</h2>
        <p>
          Le service présente des fiches professionnelles avec les informations utiles
          pour décider rapidement: nom, localisation, adresse, moyens de contact, site
          web et, lorsque c&apos;est disponible, prise de rendez-vous, tarifs et avis
          clients.
        </p>
        <p>
          La logique éditoriale reste volontairement simple: carte, annuaire, pages
          locales et fiche détaillée. Pas de comparaison artificielle, pas de classement
          caché.
        </p>
      </section>

      <section className="about-card">
        <h2 className="about-title">Comment les fiches sont mises à jour</h2>
        <p>
          Les fiches peuvent évoluer dans le temps. Lorsqu&apos;un praticien crée ou retrouve
          son espace, les informations de contact et de présentation peuvent être ajustées
          pour rester exactes.
        </p>
        <p>
          Les modifications sont traitées de manière structurée afin d&apos;éviter les
          doublons, les imprécisions et les changements incohérents.
        </p>
        <p className="about-inline-link">
          <Link href="/praticiens">Accéder à l’espace praticien</Link>
        </p>
      </section>

      <section className="about-card">
        <h2 className="about-title">Avis clients</h2>
        <p>
          Les avis déposés via la fiche praticien demandent un email et peuvent contenir
          un commentaire facultatif. Les avis sont conservés avec une note, une date et
          un statut de publication avant d&apos;apparaître publiquement.
        </p>
        <p>
          L&apos;objectif est d&apos;offrir un espace lisible et modéré, sans affichage
          d&apos;informations personnelles inutiles.
        </p>
      </section>

      <section className="about-card">
        <h2 className="about-title">Ce que NaturoCarte n’est pas</h2>
        <p>
          NaturoCarte n&apos;est pas un comparateur, n&apos;attribue pas de promesse de
          résultat et ne remplace pas un avis médical. Le site sert de point d&apos;entrée
          pour trouver plus vite une fiche claire et utile.
        </p>
        <p>
          Cette approche permet de rester sobre, transparent et cohérent dans le temps.
        </p>
      </section>

      <section className="about-card">
        <h2 className="about-title">Aller plus loin</h2>
        <p>
          Si vous voulez comprendre la présentation de l’annuaire, vous pouvez aussi
          consulter la page <Link href="/a-propos">À propos</Link> ou passer directement
          à <Link href="/carte">la carte</Link>.
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
