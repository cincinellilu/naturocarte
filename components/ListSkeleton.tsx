export default function ListSkeleton() {
  return (
    <ul className="list-skeleton" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, idx) => (
        <li key={`skeleton-${idx}`} className="list-skeleton-item">
          <div className="list-skeleton-line list-skeleton-line--title" />
          <div className="list-skeleton-line list-skeleton-line--meta" />
        </li>
      ))}
    </ul>
  );
}

