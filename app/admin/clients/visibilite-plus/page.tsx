import type { Metadata } from "next";
import AdminClientsView from "@/app/admin/clients/AdminClientsView";
import { PRACTITIONER_PLAN_VISIBILITY } from "@/lib/practitioner-plans";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin clients Visibilité+",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminVisibilityClientsPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const params = await searchParams;
  const errorCode = Array.isArray(params.error) ? params.error[0] : params.error;

  return <AdminClientsView planFilter={PRACTITIONER_PLAN_VISIBILITY} errorCode={errorCode} />;
}
