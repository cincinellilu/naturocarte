"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  PRACTITIONER_CLAIM_CAMPAIGN_STORAGE_KEY,
  normalizePractitionerClaimCampaignId
} from "@/lib/practitioner-claim-campaigns";

type ClaimCandidate = {
  id: string;
  slug: string;
  first_name: string | null;
  last_name: string | null;
  address: string;
  email: string | null;
};

type ClaimStep = "idle" | "results" | "empty";

type PractitionerClaimFormProps = {
  defaultFirstName?: string | null;
  defaultLastName?: string | null;
  defaultEmail?: string | null;
  defaultCampaignId?: string | null;
  defaultTrackingToken?: string | null;
};

type StoredCampaignContext = {
  campaignId: string;
  trackingToken: string;
  clickRecordedAt: string | null;
};

function getErrorLabel(error: string | null): string | null {
  if (!error) return null;
  if (error === "already_claimed") return "Cette fiche a déjà été revendiquée.";
  if (error === "identity_mismatch") {
    return "Les informations saisies ne correspondent pas à cette fiche.";
  }
  if (error === "account_already_linked") {
    return "Cet email est déjà relié à une autre fiche praticien.";
  }
  if (error === "already_claimed") {
    return "Cette fiche est déjà rattachée à un espace praticien.";
  }
  if (error === "auth_user_failed") {
    return "Le compte de connexion n’a pas pu être préparé. Réessayez dans quelques instants.";
  }
  if (error === "account_update_failed" || error === "account_creation_failed") {
    return "La fiche a été trouvée, mais le rattachement du compte n’a pas pu être confirmé.";
  }
  return `La revendication n’a pas pu aboutir (${error}). Vérifiez les informations et réessayez.`;
}

