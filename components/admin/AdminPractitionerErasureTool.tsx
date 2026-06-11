"use client";

import { useMemo, useState } from "react";

type PractitionerRow = {
  id: string;
  slug: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  adresse: string | null;
  postal_code: string | null;
  city: string | null;
  status: string | null;
};

type PractitionerAccountRow = {
  id: string;
  auth_user_id: string | null;
  practitioner_id: string | null;
  email: string | null;
  plan: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_subscription_status: string | null;
  created_at: string | null;
};

type ErasureCandidate = {
  practitioner: PractitionerRow;
  accounts: PractitionerAccountRow[];
  childCounts: Record<string, number>;
};

type SearchPayload = {
  email: string;
  candidates: ErasureCandidate[];
};

type DeletePayload = {
  ok: true;
  deletedAt: string;
  before: ErasureCandidate;
  after: {
    practitioner: null;
  };
  exclusionEntry: Record<string, unknown>;
};

function buildDisplayName(practitioner: PractitionerRow): string {
  return `${practitioner.first_name ?? ""} ${practitioner.last_name ?? ""}`.trim() || "Nom incomplet";
}

function buildAddress(practitioner: PractitionerRow): string {
  return [practitioner.adresse, practitioner.postal_code, practitioner.city]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(", ");
}

function getTotalChildRows(candidate: ErasureCandidate): number {
  return Object.values(candidate.childCounts).reduce((total, value) => total + value, 0);
}

function getActiveSubscriptionCount(candidate: ErasureCandidate): number {
  return candidate.accounts.filter((account) =>
    ["active", "trialing", "past_due"].includes(account.stripe_subscription_status ?? "")
  ).length;
}

async function parseJsonResponse<T extends object>(response: Response): Promise<T> {
  const payload = (await response.json()) as T | { error?: string };

  if (!response.ok) {
    const errorPayload = payload as { error?: string };
    throw new Error(errorPayload.error || "Action impossible.");
  }

  return payload as T;
}

