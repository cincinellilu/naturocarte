export type DepartmentInfo = {
  code: string;
  name: string;
};

export const IDF_DEPARTMENTS: DepartmentInfo[] = [
  { code: "75", name: "Paris" },
  { code: "77", name: "Seine-et-Marne" },
  { code: "78", name: "Yvelines" },
  { code: "91", name: "Essonne" },
  { code: "92", name: "Hauts-de-Seine" },
  { code: "93", name: "Seine-Saint-Denis" },
  { code: "94", name: "Val-de-Marne" },
  { code: "95", name: "Val-d'Oise" }
];

const departmentsByCode = new Map(
  IDF_DEPARTMENTS.map((department) => [department.code, department])
);

export function getDepartmentCodeFromPostalCode(
  postalCode: string | null | undefined
): string | null {
  const raw = (postalCode ?? "").trim();
  const match = raw.match(/^(\d{2})\d{3}$/);

  if (!match) return null;
  return departmentsByCode.has(match[1]) ? match[1] : null;
}

export function getDepartmentByCode(code: string | null | undefined): DepartmentInfo | null {
  const raw = (code ?? "").trim();
  if (!raw) return null;
  return departmentsByCode.get(raw) ?? null;
}

export function getDepartmentFromPostalCode(
  postalCode: string | null | undefined
): DepartmentInfo | null {
  const code = getDepartmentCodeFromPostalCode(postalCode);
  return code ? getDepartmentByCode(code) : null;
}
