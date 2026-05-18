"use client";

import { useState } from "react";

type SubjectType = "claim" | "update" | "question" | "callback" | "subscription";

export default function PractitionerContactForm({
  claim
}: {
  claim?: string | null;
}) {
  const [subjectType, setSubjectType] = useState<SubjectType | "">(claim ? "claim" : "");

  return (
    <form action="/api/lead-practitioner" method="post" className="practitioner-form">
      {claim ? <input type="hidden" name="claim" value={claim} /> : null}

      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="practitioner-form-honeypot"
        aria-hidden="true"
      />

      <div className="practitioner-form-field">
        <label htmlFor="full_name" className="practitioner-form-label">
          Nom
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          required
          autoComplete="name"
          className="practitioner-form-input"
        />
      </div>

      <div className="practitioner-form-field">
        <label htmlFor="email" className="practitioner-form-label">
          Email professionnel
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="practitioner-form-input"
        />
      </div>

      <div className="practitioner-form-field">
        <label htmlFor="subject_type" className="practitioner-form-label">
          Sujet
        </label>
        <select
          id="subject_type"
          name="subject_type"
          className="practitioner-form-input practitioner-form-select"
          value={subjectType}
          required
          onChange={(event) => setSubjectType(event.target.value as SubjectType | "")}
        >
          <option value="" disabled hidden>
            Choisir un sujet
          </option>
          <option value="claim">Je veux revendiquer ma fiche</option>
          <option value="update">Je veux corriger / enrichir ma fiche</option>
          <option value="question">J&apos;ai une question à poser</option>
        </select>
        <p className="practitioner-form-help">
          Choisissez le type de demande pour afficher les bons champs.
        </p>
      </div>

      {(subjectType === "claim" || subjectType === "update") ? (
        <div className="practitioner-form-field">
          <label htmlFor="phone" className="practitioner-form-label">
            Téléphone professionnel (facultatif)
          </label>
          <input
            id="phone"
            name="phone"
            type="text"
            autoComplete="tel"
            className="practitioner-form-input"
          />
          <p className="practitioner-form-help">
            Utile si vous souhaitez un rappel rapide.
          </p>
        </div>
      ) : null}

      {subjectType === "question" ? (
        <div className="practitioner-form-field">
          <label htmlFor="custom_subject" className="practitioner-form-label">
            Sujet de votre question
          </label>
          <input
            id="custom_subject"
            name="custom_subject"
            type="text"
            required
            className="practitioner-form-input"
          />
        </div>
      ) : null}

      <div className="practitioner-form-field">
        <label htmlFor="message" className="practitioner-form-label">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="practitioner-form-input"
        />
      </div>

      <p className="practitioner-form-help">
        En envoyant ce formulaire, vous acceptez d’être recontacté au sujet de votre
        demande.
      </p>

      <p className="practitioner-form-actions">
        <button type="submit" className="btn">
          Envoyer
        </button>
      </p>
    </form>
  );
}
