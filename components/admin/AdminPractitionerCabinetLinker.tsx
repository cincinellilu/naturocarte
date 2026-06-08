"use client";

import { useState } from "react";
import type {
  PractitionerCabinetLinkAccount,
  PractitionerCabinetLinkOperation,
  PractitionerCabinetLinkPractitioner,
  PractitionerCabinetLinkResult
} from "@/lib/practitioner-cabinet-linking";

type ApiSuccess = {
  ok: boolean;
  result: PractitionerCabinetLinkResult;
};

function buildAddressLine(practitioner: PractitionerCabinetLinkPractitioner): string {
  return [practitioner.adresse, practitioner.postal_code, practitioner.city]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(", ");
}

function getOperationLabel(operation: PractitionerCabinetLinkOperation): string {
  const authTarget = operation.would_create_auth_user
    ? `${operation.auth_email} (création prévue)`
    : operation.auth_email;

  if (operation.type === "link_existing_account") {
    return `${operation.practitioner} : réaffectation du compte existant vers ${authTarget}`;
  }

  if (operation.type === "reuse_unlinked_account") {
    return `${operation.practitioner} : réutilisation d’un compte non relié pour ${authTarget}`;
  }

  return `${operation.practitioner} : création d’un nouveau compte praticien pour ${authTarget}`;
}

function getAccountLabel(account: PractitionerCabinetLinkAccount, practitioners: PractitionerCabinetLinkPractitioner[]) {
  const practitioner =
    practitioners.find((item) => item.id === account.practitioner_id) ?? null;

  return {
    title: practitioner?.slug ?? "Compte sans fiche",
    subtitle: practitioner ? buildAddressLine(practitioner) : account.email
  };
}

export default function AdminPractitionerCabinetLinker() {
  const [loginEmail, setLoginEmail] = useState("");
  const [slugsInput, setSlugsInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payload, setPayload] = useState<ApiSuccess | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function submit(apply: boolean) {
    if (apply && !window.confirm("Appliquer ce rattachement maintenant ?")) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/admin/practitioner-cabinets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          loginEmail,
          slugs: slugsInput,
          apply
        })
      });

      const result = (await response.json()) as ApiSuccess | { error?: string };

      if (!response.ok) {
        throw new Error("error" in result ? result.error || "Le rattachement a échoué." : "Le rattachement a échoué.");
      }

      if (!("result" in result)) {
        throw new Error("Le rattachement a échoué.");
      }

      setPayload(result);
    } catch (error) {
      setPayload(null);
      setErrorMessage(error instanceof Error ? error.message : "Le rattachement a échoué.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const result = payload?.result ?? null;
  const accountItems = result ? (result.apply ? result.final_accounts : result.existing_accounts) : [];

  return (
    <section className="admin-panel admin-cabinet-linker-panel">
      <div>
        <h2>Rattacher plusieurs cabinets</h2>
        <p>
          Associez plusieurs fiches à un même compte praticien. Collez l’email de connexion du
          praticien puis 2 slugs minimum, ou directement les URLs complètes des fiches.
        </p>
      </div>

      <form
        className="admin-form"
        onSubmit={(event) => {
          event.preventDefault();
          void submit(true);
        }}
      >
        <div className="admin-form-grid">
          <label className="admin-form-field">
            <span>Email de connexion praticien</span>
            <input
              type="email"
              value={loginEmail}
              onChange={(event) => setLoginEmail(event.target.value)}
              placeholder="exemple@domaine.fr"
              required
            />
          </label>

          <label className="admin-form-field admin-form-field--full">
            <span>Slugs ou URLs des fiches</span>
            <textarea
              className="admin-textarea"
              value={slugsInput}
              onChange={(event) => setSlugsInput(event.target.value)}
              rows={6}
              placeholder={
                "clara-cornaert-pantin\nclara-cornaert-paris-10\nou https://naturocarte.fr/naturopathe/clara-cornaert-pantin"
              }
              required
            />
            <p className="admin-microcopy">
              Un slug ou une URL par ligne. La première fiche devient la fiche principale du compte.
            </p>
          </label>
        </div>

        <div className="admin-form-actions">
          <button
            className="btn btn-secondary"
            type="button"
            disabled={isSubmitting}
            onClick={() => void submit(false)}
          >
            {isSubmitting ? "Traitement..." : "Prévisualiser"}
          </button>
          <button className="btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Traitement..." : "Appliquer le rattachement"}
          </button>
          <p className="admin-inline-note">
            Prévisualisez d’abord si vous voulez vérifier les comptes, conflits et créations prévues.
          </p>
        </div>
      </form>

      {errorMessage ? <p className="admin-flash admin-flash--warning">{errorMessage}</p> : null}

      {result ? (
        <div className="admin-cabinet-linker-results">
          {result.conflicts.length > 0 ? (
            <p className="admin-warning">
              Des conflits bloquent le rattachement. Corrigez-les avant de relancer l’application.
            </p>
          ) : result.apply ? (
            <p className="admin-flash admin-flash--success">
              Rattachement appliqué. Les fiches ciblées partagent maintenant le même compte praticien.
            </p>
          ) : (
            <p className="admin-flash admin-flash--success">
              Prévisualisation prête. Vous pouvez maintenant appliquer le rattachement.
            </p>
          )}

          <div className="admin-cabinet-linker-grid">
            <div className="admin-cabinet-linker-block">
              <h3>Fiches ciblées</h3>
              <ul className="admin-ranked-list">
                {result.practitioners.map((practitioner) => (
                  <li key={practitioner.id}>
                    <span>
                      <strong>{practitioner.slug}</strong>
                      <br />
                      {buildAddressLine(practitioner) || "Adresse non renseignée"}
                    </span>
                    <strong>{practitioner.status || "sans statut"}</strong>
                  </li>
                ))}
              </ul>
            </div>

            <div className="admin-cabinet-linker-block">
              <h3>Actions prévues</h3>
              {result.operations.length > 0 ? (
                <ul className="admin-ranked-list">
                  {result.operations.map((operation, index) => (
                    <li key={`${operation.practitioner}-${operation.type}-${index}`}>
                      <span>{getOperationLabel(operation)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="admin-empty">Aucune action calculée.</p>
              )}
            </div>
          </div>

          {result.conflicts.length > 0 ? (
            <div className="admin-cabinet-linker-block">
              <h3>Conflits détectés</h3>
              <ul className="admin-ranked-list">
                {result.conflicts.map((conflict, index) => (
                  <li key={`${conflict.practitioner}-${index}`}>
                    <span>
                      {conflict.practitioner} : {conflict.auth_email} est déjà rattaché à la fiche{" "}
                      <code>{conflict.existing_practitioner_id}</code>.
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {accountItems.length > 0 ? (
            <div className="admin-cabinet-linker-block">
              <h3>{result.apply ? "Comptes finaux" : "Comptes déjà existants"}</h3>
              <ul className="admin-ranked-list">
                {accountItems.map((account) => {
                  const label = getAccountLabel(account, result.practitioners);

                  return (
                    <li key={account.id}>
                      <span>
                        <strong>{label.title}</strong>
                        <br />
                        {label.subtitle}
                      </span>
                      <strong>{account.email}</strong>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
