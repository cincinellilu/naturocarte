import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import AdminAuthGate from "@/components/admin/AdminAuthGate";
import AdminShell from "@/components/admin/AdminShell";
import AdminSparkline from "@/components/admin/AdminSparkline";
import {
  hasAdminProspectsAccess,
  isAdminProspectsConfigured
} from "@/lib/admin-prospects-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin NaturoCarte",
  robots: {
    index: false,
    follow: false
  }
};

type ProductEventRow = {
  id: string;
  created_at: string;
  event_name: string;
  page_path: string | null;
  source: string | null;
  session_id: string | null;
  practitioner_id: string | null;
  metadata: Record<string, unknown> | null;
};

type PractitionerRow = {
  id: string;
  first_name: string;
  last_name: string;
  slug: string;
};

type AdminMetrics = {
  events: ProductEventRow[];
  practitionersById: Map<string, PractitionerRow>;
};

function getErrorMessage(error: string | undefined): string | null {
  if (error === "invalid_password") return "Mot de passe incorrect.";
  if (error === "missing_config") return "Aucun mot de passe admin n’est configuré.";
  return null;
}

function countEvents(events: ProductEventRow[], eventNames: string[]) {
  const eventSet = new Set(eventNames);
  return events.filter((event) => eventSet.has(event.event_name)).length;
}

function getUniqueCount(events: ProductEventRow[], key: keyof ProductEventRow) {
  return new Set(events.map((event) => event[key]).filter(Boolean)).size;
}

function getTopItems(
  events: ProductEventRow[],
  getKey: (event: ProductEventRow) => string | null,
  limit = 8
) {
  const counts = new Map<string, number>();
  for (const event of events) {
    const key = getKey(event);
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit);
}

function getLastDaysEvents(events: ProductEventRow[], days = 7) {
  const formatter = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit"
  });

  return getTopItems(
    events,
    (event) => formatter.format(new Date(event.created_at)),
    days
  ).sort((left, right) => left[0].localeCompare(right[0], "fr"));
}

async function loadMetrics(): Promise<AdminMetrics | { error: true }> {
  const supabase = getSupabaseAdminClient();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: events, error } = await supabase
    .from("product_events")
    .select("id, created_at, event_name, page_path, source, session_id, practitioner_id, metadata")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(5000);

  if (error) {
    console.error("admin product events fetch error", error);
    return { error: true };
  }

  const practitionerIds = [
    ...new Set(
      (events ?? [])
        .map((event) => event.practitioner_id)
        .filter((id): id is string => Boolean(id))
    )
  ];

  let practitionersById = new Map<string, PractitionerRow>();

  if (practitionerIds.length > 0) {
    const { data: practitioners } = await supabase
      .from("practitioners")
      .select("id, first_name, last_name, slug")
      .in("id", practitionerIds);

    practitionersById = new Map(
      (practitioners ?? []).map((practitioner) => [practitioner.id, practitioner])
    );
  }

  return {
    events: (events ?? []) as ProductEventRow[],
    practitionersById
  };
}

