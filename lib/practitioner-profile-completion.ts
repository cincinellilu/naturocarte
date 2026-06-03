import { PRACTITIONER_PLAN_VISIBILITY } from "@/lib/practitioner-plans";

export type PractitionerCompletionInput = {
  first_name?: string | null;
  last_name?: string | null;
  adresse?: string | null;
  postal_code?: string | null;
  city?: string | null;
  lat?: number | null;
  lng?: number | null;
  phone?: string | null;
  email?: string | null;
  booking_url?: string | null;
  website?: string | null;
  photo_url?: string | null;
  description?: string | null;
  status?: string | null;
};

export type PractitionerProfileCompletion = {
  percent: number;
  isComplete: boolean;
  missingItems: string[];
  completedItems: number;
  totalItems: number;
};

type CompletionRule = {
  label: string;
  isComplete: (practitioner: PractitionerCompletionInput, contactSlot: string | null) => boolean;
};

function hasText(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}

function isPublishedStatus(status: string | null | undefined): boolean {
  return status === "published" || status === "published_contacted";
}

function hasSelectedContact(
  practitioner: PractitionerCompletionInput,
  contactSlot: string | null
): boolean {
  if (contactSlot === "email") return hasText(practitioner.email);
  if (contactSlot === "booking_url") return hasText(practitioner.booking_url);
  return hasText(practitioner.phone);
}

function hasCoordinates(practitioner: PractitionerCompletionInput): boolean {
  return (
    typeof practitioner.lat === "number" &&
    Number.isFinite(practitioner.lat) &&
    typeof practitioner.lng === "number" &&
    Number.isFinite(practitioner.lng)
  );
}

const BASE_RULES: CompletionRule[] = [
  {
    label: "Nom et prénom renseignés",
    isComplete: (practitioner) => hasText(practitioner.first_name) && hasText(practitioner.last_name)
  },
  {
    label: "Adresse complète",
    isComplete: (practitioner) =>
      hasText(practitioner.adresse) && hasText(practitioner.postal_code) && hasText(practitioner.city)
  },
  {
    label: "Contact principal renseigné",
    isComplete: hasSelectedContact
  },
  {
    label: "Position sur la carte",
    isComplete: hasCoordinates
  },
  {
    label: "Fiche publiée",
    isComplete: (practitioner) => isPublishedStatus(practitioner.status)
  }
];

const VISIBILITY_RULES: CompletionRule[] = [
  {
    label: "Photo de profil",
    isComplete: (practitioner) => hasText(practitioner.photo_url)
  },
  {
    label: "Description enrichie",
    isComplete: (practitioner) => hasText(practitioner.description)
  },
  {
    label: "Site web",
    isComplete: (practitioner) => hasText(practitioner.website)
  }
];

export function getPractitionerProfileCompletion(params: {
  practitioner: PractitionerCompletionInput | null;
  plan: string | null | undefined;
  contactSlot?: string | null;
}): PractitionerProfileCompletion {
  if (!params.practitioner) {
    return {
      percent: 0,
      isComplete: false,
      missingItems: ["Fiche praticien à créer"],
      completedItems: 0,
      totalItems: 1
    };
  }

  const rules =
    params.plan === PRACTITIONER_PLAN_VISIBILITY
      ? [...BASE_RULES, ...VISIBILITY_RULES]
      : BASE_RULES;
  const missingItems = rules
    .filter((rule) => !rule.isComplete(params.practitioner!, params.contactSlot ?? "phone"))
    .map((rule) => rule.label);
  const completedItems = rules.length - missingItems.length;
  const percent = Math.round((completedItems / rules.length) * 100);

  return {
    percent,
    isComplete: missingItems.length === 0,
    missingItems,
    completedItems,
    totalItems: rules.length
  };
}
