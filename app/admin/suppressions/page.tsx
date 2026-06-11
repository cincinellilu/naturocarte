import type { Metadata } from "next";
import AdminPractitionerErasureTool from "@/components/admin/AdminPractitionerErasureTool";
import AdminAuthGate from "@/components/admin/AdminAuthGate";
import AdminShell from "@/components/admin/AdminShell";
import {
  hasAdminProspectsAccess,
  isAdminProspectsConfigured
} from "@/lib/admin-prospects-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Suppressions RGPD | Admin NaturoCarte",
  robots: {
    index: false,
    follow: false
  }
};

function getErrorMessage(error: string | undefined): string | null {
  if (error === "invalid_password") return "Mot de passe incorrect.";
  if (error === "missing_config") return "Aucun mot de passe admin n’est configuré.";
  return null;
}

export default async function AdminSuppressionsPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const params = await searchParams;
  const errorCode = Array.isArray(params.error) ? params.error[0] : params.error;
  const errorMessage = getErrorMessage(errorCode);

  if (!isAdminProspectsConfigured()) {
    return (
      <AdminAuthGate
        eyebrow="Admin suppressions"
        title="Accès protégé"
        description="Connectez-vous pour accéder aux suppressions."
        nextPath="/admin/suppressions"
        errorMessage="Aucun mot de passe admin n’est configuré."
      />
    );
  }

  const hasAccess = await hasAdminProspectsAccess();
  if (!hasAccess) {
    return (
      <AdminAuthGate
        eyebrow="Admin suppressions"
        title="Accès protégé"
        description="Connectez-vous pour accéder aux suppressions."
        nextPath="/admin/suppressions"
        errorMessage={errorMessage}
      />
    );
  }

  return (
    <AdminShell
      section="compliance"
      eyebrow="Admin suppressions"
      title="Suppressions"
      description="Recherche et suppression définitive d’une fiche praticien."
      headerMeta={["Action irréversible", "Recherche par email"]}
    >
      <div className="admin-page">
        <AdminPractitionerErasureTool />
      </div>
    </AdminShell>
  );
}
