export const PRACTITIONER_STATUS_PUBLISHED = "published";
export const PRACTITIONER_STATUS_PUBLISHED_CONTACTED = "published_contacted";
export const PRACTITIONER_STATUS_HIDDEN_PENDING_CONTACT = "hidden_pending_contact";
export const PRACTITIONER_STATUS_HIDDEN_CONTACTED = "hidden_contacted";

export const PUBLIC_PRACTITIONER_STATUSES = [
  PRACTITIONER_STATUS_PUBLISHED,
  PRACTITIONER_STATUS_PUBLISHED_CONTACTED
] as const;

export const MANAGED_PROSPECT_STATUSES = [
  PRACTITIONER_STATUS_PUBLISHED,
  PRACTITIONER_STATUS_PUBLISHED_CONTACTED,
  PRACTITIONER_STATUS_HIDDEN_PENDING_CONTACT,
  PRACTITIONER_STATUS_HIDDEN_CONTACTED
] as const;

export type ManagedProspectStatus = (typeof MANAGED_PROSPECT_STATUSES)[number];

export function isManagedProspectStatus(status: string): status is ManagedProspectStatus {
  return MANAGED_PROSPECT_STATUSES.includes(status as ManagedProspectStatus);
}

export function isPublicPractitionerStatus(status: string): boolean {
  return PUBLIC_PRACTITIONER_STATUSES.includes(
    status as (typeof PUBLIC_PRACTITIONER_STATUSES)[number]
  );
}

export function getProspectStateFromStatus(status: string) {
  switch (status) {
    case PRACTITIONER_STATUS_PUBLISHED:
      return { isVisible: true, isContacted: false, isManaged: true };
    case PRACTITIONER_STATUS_PUBLISHED_CONTACTED:
      return { isVisible: true, isContacted: true, isManaged: true };
    case PRACTITIONER_STATUS_HIDDEN_PENDING_CONTACT:
      return { isVisible: false, isContacted: false, isManaged: true };
    case PRACTITIONER_STATUS_HIDDEN_CONTACTED:
      return { isVisible: false, isContacted: true, isManaged: true };
    default:
      return { isVisible: false, isContacted: false, isManaged: false };
  }
}

export function getManagedProspectStatus(params: {
  isVisible: boolean;
  isContacted: boolean;
}): ManagedProspectStatus {
  if (params.isVisible) {
    return params.isContacted
      ? PRACTITIONER_STATUS_PUBLISHED_CONTACTED
      : PRACTITIONER_STATUS_PUBLISHED;
  }

  return params.isContacted
    ? PRACTITIONER_STATUS_HIDDEN_CONTACTED
    : PRACTITIONER_STATUS_HIDDEN_PENDING_CONTACT;
}
