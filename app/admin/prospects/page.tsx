import type { Metadata } from "next";
import AdminProspectsDashboard, {
  type AdminProspect
} from "@/components/AdminProspectsDashboard";
import AdminAuthGate from "@/components/admin/AdminAuthGate";
import AdminShell from "@/components/admin/AdminShell";
import {
  hasAdminProspectsAccess,
  isAdminProspectsConfigured
} from "@/lib/admin-prospects-auth";
import { fetchAllSupabaseRows } from "@/lib/fetch-all-supabase-rows";
import { MANAGED_PROSPECT_STATUSES } from "@/lib/practitioner-status";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin prospects",
  robots: {
    index: false,
    follow: false
  }
};

function getErrorMessage(error: string | undefined): string | null {
  if (error === "invalid_password") {
    return "Mot de passe incorrect.";
  }

  if (error === "missing_config") {
    return "Aucun mot de passe admin n’est configuré.";
  }

  return null;
}

export default async function AdminProspectsPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const params = await searchParams;
  const errorCode = Array.isArray(params.error) ? params.error[0] : params.error;
  const errorMessage = getErrorMessage(errorCode);
  const isConfigured = isAdminProspectsConfigured();

  if (!isConfigured) {
    return (
      <AdminAuthGate
        eyebrow="Admin prospects"
        title="Configuration manquante"
        description="Aucun mot de passe admin n’est configuré pour le moment."
        nextPath="/admin/prospects"
        errorMessage={null}
      />
    );
  }

  const hasAccess = await hasAdminProspectsAccess();

  if (!hasAccess) {
    return (
      <AdminAuthGate
        eyebrow="Admin prospects"
        title="Accès protégé"
        description="Connectez-vous pour gérer les naturopathes à contacter et les retirer temporairement du site si nécessaire."
        nextPath="/admin/prospects"
        errorMessage={errorMessage}
      />
    );
  }

  let practitioners: AdminProspect[] = [];
  let hasError = false;

  try {
    const supabase = getSupabaseAdminClient();
    practitioners = await fetchAllSupabaseRows<AdminProspect>((from, to) =>
      supabase
        .from("practitioners")
        .select("slug, first_name, last_name, adresse, postal_code, city, phone, email, website, status")
        .in("status", [...MANAGED_PROSPECT_STATUSES])
        .order("city", { ascending: true })
        .order("last_name", { ascending: true })
        .range(from, to)
    );
  } catch {
    hasError = true;
  }

  return (
    <AdminShell
      section="prospects"
      eyebrow="Admin prospects"
      title="Suivi des naturopathes"
      description="Cochez Contacté quand la prise de contact est faite, et Retiré du site pour masquer complètement une fiche pendant le suivi."
      headerMeta={["Suivi commercial", `${practitioners.length.toLocaleString("fr-FR")} fiches suivies`]}
    >
      <div className="admin-page">
        {hasError ? (
          <p className="page-alert">Impossible de charger les praticiens pour le moment.</p>
        ) : (
          <AdminProspectsDashboard practitioners={practitioners} />
        )}
      </div>
    </AdminShell>
  );
}
