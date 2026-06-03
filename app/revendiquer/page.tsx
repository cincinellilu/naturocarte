import type { Metadata } from "next";
import Link from "next/link";
import PractitionerClaimForm from "@/components/PractitionerClaimForm";

export const metadata: Metadata = {
  title: "Revendiquer ma fiche naturopathe",
  description:
    "Retrouvez votre fiche NaturoCarte déjà référencée et rattachez-la rapidement à votre espace praticien.",
  alternates: {
    canonical: "/revendiquer"
  },
  robots: {
    index: false,
    follow: false
  }
};

type SearchParams = {
  first_name?: string | string[];
  last_name?: string | string[];
  email?: string | string[];
  campaign?: string | string[];
  tracking?: string | string[];
};

function getParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export default async function ClaimPractitionerPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <article className="article-shell claim-page">
      <nav className="breadcrumb-nav" aria-label="Fil d’Ariane">
        <ol>
          <li>
            <Link href="/">Accueil</Link>
          </li>
          <li aria-hidden="true">›</li>
          <li aria-current="page">Revendiquer ma fiche</li>
        </ol>
      </nav>

      <section className="section-shell claim-hero">
        <div>
          <p className="page-eyebrow">Revendiquer une fiche</p>
          <h1>Rattachez votre fiche NaturoCarte à votre espace praticien</h1>
          <p className="page-lead">
            Si votre fiche existe déjà sur NaturoCarte, retrouvez-la en quelques secondes,
            confirmez qu’il s’agit bien de vous, puis accédez directement à votre dashboard.
          </p>
        </div>
        <div className="claim-hero-steps" aria-label="Étapes de revendication">
          <span>1. Identifiez-vous</span>
          <span>2. Sélectionnez votre fiche</span>
          <span>3. Accédez au dashboard</span>
        </div>
      </section>

      <section className="section-shell claim-form-section">
        <div className="section-heading section-heading--stacked">
          <div>
            <p className="section-eyebrow">Recherche rapide</p>
            <h2>Retrouver ma fiche</h2>
          </div>
          <p className="section-intro">
            Renseignez les informations professionnelles utilisées dans votre activité.
            Les fiches déjà revendiquées ne sont pas proposées dans les résultats.
          </p>
        </div>

        <PractitionerClaimForm
          defaultFirstName={getParam(params.first_name)}
          defaultLastName={getParam(params.last_name)}
          defaultEmail={getParam(params.email)}
          defaultCampaignId={getParam(params.campaign)}
          defaultTrackingToken={getParam(params.tracking)}
        />
      </section>
    </article>
  );
}
