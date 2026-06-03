export default function PartnerBadge({ className = "" }: { className?: string }) {
  return (
    <span className={["partner-badge", className].filter(Boolean).join(" ")}>
      Partenaire NaturoCarte
    </span>
  );
}
