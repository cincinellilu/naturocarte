import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import AdminAuthGate from "@/components/admin/AdminAuthGate";
import AdminShell from "@/components/admin/AdminShell";
import AdminSparkline from "@/components/admin/AdminSparkline";
import {
  hasAdminProspectsAccess,
  isAdminProspectsConfigured
} from "@/lib/admin-prospects-auth";
import { fetchAllSupabaseRows } from "@/lib/fetch-all-supabase-rows";
import { getPractitionerPlan } from "@/lib/practitioner-plans";
import { getPractitionerProfileCompletion } from "@/lib/practitioner-profile-completion";
import {
  PRACTITIONER_STATUS_BOUNCED,
  PRACTITIONER_STATUS_HIDDEN_CONTACTED,
  PRACTITIONER_STATUS_HIDDEN_INTERNAL_TEST,
  PRACTITIONER_STATUS_HIDDEN_PENDING_CONTACT,
  PRACTITIONER_STATUS_PUBLISHED,
  PRACTITIONER_STATUS_PUBLISHED_CONTACTED,
  PRACTITIONER_STATUS_PUBLISHED_CONTACTED_CLAIMED,
  PRACTITIONER_STATUS_PUBLISHED_CONTACTED_CLICKED,
  PRACTITIONER_STATUS_PUBLISHED_CONTACTED_NOT_CLAIMED
} from "@/lib/practitioner-status";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Données fiche praticien | Admin NaturoCarte",
  robots: {
    index: false,
    follow: false
  }
};

const TRAFFIC_EVENT_NAMES = [
  "practitioner_profile_view",
  "phone_click",
  "email_click",
  "website_click",
  "booking_click",
  "favorite_added",
  "review_created_pending",
  "map_marker_clicked",
  "map_popup_opened"
] as const;

type TrafficEventName = (typeof TRAFFIC_EVENT_NAMES)[number];

type PractitionerRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  slug: string | null;
  status: string | null;
  adresse: string | null;
  postal_code: string | null;
  city: string | null;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  email: string | null;
  booking_url: string | null;
  website: string | null;
  photo_url: string | null;
  description: string | null;
};

type PractitionerAccountRow = {
  id: string;
  email: string;
  plan: string | null;
  contact_slot: string | null;
  created_at: string | null;
  updated_at: string | null;
  last_login_at: string | null;
  login_count: number | null;
  stripe_subscription_status: string | null;
};

type TrafficEventRow = {
  created_at: string;
  event_name: TrafficEventName;
  practitioner_id: string | null;
  source: string | null;
  page_path: string | null;
};

type PractitionerDetail = {
  practitioner: PractitionerRow | null;
  account: PractitionerAccountRow | null;
  events: TrafficEventRow[];
};

type SearchParams = {
  error?: string | string[];
};

function getErrorMessage(error: string | undefined): string | null {
  if (error === "invalid_password") return "Mot de passe incorrect.";
  if (error === "missing_config") return "Aucun mot de passe admin n’est configuré.";
  return null;
}

function getDisplayName(practitioner: PractitionerRow | null | undefined): string {
  if (!practitioner) return "Fiche introuvable";
  return `${practitioner.first_name ?? ""} ${practitioner.last_name ?? ""}`.trim() || "Nom incomplet";
}