export default async function AdminPage({
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
        eyebrow="Admin NaturoCarte"
        title="Accès protégé"
        description="Connectez-vous pour accéder à l’administration."
        nextPath="/admin"
        errorMessage="Aucun mot de passe admin n’est configuré."
      />
    );
  }

  const hasAccess = await hasAdminProspectsAccess();
  if (!hasAccess) {
    return (
      <AdminAuthGate
        eyebrow="Admin NaturoCarte"
        title="Accès protégé"
        description="Connectez-vous pour accéder à l’administration."
        nextPath="/admin"
        errorMessage={errorMessage}
      />
    );
  }

  const metrics = await loadMetrics();

  if ("error" in metrics) {
    return (
      <AdminShell
        section="overview"
        eyebrow="Admin NaturoCarte"
        title="Tableau de bord"
        description="Indicateurs globaux indisponibles pour le moment."
      >
        <div className="admin-page">
          <p className="page-alert">
            La table <code>product_events</code> n’est pas encore disponible ou ne peut pas être
            lue.
          </p>
        </div>
      </AdminShell>
    );
  }

  const { events, practitionersById } = metrics;
  const sessions = getUniqueCount(events, "session_id");
  const profileViews = countEvents(events, ["practitioner_profile_view"]);
  const contactClicks = countEvents(events, [
    "phone_click",
    "email_click",
    "website_click",
    "booking_click"
  ]);
  const favorites = countEvents(events, ["favorite_added"]);
  const reviews = countEvents(events, ["review_created_pending"]);
  const checkouts = countEvents(events, ["checkout_started"]);
  const subscriptions = countEvents(events, ["checkout_completed", "stripe_subscription_active"]);
  const mapEvents = countEvents(events, [
    "map_search_suggestion_selected",
    "map_filter_selected",
    "map_marker_clicked",
    "map_popup_opened",
    "map_geolocation_success"
  ]);

  const topPages = getTopItems(
    events.filter((event) => event.event_name === "landing_page_view"),
    (event) => event.page_path
  );
  const topEvents = getTopItems(events, (event) => event.event_name, 10);
  const topPractitioners = getTopItems(
    events.filter((event) => event.practitioner_id),
    (event) => event.practitioner_id
  ).map(([id, count]) => {
    const practitioner = practitionersById.get(id);
    return [
      practitioner
        ? `${practitioner.first_name} ${practitioner.last_name} · /naturopathe/${practitioner.slug}`
        : id,
      count
    ] as const;
  });
  const lastDays = getLastDaysEvents(events);

  return (
    <AdminShell
      section="overview"
      eyebrow="Admin NaturoCarte"
      title="Tableau de bord"
      description="Indicateurs globaux des 30 derniers jours."
      headerMeta={["30 derniers jours", `${events.length.toLocaleString("fr-FR")} événements`]}
    >
      <div className="admin-page">
        <section className="admin-kpi-grid" aria-label="Indicateurs principaux">
          <AdminKpi label="Événements" value={events.length} />
          <AdminKpi label="Sessions" value={sessions} />
          <AdminKpi label="Vues fiches" value={profileViews} />
          <AdminKpi label="Clics contact" value={contactClicks} />
          <AdminKpi label="Favoris ajoutés" value={favorites} />
          <AdminKpi label="Avis déposés" value={reviews} />
          <AdminKpi label="Checkouts lancés" value={checkouts} />
          <AdminKpi label="Abonnements confirmés" value={subscriptions} />
        </section>

        <section className="admin-insight-grid">
          <AdminPanel title="Activité récente" description="Répartition quotidienne sur les derniers jours.">
            <AdminSparkline items={lastDays} valueLabel="activité récente" />
          </AdminPanel>

          <AdminPanel title="Parcours carte" description="Recherches, filtres, marqueurs et popups.">
            <AdminKpi label="Interactions carte" value={mapEvents} compact />
            <AdminList
              items={getTopItems(
                events.filter((event) => event.event_name.startsWith("map_")),
                (event) => event.event_name,
                6
              )}
            />
          </AdminPanel>

          <AdminPanel title="Pages d’entrée" description="Pages qui démarrent les sessions suivies.">
            <AdminList items={topPages} emptyLabel="Aucune page vue trackée." />
          </AdminPanel>

          <AdminPanel title="Fiches les plus engagées" description="Vues, contacts, favoris et avis.">
            <AdminList items={topPractitioners} emptyLabel="Aucune fiche praticien trackée." />
          </AdminPanel>

          <AdminPanel title="Événements fréquents" description="Volume brut par type d’événement.">
            <AdminList items={topEvents} />
          </AdminPanel>
        </section>
      </div>
    </AdminShell>
  );
}

function AdminKpi({
  label,
  value,
  compact = false
}: {
  label: string;
  value: number;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "admin-kpi-card admin-kpi-card--compact" : "admin-kpi-card"}>
      <strong>{value.toLocaleString("fr-FR")}</strong>
      <span>{label}</span>
    </div>
  );
}

function AdminPanel({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="admin-panel">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {children}
    </section>
  );
}

function AdminList({
  items,
  emptyLabel = "Aucune donnée pour le moment."
}: {
  items: ReadonlyArray<readonly [string, number]>;
  emptyLabel?: string;
}) {
  if (items.length === 0) {
    return <p className="admin-empty">{emptyLabel}</p>;
  }

  const maxCount = Math.max(...items.map(([, count]) => count), 1);

  return (
    <ol className="admin-ranked-list">
      {items.map(([label, count]) => (
        <li
          key={label}
          style={
            {
              "--admin-bar-ratio": `${Math.max((count / maxCount) * 100, 8)}%`
            } as CSSProperties
          }
        >
          <span>{label}</span>
          <strong>{count.toLocaleString("fr-FR")}</strong>
        </li>
      ))}
    </ol>
  );
}
