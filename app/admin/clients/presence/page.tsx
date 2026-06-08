import type { Metadata } from "next";
import AdminClientsView from "@/app/admin/clients/AdminClientsView";
import { PRACTITIONER_PLAN_PRESENCE } from "@/lib/practitioner-plans";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin clients Présence",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminPresenceClientsPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string | string[]; saved?: string | string[] }>;
}) {
  const params = await searchParams;
  const errorCode = Array.isArray(params.error) ? params.error[0] : params.error;
  const savedCode = Array.isArray(params.saved) ? params.saved[0] : params.saved;

  return (
    <AdminClientsView
      planFilter={PRACTITIONER_PLAN_PRESENCE}
      errorCode={errorCode}
      savedCode={savedCode}
    />
  );
}
