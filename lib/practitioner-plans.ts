export const PRACTITIONER_PLAN_PRESENCE = "presence";
export const PRACTITIONER_PLAN_VISIBILITY = "visibilite_plus";

export const PRACTITIONER_PLANS = [
  {
    id: PRACTITIONER_PLAN_PRESENCE,
    name: "Présence",
    price: "Gratuit",
    summary: "Créer et tenir à jour une fiche simple sur NaturoCarte.",
    features: [
      "Fiche publique dans l’annuaire",
      "Un seul contact actif au choix",
      "Modification libre de ce contact",
      "Accès au dashboard praticien"
    ]
  },
  {
    id: PRACTITIONER_PLAN_VISIBILITY,
    name: "Visibilité+",
    price: "5 €/mois",
    summary: "Devenir partenaire NaturoCarte et débloquer les signaux qui aident à suivre et améliorer la fiche.",
    features: [
      "Badge Partenaire NaturoCarte",
      "Tous les contacts actifs",
      "Photo de profil",
      "Description enrichie",
      "Statistiques de consultation",
      "Avis, notes et commentaires visibles"
    ]
  }
] as const;

export type PractitionerPlanId = (typeof PRACTITIONER_PLANS)[number]["id"];

export function isPractitionerPlanId(value: string): value is PractitionerPlanId {
  return value === PRACTITIONER_PLAN_PRESENCE || value === PRACTITIONER_PLAN_VISIBILITY;
}

export function getPractitionerPlan(planId: string | null | undefined) {
  return (
    PRACTITIONER_PLANS.find((plan) => plan.id === planId) ?? PRACTITIONER_PLANS[0]
  );
}
