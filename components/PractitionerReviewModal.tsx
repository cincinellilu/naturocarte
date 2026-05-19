"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

type ReviewPayload = {
  practitionerSlug: string;
  practitionerName: string;
  email: string;
  rating: number;
  message: string | null;
};

const ratingOptions = [0, 1, 2, 3, 4, 5];

function starLabel(value: number): string {
  if (value === 0) return "0";
  return "★".repeat(value);
}

export default function PractitionerReviewModal({
  practitionerSlug,
  practitionerName
}: {
  practitionerSlug: string;
  practitionerName: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => email.trim().length > 0 && !isSubmitting, [email, isSubmitting]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSubmitted(false);
      setError(null);
      return;
    }

    setSubmitted(false);
    setError(null);
  }, [isOpen]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    const payload: ReviewPayload = {
      practitionerSlug,
      practitionerName,
      email: email.trim(),
      rating,
      message: message.trim() ? message.trim() : null
    };

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/practitioner-reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error || "server_error");
      }

      setSubmitted(true);
      setEmail("");
      setRating(0);
      setMessage("");
    } catch (submitError) {
      const value = submitError instanceof Error ? submitError.message : "server_error";
      setError(value === "invalid_email" ? "Merci de renseigner un email valide." : "Une erreur est survenue pendant l’envoi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-secondary practitioner-static-cta practitioner-review-trigger"
        onClick={() => setIsOpen(true)}
      >
        Laisser un avis
      </button>

      {isOpen ? (
        <div
          className="practitioner-review-backdrop"
          role="presentation"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="practitioner-review-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="practitioner-review-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="practitioner-review-close"
              aria-label="Fermer"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>

            <div className="practitioner-review-header">
              <p className="practitioner-review-eyebrow">Laisser un avis</p>
              <h3 id="practitioner-review-title">
                {practitionerName}
              </h3>
              <p className="practitioner-review-intro">
                Donnez une note de 0 à 5 étoiles, ajoutez un commentaire si vous le
                souhaitez et laissez-nous votre email pour que nous puissions vous
                recontacter si besoin.
              </p>
            </div>

            {submitted ? (
              <p className="practitioner-review-feedback practitioner-review-feedback--success">
                Merci, votre avis a bien été envoyé.
              </p>
            ) : null}

            {error ? <p className="practitioner-review-feedback practitioner-review-feedback--error">{error}</p> : null}

            <form className="practitioner-review-form" onSubmit={handleSubmit}>
              <div className="practitioner-review-field">
                <label htmlFor="practitioner-review-email" className="practitioner-review-label">
                  Email
                </label>
                <input
                  id="practitioner-review-email"
                  type="email"
                  autoComplete="email"
                  required
                  className="practitioner-review-input"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>

              <div className="practitioner-review-field">
                <label className="practitioner-review-label">Nombre d’étoiles</label>
                <div className="practitioner-review-rating" role="radiogroup" aria-label="Nombre d’étoiles">
                  {ratingOptions.map((value) => (
                    <label
                      key={value}
                      className={`practitioner-review-rating-option${rating === value ? " is-selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="rating"
                        value={value}
                        checked={rating === value}
                        onChange={() => setRating(value)}
                      />
                      <span>{starLabel(value)}</span>
                    </label>
                  ))}
                </div>
                <p className="practitioner-review-help">
                  0 étoile est autorisé. Vous pouvez laisser un commentaire sans note.
                </p>
              </div>

              <div className="practitioner-review-field">
                <label htmlFor="practitioner-review-message" className="practitioner-review-label">
                  Message
                </label>
                <textarea
                  id="practitioner-review-message"
                  className="practitioner-review-input practitioner-review-textarea"
                  rows={5}
                  placeholder="Votre commentaire (facultatif)"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                />
              </div>

              <input type="hidden" name="practitioner_slug" value={practitionerSlug} readOnly />

              <div className="practitioner-review-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsOpen(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn practitioner-review-submit" disabled={!canSubmit}>
                  Envoyer l’avis
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
