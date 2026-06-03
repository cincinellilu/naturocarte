import type { Metadata } from "next";
import AdminClientsView from "@/app/admin/clients/AdminClientsView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin clients",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminClientsPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const params = await searchParams;
  const errorCode = Array.isArray(params.error) ? params.error[0] : params.error;

  return <AdminClientsView planFilter="all" errorCode={errorCode} />;
}
