import type { Metadata } from "next";
import Link from "next/link";
import { unsubscribeMarketingEmailByToken } from "@/lib/admin-emailing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Désinscription email | NaturoCarte",
  robots: {
    index: false,
    follow: false
  }
};

function normalizeToken(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0]?.trim() || "" : value?.trim() || "";
}

export default async function UnsubscribePage({
  searchParams
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const params = await searchParams;
  const token = normalizeToken(params.token);

  let title = "Lien invalide";
  let message =
    "Ce lien de désinscription est incomplet ou n’est plus reconnu par NaturoCarte.";

  if (token) {
    try {
      const result = await unsubscribeMarketingEmailByToken(token);

      if (result.ok) {
        title = "Désinscription confirmée";
        message = `L’adresse ${result.email} ne recevra plus les emails de prospection NaturoCarte.`;
      } else if (result.code === "not_found") {
        title = "Lien expiré ou déjà traité";
        message =
          "Nous n’avons pas retrouvé ce lien de désinscription. Si besoin, renvoie-toi le dernier email reçu.";
      }
    } catch (error) {
      console.error("unsubscribe page error", error);
      title = "Erreur temporaire";
      message =
        "NaturoCarte n’a pas pu enregistrer la désinscription pour le moment. Réessaie plus tard.";
    }
  }

  return (
    <article className="article-shell admin-page">
      <section className="admin-panel">
        <div>
          <p className="page-eyebrow">Préférences email</p>
          <h1>{title}</h1>
          <p className="page-lead">{message}</p>
        </div>
        <div className="admin-links">
          <Link className="btn" href="/">
            Retour à l’accueil
          </Link>
          <Link className="btn btn-secondary" href="/annuaire-naturopathes">
            Voir l’annuaire
          </Link>
        </div>
      </section>
    </article>
  );
}
