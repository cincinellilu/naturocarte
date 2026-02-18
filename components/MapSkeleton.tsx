export default function MapSkeleton() {
  return (
    <div className="map-skeleton" aria-hidden="true">
      <div className="map-skeleton-shimmer" />
      <div className="map-skeleton-badges">
        <span className="map-skeleton-badge" />
        <span className="map-skeleton-badge map-skeleton-badge--wide" />
      </div>
      <div className="map-skeleton-footer">
        <span className="map-skeleton-pill" />
      </div>
    </div>
  );
}

