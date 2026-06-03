import Link from "next/link";

export const PARTNER_DIRECTORY_HREF = "/annuaire-naturopathes?audience=partenaires";

export default function PartnerBadge({
  className = "",
  href
}: {
  className?: string;
  href?: string;
}) {
  const badgeClassName = ["partner-badge", className].filter(Boolean).join(" ");

  if (href) {
    return (
      <Link className={badgeClassName} href={href} prefetch={false}>
        Partenaire NaturoCarte
      </Link>
    );
  }

  return (
    <span className={badgeClassName}>
      Partenaire NaturoCarte
    </span>
  );
}
