import type { Metadata } from "next";
import Link from "next/link";
import { legalIdentity } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Conditions générales d’utilisation et de vente",
  description:
    "Conditions générales d’utilisation et de vente de NaturoCarte: annuaire, comptes praticiens, forfaits, abonnement Visibilité+ et paiement.",
  alternates: {
    canonical: "/conditions-generales"
  },
  openGraph: {
    title: "Conditions générales | NaturoCarte",
    description:
      "Conditions applicables à l’utilisation de NaturoCarte et à la souscription du forfait Visibilité+.",
    url: "/conditions-generales",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "Conditions générales | NaturoCarte",
    description:
      "Conditions applicables à l’utilisation de NaturoCarte et à la souscription du forfait Visibilité+."
  }
};

export default function ConditionsGeneralesPage() {
  return (
    <article>
      <h1>Conditions générales d’utilisation et de vente</h1>

      <section>
        <h2>Éditeur et champ d’application</h2>
        <p>
          Les présentes conditions encadrent l’utilisation du site {legalIdentity.brandName},
          accessible à l’adresse {legalIdentity.websiteUrl}, édité par {legalIdentity.editorName}{" "}
          ({legalIdentity.editorTradeName}), {legalIdentity.editorLegalForm}, SIRET{" "}
          {legalIdentity.editorSiret}.
        </p>
        <p>
          Elles s’appliquent aux visiteurs, aux utilisateurs disposant d’un compte et aux
          praticiens qui créent ou administrent une fiche sur NaturoCarte.
        </p>
      </section>

      <section>
        <h2>Objet du service</h2>
        <p>
          NaturoCarte est un annuaire cartographique et local destiné à faciliter la recherche
          de naturopathes par carte, département, arrondissement à Paris et fiche praticien.
        </p>
        <p>
          NaturoCarte n’est pas un service médical, ne recommande pas personnellement un
          praticien et ne garantit pas les résultats d’une consultation. Les utilisateurs
          restent responsables de leur choix et de leur prise de contact.
        </p>
      </section>

      <section>
        <h2>Comptes utilisateurs</h2>
        <p>
          Les utilisateurs peuvent créer un compte afin de gérer certaines fonctionnalités,
          notamment les favoris et les avis. L’utilisateur s’engage à fournir des informations
          exactes et à ne pas publier de contenu illicite, trompeur, injurieux ou portant
          atteinte aux droits de tiers.
        </p>
        <p>
          NaturoCarte peut modérer, refuser ou supprimer un avis lorsqu’il ne respecte pas
          les règles du service ou lorsqu’il paraît manifestement abusif.
        </p>
      </section>

      <section>
        <h2>Comptes praticiens et fiches</h2>
        <p>
          Les praticiens peuvent créer un espace praticien afin de créer, compléter ou modifier
          leur fiche. Le praticien garantit l’exactitude des informations publiées, notamment
          son identité professionnelle, son SIRET, son adresse et ses moyens de contact.
        </p>
        <p>
          NaturoCarte peut refuser, suspendre ou dépublier une fiche en cas d’information
          manifestement erronée, de contenu non conforme, de demande légitime d’un tiers ou
          d’usage contraire à l’objet du service.
        </p>
      </section>

      <section>
        <h2>Forfaits praticiens</h2>
        <p>
          Le forfait Présence permet de disposer gratuitement d’une fiche publique simple,
          avec un moyen de contact actif au choix.
        </p>
        <p>
          Le forfait Visibilité+ est proposé au prix de 5 € par mois. Il donne accès aux
          fonctionnalités enrichies disponibles dans l’espace praticien, notamment la photo
          de profil, les informations enrichies, les statistiques de consultation et les
          fonctionnalités d’avis selon leur disponibilité dans le service.
        </p>
        <p>
          Les fonctionnalités incluses peuvent évoluer afin d’améliorer le service, sans
          suppression abusive d’un droit déjà payé pour la période en cours.
        </p>
      </section>

      <section>
        <h2>Paiement, facturation et renouvellement</h2>
        <p>
          Les paiements du forfait Visibilité+ sont traités par Stripe. NaturoCarte ne stocke
          pas les coordonnées bancaires. Les factures sont mises à disposition via Stripe ou
          depuis les liens communiqués au praticien lorsque Stripe les fournit.
        </p>
        <p>
          L’abonnement Visibilité+ est renouvelé automatiquement chaque mois, sauf résiliation
          avant la date de renouvellement. Le prix applicable est celui affiché au moment de
          la souscription, sauf information préalable en cas d’évolution tarifaire.
        </p>
      </section>

      <section>
        <h2>Résiliation et changement de forfait</h2>
        <p>
          Le praticien peut gérer son abonnement depuis son espace praticien, notamment via le
          portail de facturation Stripe lorsqu’il est disponible. Une résiliation met fin au
          renouvellement automatique. Les fonctionnalités payantes peuvent rester accessibles
          jusqu’à la fin de la période déjà payée, selon le statut retourné par Stripe.
        </p>
        <p>
          Le passage au forfait Présence désactive les fonctionnalités payantes associées à
          Visibilité+ lorsque l’abonnement n’est plus actif.
        </p>
      </section>

      <section>
        <h2>Droit de rétractation</h2>
        <p>
          Lorsque le praticien souscrit en qualité de professionnel pour les besoins de son
          activité, les règles de rétractation applicables aux consommateurs ne s’appliquent
          pas nécessairement. Si une situation particulière ouvre un droit de rétractation,
          la demande peut être adressée à {legalIdentity.contactEmail}.
        </p>
      </section>

      <section>
        <h2>Responsabilité</h2>
        <p>
          NaturoCarte met en œuvre les moyens raisonnables pour maintenir le service accessible
          et les informations à jour, mais ne garantit pas l’absence d’erreur, d’interruption
          ou d’indisponibilité temporaire.
        </p>
        <p>
          Les informations de santé, de bien-être ou de pratique professionnelle affichées sur
          les fiches relèvent de la responsabilité du praticien qui les communique.
        </p>
      </section>

      <section>
        <h2>Données personnelles</h2>
        <p>
          Les traitements de données personnelles sont détaillés dans la{" "}
          <Link href="/confidentialite">politique de confidentialité</Link>.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Pour toute question relative aux présentes conditions: {legalIdentity.contactEmail}.
        </p>
      </section>
    </article>
  );
}
