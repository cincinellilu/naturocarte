import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Découvrez la mission de NaturoCarte, annuaire cartographique de naturopathes avec une approche neutre, descriptive et inscrite dans un cadre professionnel.",
  alternates: {
    canonical: "/a-propos"
  },
  openGraph: {
    title: "À propos | NaturoCarte",
    description:
      "Découvrez la mission de NaturoCarte, annuaire cartographique de naturopathes avec une approche neutre, descriptive et inscrite dans un cadre professionnel.",
    url: "/a-propos",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "À propos | NaturoCarte",
    description:
      "Découvrez la mission de NaturoCarte, annuaire cartographique de naturopathes avec une approche neutre, descriptive et inscrite dans un cadre professionnel."
  }
};

export default function AProposPage() {
  return (
    <article className="about-page">
      <header className="about-hero">
        <p className="about-eyebrow">NaturoCarte</p>
        <h1>À propos de NaturoCarte</h1>
        <p className="about-intro">
          NaturoCarte référence des naturopathes dans un annuaire cartographique conçu
          pour rendre la recherche plus lisible et plus rapide, avec une approche basée
          sur la géolocalisation.
        </p>
      </header>

      <section className="about-card">
        <h2 className="about-title">Mission</h2>
        <p>
          NaturoCarte a pour objectif de faciliter l&apos;accès à des informations claires
          sur les naturopathes, dans un format cartographique simple à consulter. La
          géolocalisation permet d&apos;identifier rapidement les praticiens proches d&apos;une
          adresse ou d&apos;une zone recherchée, afin d&apos;aider les utilisateurs à trouver un
          naturopathe près de chez eux. La première zone couverte est actuellement Paris,
          avec une extension progressive vers d&apos;autres territoires.
        </p>
      </section>

      <section className="about-card">
        <h2 className="about-title">Un annuaire spécialisé</h2>
        <p>
          NaturoCarte est un annuaire spécialisé, conçu pour présenter des fiches
          professionnelles et des données pratiques. Le service n&apos;est pas un comparateur
          ni un système de notation. Les contenus publiés sont descriptifs et visent à
          aider l&apos;orientation des utilisateurs, tout en améliorant la visibilité en ligne
          des naturopathes grâce à des fiches structurées et facilement accessibles.
        </p>
      </section>

      <section className="about-card">
        <h2 className="about-title">Neutralité et cadre professionnel</h2>
        <p>
          NaturoCarte adopte une ligne éditoriale neutre, sans hiérarchisation des
          praticiens et sans mise en avant de promesses. Les informations sont fournies à
          titre informatif.
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
        <h2 className="about-title">Référencement et visibilité</h2>
        <p>
          NaturoCarte renforce le référencement des fiches en proposant un contenu lisible
          et des liens internes cohérents autour de la carte et des pages praticiens. Cette
          organisation aide les utilisateurs à trouver plus facilement un naturopathe à
          proximité, et permet aux naturopathes d&apos;être plus visibles dans les recherches
          locales.
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