export default function PractitionerClaimForm({
  defaultFirstName = "",
  defaultLastName = "",
  defaultEmail = "",
  defaultCampaignId = "",
  defaultTrackingToken = ""
}: PractitionerClaimFormProps) {
  const [firstName, setFirstName] = useState(defaultFirstName ?? "");
  const [lastName, setLastName] = useState(defaultLastName ?? "");
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [campaignId, setCampaignId] = useState(defaultCampaignId ?? "");
  const [trackingToken, setTrackingToken] = useState(defaultTrackingToken ?? "");
  const [candidates, setCandidates] = useState<ClaimCandidate[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [step, setStep] = useState<ClaimStep>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const clickRegistrationTokenRef = useRef<string | null>(null);
  const selectedCandidate = useMemo(
    () => candidates.find((candidate) => candidate.id === selectedCandidateId) ?? null,
    [candidates, selectedCandidateId]
  );

  function readCampaignContext(): StoredCampaignContext | null {
    try {
      const raw = window.localStorage.getItem(PRACTITIONER_CLAIM_CAMPAIGN_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<StoredCampaignContext>;
      const normalizedCampaignId = normalizePractitionerClaimCampaignId(parsed.campaignId ?? null);
      const tracking = typeof parsed.trackingToken === "string" ? parsed.trackingToken.trim() : "";
      if (!normalizedCampaignId && !tracking) return null;
      return {
        campaignId: normalizedCampaignId ?? "",
        trackingToken: tracking,
        clickRecordedAt: typeof parsed.clickRecordedAt === "string" ? parsed.clickRecordedAt : null
      };
    } catch {
      return null;
    }
  }

  function writeCampaignContext(value: StoredCampaignContext) {
    try {
      window.localStorage.setItem(
        PRACTITIONER_CLAIM_CAMPAIGN_STORAGE_KEY,
        JSON.stringify(value)
      );
    } catch {
      // Ignore storage failures.
    }
  }

  useEffect(() => {
    const stored = readCampaignContext();
    const requestedCampaignId = normalizePractitionerClaimCampaignId(defaultCampaignId ?? null);
    const storedMatchesRequested = requestedCampaignId
      ? stored?.campaignId === requestedCampaignId
      : Boolean(stored?.campaignId);
    const nextCampaignId = requestedCampaignId ?? stored?.campaignId ?? "";
    const nextTrackingToken = (
      defaultTrackingToken?.trim() ||
      (storedMatchesRequested ? stored?.trackingToken ?? "" : "")
    ).trim();

    setCampaignId(nextCampaignId);
    setTrackingToken(nextTrackingToken);

    if (nextCampaignId || nextTrackingToken) {
      writeCampaignContext({
        campaignId: nextCampaignId,
        trackingToken: nextTrackingToken,
        clickRecordedAt: storedMatchesRequested ? stored?.clickRecordedAt ?? null : null
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultCampaignId, defaultTrackingToken]);

  useEffect(() => {
    if (!campaignId && !trackingToken) return;

    const stored = readCampaignContext();
    const nextContext: StoredCampaignContext = {
      campaignId,
      trackingToken,
      clickRecordedAt: stored?.clickRecordedAt ?? null
    };
    writeCampaignContext(nextContext);
  }, [campaignId, trackingToken]);

  useEffect(() => {
    if (!campaignId || !trackingToken) return;

    if (clickRegistrationTokenRef.current === trackingToken) {
      return;
    }

    const stored = readCampaignContext();
    if (stored?.clickRecordedAt) {
      clickRegistrationTokenRef.current = trackingToken;
      return;
    }

    clickRegistrationTokenRef.current = trackingToken;

    let cancelled = false;

    fetch("/api/practitioner-claim/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        campaign: campaignId,
        tracking: trackingToken
      })
    })
      .then(async (response) => {
        if (!response.ok || cancelled) return;
        const now = new Date().toISOString();
        const latest = readCampaignContext() ?? {
          campaignId,
          trackingToken,
          clickRecordedAt: null
        };
        writeCampaignContext({
          ...latest,
          campaignId,
          trackingToken,
          clickRecordedAt: latest.clickRecordedAt ?? now
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [campaignId, trackingToken]);

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSearching(true);
    setSelectedCandidateId(null);

    try {
      const response = await fetch("/api/practitioner-claim/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email
        })
      });
      const payload = (await response.json().catch(() => ({}))) as {
        candidates?: ClaimCandidate[];
        error?: string;
      };

      if (!response.ok) {
        setCandidates([]);
        setStep("idle");
        setError(payload.error ?? "search_failed");
        return;
      }

      const nextCandidates = payload.candidates ?? [];
      setCandidates(nextCandidates);
      setStep(nextCandidates.length > 0 ? "results" : "empty");
    } finally {
      setIsSearching(false);
    }
  }

  async function handleClaim() {
    if (!selectedCandidate) return;

    setError(null);
    setIsClaiming(true);

    try {
      const response = await fetch("/api/practitioner-claim/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          practitioner_id: selectedCandidate.id,
          first_name: firstName,
          last_name: lastName,
          email,
          campaign: campaignId || null,
          tracking_token: trackingToken || null
        })
      });
      const payload = (await response.json().catch(() => ({}))) as {
        redirectTo?: string;
        error?: string;
      };

      if (!response.ok || !payload.redirectTo) {
        setError(payload.error ?? "claim_failed");
        return;
      }

      window.location.assign(payload.redirectTo);
    } finally {
      setIsClaiming(false);
    }
  }

  return (
    <div className="claim-flow">
      <form className="claim-search-form" onSubmit={handleSearch}>
        <div className="claim-search-grid">
          <label className="claim-field">
            <span>Prénom</span>
            <input
              name="first_name"
              type="text"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              autoComplete="given-name"
              required
            />
          </label>
          <label className="claim-field">
            <span>Nom</span>
            <input
              name="last_name"
              type="text"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              autoComplete="family-name"
              required
            />
          </label>
          <label className="claim-field claim-field--wide">
            <span>Email professionnel</span>
            <input
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>
        </div>

        <button className="btn claim-search-submit" type="submit" disabled={isSearching}>
          {isSearching ? "Recherche en cours..." : "Retrouver ma fiche"}
        </button>
      </form>

      {error ? <p className="claim-error">{getErrorLabel(error)}</p> : null}

      {step === "results" ? (
        <section className="claim-results" aria-labelledby="claim-results-title">
          <div className="section-heading section-heading--stacked">
            <div>
              <p className="section-eyebrow">Résultat</p>
              <h2 id="claim-results-title">S’agit-il de vous ?</h2>
            </div>
            <p className="section-intro">
              Sélectionnez votre fiche pour la rattacher à votre espace praticien.
            </p>
          </div>

          <div className="claim-candidate-list">
            {candidates.map((candidate) => {
              const isSelected = selectedCandidateId === candidate.id;

              return (
                <label
                  key={candidate.id}
                  className={`claim-candidate-card${isSelected ? " is-selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="candidate"
                    checked={isSelected}
                    onChange={() => setSelectedCandidateId(candidate.id)}
                  />
                  <span className="claim-candidate-content">
                    <strong>
                      {candidate.first_name} {candidate.last_name}
                    </strong>
                    <span>{candidate.address || "Adresse non renseignée"}</span>
                    {candidate.email ? <span>Email public : {candidate.email}</span> : null}
                  </span>
                </label>
              );
            })}
          </div>

          <div className="claim-actions">
            <button
              className="btn"
              type="button"
              disabled={!selectedCandidate || isClaiming}
              onClick={handleClaim}
            >
              {isClaiming ? "Revendiquer..." : "Revendiquer ma fiche"}
            </button>
            <Link className="btn btn-secondary" href="/praticiens">
              Je ne suis pas dans la liste
            </Link>
          </div>
        </section>
      ) : null}

      {step === "empty" ? (
        <section className="claim-empty">
          <h2>Aucune fiche ne correspond aux informations saisies.</h2>
          <p>
            Vérifiez votre prénom, votre nom et votre email professionnel. Si votre fiche
            n’existe pas encore, vous pouvez créer un espace praticien.
          </p>
          <Link className="btn btn-secondary" href="/praticiens">
            Créer un espace praticien
          </Link>
        </section>
      ) : null}
    </div>
  );
}