export default function AdminPractitionerErasureTool() {
  const [email, setEmail] = useState("");
  const [confirmationEmail, setConfirmationEmail] = useState("");
  const [selectedPractitionerId, setSelectedPractitionerId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchPayload, setSearchPayload] = useState<SearchPayload | null>(null);
  const [deletePayload, setDeletePayload] = useState<DeletePayload | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedCandidate = useMemo(
    () => searchPayload?.candidates.find((candidate) => candidate.practitioner.id === selectedPractitionerId) ?? null,
    [searchPayload, selectedPractitionerId]
  );

  async function search() {
    setIsSearching(true);
    setErrorMessage(null);
    setDeletePayload(null);
    setSelectedPractitionerId("");
    setConfirmationEmail("");

    try {
      const response = await fetch(`/api/admin/practitioner-erasure?email=${encodeURIComponent(email.trim())}`);
      const payload = await parseJsonResponse<SearchPayload>(response);
      setSearchPayload(payload);
      if (payload.candidates.length === 1) {
        setSelectedPractitionerId(payload.candidates[0].practitioner.id);
      }
    } catch (error) {
      setSearchPayload(null);
      setErrorMessage(error instanceof Error ? error.message : "Recherche impossible.");
    } finally {
      setIsSearching(false);
    }
  }

  async function deleteSelected() {
    if (!selectedCandidate) return;

    const name = buildDisplayName(selectedCandidate.practitioner);
    const confirmed = window.confirm(
      `Supprimer définitivement la fiche ${name} ? Cette action retire la fiche publique et ses données rattachées.`
    );

    if (!confirmed) return;

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/admin/practitioner-erasure", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          practitionerId: selectedCandidate.practitioner.id,
          email: searchPayload?.email ?? email,
          confirmationEmail
        })
      });
      const payload = await parseJsonResponse<DeletePayload>(response);
      setDeletePayload(payload);
      setSearchPayload({ email: searchPayload?.email ?? email, candidates: [] });
      setSelectedPractitionerId("");
      setConfirmationEmail("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Suppression impossible.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <section className="admin-panel admin-erasure-panel">
      <div>
        <h2>Supprimer une fiche à la demande d’un praticien</h2>
        <p>
          Recherchez l’email demandé, vérifiez la fiche remontée, puis confirmez la suppression.
          L’email est aussi ajouté à la suppression list marketing pour éviter une nouvelle prise de contact.
        </p>
      </div>

      <form
        className="admin-form"
        onSubmit={(event) => {
          event.preventDefault();
          void search();
        }}
      >
        <div className="admin-form-grid">
          <label className="admin-form-field admin-form-field--full">
            <span>Email à supprimer</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="email@domaine.fr"
              required
            />
          </label>
        </div>

        <div className="admin-form-actions">
          <button className="btn" type="submit" disabled={isSearching || isDeleting}>
            {isSearching ? "Recherche..." : "Rechercher la fiche"}
          </button>
          <p className="admin-inline-note">
            La suppression est irréversible côté base. Prévisualisez toujours avant d’appliquer.
          </p>
        </div>
      </form>

      {errorMessage ? <p className="admin-flash admin-flash--warning">{errorMessage}</p> : null}

      {searchPayload ? (
        <div className="admin-erasure-results">
          {searchPayload.candidates.length === 0 ? (
            <p className="admin-empty">Aucune fiche ne correspond à cet email.</p>
          ) : (
            <>
              <div className="admin-erasure-results-head">
                <h3>Fiches trouvées</h3>
                <p>{searchPayload.candidates.length} fiche(s) correspondent à {searchPayload.email}.</p>
              </div>

              <div className="admin-erasure-candidate-list">
                {searchPayload.candidates.map((candidate) => {
                  const practitioner = candidate.practitioner;
                  const isSelected = practitioner.id === selectedPractitionerId;
                  const childRows = getTotalChildRows(candidate);
                  const activeSubscriptions = getActiveSubscriptionCount(candidate);

                  return (
                    <label
                      className={`admin-erasure-candidate${isSelected ? " is-selected" : ""}`}
                      key={practitioner.id}
                    >
                      <input
                        type="radio"
                        name="practitioner-erasure-candidate"
                        checked={isSelected}
                        onChange={() => setSelectedPractitionerId(practitioner.id)}
                      />
                      <span className="admin-erasure-candidate-main">
                        <strong>{buildDisplayName(practitioner)}</strong>
                        <span>{buildAddress(practitioner) || "Adresse non renseignée"}</span>
                        <span>{practitioner.email || "Email fiche non renseigné"}</span>
                      </span>
                      <span className="admin-erasure-candidate-meta">
                        <span className="admin-status-pill">{practitioner.status || "sans statut"}</span>
                        <span className="admin-status-pill">{candidate.accounts.length} compte(s)</span>
                        <span className="admin-status-pill">{childRows} ligne(s) liées</span>
                        {activeSubscriptions > 0 ? (
                          <span className="admin-status-pill admin-status-pill--danger">
                            {activeSubscriptions} abonnement(s) actif(s)
                          </span>
                        ) : null}
                      </span>
                    </label>
                  );
                })}
              </div>
            </>
          )}
        </div>
      ) : null}

      {selectedCandidate ? (
        <div className="admin-erasure-confirm dashboard-danger-zone">
          <div>
            <h3>Confirmation de suppression</h3>
            <p>
              Vous allez supprimer <strong>{buildDisplayName(selectedCandidate.practitioner)}</strong>, sa fiche publique,
              ses comptes praticiens rattachés et les données liées listées ci-dessous.
            </p>
          </div>

          <div className="admin-detail-grid admin-detail-grid--wide">
            <div className="admin-detail-item">
              <span>Slug</span>
              <strong>{selectedCandidate.practitioner.slug || "Non renseigné"}</strong>
            </div>
            <div className="admin-detail-item">
              <span>Téléphone</span>
              <strong>{selectedCandidate.practitioner.phone || "Non renseigné"}</strong>
            </div>
            <div className="admin-detail-item">
              <span>Dépendances</span>
              <strong>{getTotalChildRows(selectedCandidate).toLocaleString("fr-FR")} ligne(s)</strong>
            </div>
          </div>

          <details className="admin-erasure-details">
            <summary>Voir le détail des lignes rattachées</summary>
            <ul className="admin-ranked-list">
              {Object.entries(selectedCandidate.childCounts).map(([label, count]) => (
                <li key={label}>
                  <span>{label}</span>
                  <strong>{count.toLocaleString("fr-FR")}</strong>
                </li>
              ))}
            </ul>
          </details>

          <label className="admin-form-field admin-form-field--full">
            <span>Ressaisissez l’email pour confirmer</span>
            <input
              type="email"
              value={confirmationEmail}
              onChange={(event) => setConfirmationEmail(event.target.value)}
              placeholder={searchPayload?.email ?? email}
            />
          </label>

          <div className="admin-form-actions">
            <button
              className="btn btn-secondary dashboard-danger-btn"
              type="button"
              disabled={isDeleting || confirmationEmail.trim().toLowerCase() !== (searchPayload?.email ?? email).trim().toLowerCase()}
              onClick={() => void deleteSelected()}
            >
              {isDeleting ? "Suppression..." : "Supprimer définitivement la fiche"}
            </button>
            <p className="admin-inline-note">
              Le compte auth Supabase éventuel n’est pas supprimé automatiquement. La fiche ne sera plus affichée.
            </p>
          </div>
        </div>
      ) : null}

      {deletePayload ? (
        <div className="admin-flash admin-flash--success">
          Fiche supprimée le {new Intl.DateTimeFormat("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          }).format(new Date(deletePayload.deletedAt))}. L’email a été ajouté à la suppression list marketing.
        </div>
      ) : null}
    </section>
  );
}