function formatDate(value: string | null | undefined, emptyLabel = "Jamais") {
  if (!value) return emptyLabel;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatTrafficSourceLabel(source: string | null | undefined): string {
  switch (source) {
    case "directory":
      return "Annuaire";
    case "directory_department":
      return "Annuaire département";
    case "directory_search":
      return "Recherche annuaire";
    case "paris_directory":
      return "Page Paris";
    case "paris_arrondissement":
      return "Page arrondissement";
    case "map":
      return "Carte";
    case "map_list":
    case "map_list_popup":
      return "Liste carte";
    case "map_popup":
      return "Popup carte";
    case "map_mobile_popup":
      return "Popup carte mobile";
    case "profile_page":
      return "Fiche praticien";
    case "account_favorites":
      return "Favoris";
    case "home":
      return "Accueil";
    case "external":
      return "Externe";
    case "internal":
      return "Interne";
    case "direct":
      return "Accès direct";
    case "unknown":
      return "Inconnue";
    default:
      return source?.trim() || "Inconnue";
  }
}

function formatPractitionerStatusLabel(status: string | null | undefined): string {
  switch (status) {
    case PRACTITIONER_STATUS_PUBLISHED:
      return "Publié";
    case PRACTITIONER_STATUS_PUBLISHED_CONTACTED:
      return "Publié · contacté";
    case PRACTITIONER_STATUS_PUBLISHED_CONTACTED_CLAIMED:
      return "Publié · revendiqué";
    case PRACTITIONER_STATUS_PUBLISHED_CONTACTED_CLICKED:
      return "Publié · email cliqué";
    case PRACTITIONER_STATUS_PUBLISHED_CONTACTED_NOT_CLAIMED:
      return "Publié · non revendiqué";
    case PRACTITIONER_STATUS_HIDDEN_PENDING_CONTACT:
      return "Masqué · avant contact";
    case PRACTITIONER_STATUS_HIDDEN_CONTACTED:
      return "Masqué · contacté";
    case PRACTITIONER_STATUS_BOUNCED:
      return "Email en erreur";
    case PRACTITIONER_STATUS_HIDDEN_INTERNAL_TEST:
      return "Test interne";
    default:
      return status?.trim() || "Sans statut";
  }
}

function formatEventLabel(eventName: string): string {
  switch (eventName) {
    case "practitioner_profile_view":
      return "Vue fiche";
    case "phone_click":
      return "Clic téléphone";
    case "email_click":
      return "Clic email";
    case "website_click":
      return "Clic site web";
    case "booking_click":
      return "Clic réservation";
    case "favorite_added":
      return "Ajout favori";
    case "review_created_pending":
      return "Avis déposé";
    case "map_marker_clicked":
      return "Clic marqueur carte";
    case "map_popup_opened":
      return "Popup carte ouverte";
    default:
      return eventName;
  }
}

function countEvents(events: TrafficEventRow[], eventName: TrafficEventName): number {
  return events.filter((event) => event.event_name === eventName).length;
}

function getSourceRanking(events: TrafficEventRow[], limit = 8): ReadonlyArray<readonly [string, number]> {
  const counts = new Map<string, number>();

  for (const event of events) {
    if (event.event_name !== "practitioner_profile_view") continue;
    const label = formatTrafficSourceLabel(event.source);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], "fr"))
    .slice(0, limit);
}

function getRecentViewItems(events: TrafficEventRow[], days = 14): ReadonlyArray<readonly [string, number]> {
  const formatter = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit"
  });
  const dayKeys: Array<{ iso: string; label: string }> = [];
  const counts = new Map<string, number>();

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - offset);
    const iso = date.toISOString().slice(0, 10);
    dayKeys.push({ iso, label: formatter.format(date) });
    counts.set(iso, 0);
  }

  for (const event of events) {
    if (event.event_name !== "practitioner_profile_view") continue;
    const day = event.created_at.slice(0, 10);
    if (!counts.has(day)) continue;
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }

  return dayKeys.map((day) => [day.label, counts.get(day.iso) ?? 0] as const);
}

async function loadPractitionerDetail(practitionerId: string): Promise<PractitionerDetail> {
  const supabase = getSupabaseAdminClient();

  const { data: practitioner, error: practitionerError } = await supabase
    .from("practitioners")
    .select(
      "id, first_name, last_name, slug, status, adresse, postal_code, city, lat, lng, phone, email, booking_url, website, photo_url, description"
    )
    .eq("id", practitionerId)
    .maybeSingle();

  if (practitionerError) {
    console.error("admin practitioner detail fetch error", practitionerError);
  }

  const { data: accounts, error: accountError } = await supabase
    .from("practitioner_accounts")
    .select("id, email, plan, contact_slot, created_at, updated_at, last_login_at, login_count, stripe_subscription_status")
    .eq("practitioner_id", practitionerId)
    .order("updated_at", { ascending: false, nullsFirst: false })
    .limit(1);

  if (accountError) {
    console.error("admin practitioner account detail fetch error", accountError);
  }

  const events = await fetchAllSupabaseRows<TrafficEventRow>((from, to) =>
    supabase
      .from("product_events")
      .select("created_at, event_name, practitioner_id, source, page_path")
      .eq("practitioner_id", practitionerId)
      .in("event_name", [...TRAFFIC_EVENT_NAMES])
      .order("created_at", { ascending: false })
      .range(from, to)
  );

  return {
    practitioner: (practitioner ?? null) as PractitionerRow | null,
    account: ((accounts ?? [])[0] ?? null) as PractitionerAccountRow | null,
    events
  };
}

export default async function ActivePractitionerDetailAdminPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const [{ id }, queryParams] = await Promise.all([params, searchParams]);
  const errorCode = Array.isArray(queryParams.error) ? queryParams.error[0] : queryParams.error;
  const errorMessage = getErrorMessage(errorCode);
  const nextPath = `/admin/praticiens-actifs/${id}`;

  if (!isAdminProspectsConfigured()) {
    return (
      <AdminAuthGate
        eyebrow="Admin praticiens"
        title="Accès protégé"
        description="Connectez-vous pour consulter les données d’une fiche praticien."
        nextPath={nextPath}
        errorMessage="Aucun mot de passe admin n’est configuré."
      />
    );
  }

  const hasAccess = await hasAdminProspectsAccess();
  if (!hasAccess) {
    return (
      <AdminAuthGate
        eyebrow="Admin praticiens"
        title="Accès protégé"
        description="Connectez-vous pour consulter les données d’une fiche praticien."
        nextPath={nextPath}
        errorMessage={errorMessage}
      />
    );
  }

  const { practitioner, account, events } = await loadPractitionerDetail(id);
  const plan = getPractitionerPlan(account?.plan);
  const completion = getPractitionerProfileCompletion({
    practitioner,
    plan: account?.plan,
    contactSlot: account?.contact_slot
  });
  const displayName = getDisplayName(practitioner);
  const profileViews = countEvents(events, "practitioner_profile_view");
  const phoneClicks = countEvents(events, "phone_click");
  const emailClicks = countEvents(events, "email_click");
  const websiteClicks = countEvents(events, "website_click");
  const bookingClicks = countEvents(events, "booking_click");
  const favorites = countEvents(events, "favorite_added");
  const reviews = countEvents(events, "review_created_pending");
  const mapOpens = countEvents(events, "map_popup_opened");
  const recentViews = getRecentViewItems(events);
  const sources = getSourceRanking(events);

  return (
    <AdminShell
      section="practitioners"
      eyebrow="Admin praticiens"
      title={displayName}
      description="Données détaillées de la fiche sélectionnée: compte, complétion, vues, contacts et événements récents."
      headerMeta={[
        account ? `Le forfait ${plan.name}` : "Compte non rattaché",
        formatPractitionerStatusLabel(practitioner?.status),
        `${profileViews.toLocaleString("fr-FR")} vue(s) fiche`
      ]}
    >
      <div className="admin-page">
        <div className="admin-links admin-links--start">
          <Link className="btn btn-secondary" href="/admin/praticiens-actifs">
            ← Retour aux praticiens actifs
          </Link>
          {practitioner?.slug ? (
            <Link className="btn" href={`/naturopathe/${practitioner.slug}`}>
              Voir la fiche publique
            </Link>
          ) : null}
        </div>

        {!practitioner ? (
          <p className="page-alert">Cette fiche praticien est introuvable.</p>
        ) : (
          <>
            <section className="admin-kpi-grid" aria-label="Indicateurs de la fiche">
              <AdminKpi label="Vues fiche" value={profileViews} />
              <AdminKpi label="Clics téléphone" value={phoneClicks} />
              <AdminKpi label="Clics email" value={emailClicks} />
              <AdminKpi label="Clics site web" value={websiteClicks} />
              <AdminKpi label="Clics réservation" value={bookingClicks} />
              <AdminKpi label="Favoris" value={favorites} />
              <AdminKpi label="Avis déposés" value={reviews} />
              <AdminKpi label="Popups carte" value={mapOpens} />
            </section>

            <section className="admin-insight-grid">
              <AdminPanel title="Vues récentes" description="Vues de la fiche sur les 14 derniers jours.">
                <AdminSparkline items={recentViews} valueLabel="vues fiche" />
              </AdminPanel>

              <AdminPanel title="Sources des vues" description="Origine des vues de fiche trackées.">
                <AdminList items={sources} emptyLabel="Aucune source de vue trackée." />
              </AdminPanel>
            </section>

            <section className="admin-insight-grid admin-insight-grid--balanced">
              <AdminPanel title="Compte praticien" description="Informations liées au compte rattaché à cette fiche.">
                {account ? (
                  <div className="admin-detail-grid">
                    <AdminDetail label="Email compte" value={account.email} />
                    <AdminDetail label="Forfait" value={`Le forfait ${plan.name}`} />
                    <AdminDetail label="Statut abonnement" value={account.stripe_subscription_status ?? "Non renseigné"} />
                    <AdminDetail label="Dernière connexion" value={formatDate(account.last_login_at)} />
                    <AdminDetail label="Connexions" value={Number(account.login_count ?? 0).toLocaleString("fr-FR")} />
                    <AdminDetail label="Création compte" value={formatDate(account.created_at, "Non renseignée")} />
                  </div>
                ) : (
                  <p className="admin-empty">Aucun compte praticien n’est rattaché à cette fiche.</p>
                )}
              </AdminPanel>

              <AdminPanel title="Complétion de la fiche" description="Calcul selon le forfait actuel du praticien.">
                <div className="admin-completion-row">
                  <div>
                    <strong>{completion.percent} %</strong>
                    <span>{completion.completedItems}/{completion.totalItems} élément(s)</span>
                  </div>
                  <div
                    className="admin-completion-track"
                    role="progressbar"
                    aria-valuenow={completion.percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <span style={{ width: `${completion.percent}%` }} />
                  </div>
                </div>
                {completion.missingItems.length > 0 ? (
                  <ul className="admin-missing-list">
                    {completion.missingItems.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="admin-empty">Fiche complète selon le forfait actuel.</p>
                )}
              </AdminPanel>
            </section>

            <AdminPanel title="Informations publiques" description="Données actuellement rattachées à la fiche publique.">
              <div className="admin-detail-grid admin-detail-grid--wide">
                <AdminDetail label="Adresse" value={[practitioner.adresse, practitioner.postal_code, practitioner.city].filter(Boolean).join(", ") || "Non renseignée"} />
                <AdminDetail label="Coordonnées carte" value={practitioner.lat !== null && practitioner.lng !== null ? `${practitioner.lat}, ${practitioner.lng}` : "Non renseignées"} />
                <AdminDetail label="Téléphone" value={practitioner.phone ?? "Non renseigné"} />
                <AdminDetail label="Email fiche" value={practitioner.email ?? "Non renseigné"} />
                <AdminDetail label="Réservation" value={practitioner.booking_url ?? "Non renseignée"} />
                <AdminDetail label="Site web" value={practitioner.website ?? "Non renseigné"} />
              </div>
            </AdminPanel>

            <AdminPanel title="Événements récents" description="Derniers signaux trackés pour cette fiche.">
              {events.length > 0 ? (
                <div className="admin-table-wrap">
                  <table className="admin-table admin-table--compact">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Événement</th>
                        <th>Source</th>
                        <th>Page</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.slice(0, 60).map((event, index) => (
                        <tr key={`${event.created_at}-${event.event_name}-${index}`}>
                          <td>{formatDate(event.created_at)}</td>
                          <td><strong>{formatEventLabel(event.event_name)}</strong></td>
                          <td>{formatTrafficSourceLabel(event.source)}</td>
                          <td>{event.page_path ?? "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="admin-empty">Aucun événement tracké pour cette fiche.</p>
              )}
            </AdminPanel>
          </>
        )}
      </div>
    </AdminShell>
  );
}

function AdminKpi({ label, value }: { label: string; value: number }) {
  return (
    <div className="admin-kpi-card">
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

function AdminDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="admin-detail-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
