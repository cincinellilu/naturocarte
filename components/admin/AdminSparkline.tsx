type AdminSparklineProps = {
  items: ReadonlyArray<readonly [string, number]>;
  tone?: "teal" | "amber" | "blue";
  valueLabel?: string;
};

const VIEWBOX_WIDTH = 520;
const VIEWBOX_HEIGHT = 180;
const CHART_PADDING_X = 18;
const CHART_PADDING_Y = 18;

function buildChartGeometry(values: number[]) {
  const safeValues = values.length > 0 ? values : [0];
  const minimum = Math.min(...safeValues, 0);
  const maximum = Math.max(...safeValues, 1);
  const range = maximum - minimum || 1;
  const innerWidth = VIEWBOX_WIDTH - CHART_PADDING_X * 2;
  const innerHeight = VIEWBOX_HEIGHT - CHART_PADDING_Y * 2;

  return safeValues.map((value, index) => {
    const ratio = safeValues.length === 1 ? 0.5 : index / (safeValues.length - 1);
    const x = CHART_PADDING_X + innerWidth * ratio;
    const y =
      CHART_PADDING_Y + innerHeight - ((value - minimum) / range) * innerHeight;

    return { x, y, value };
  });
}

export default function AdminSparkline({
  items,
  tone = "teal",
  valueLabel = "valeur"
}: AdminSparklineProps) {
  if (items.length === 0) {
    return <p className="admin-empty">Aucune donnée pour afficher une courbe.</p>;
  }

  const points = buildChartGeometry(items.map(([, value]) => value));
  const polylinePoints = points.map((point) => `${point.x},${point.y}`).join(" ");
  const areaPath = [
    `M ${points[0]?.x ?? CHART_PADDING_X} ${VIEWBOX_HEIGHT - CHART_PADDING_Y}`,
    ...points.map((point) => `L ${point.x} ${point.y}`),
    `L ${points[points.length - 1]?.x ?? VIEWBOX_WIDTH - CHART_PADDING_X} ${
      VIEWBOX_HEIGHT - CHART_PADDING_Y
    }`,
    "Z"
  ].join(" ");

  return (
    <div className={`admin-sparkline admin-sparkline--${tone}`}>
      <div className="admin-sparkline-frame">
        <svg
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          role="img"
          aria-label={`Courbe ${valueLabel}`}
        >
          <path className="admin-sparkline-area" d={areaPath} />
          <polyline className="admin-sparkline-line" points={polylinePoints} />
          {points.map((point, index) => (
            <circle
              key={`${items[index]?.[0] ?? index}-${point.value}`}
              className="admin-sparkline-dot"
              cx={point.x}
              cy={point.y}
              r="4"
            />
          ))}
        </svg>
      </div>

      <div className="admin-sparkline-axis" aria-hidden="true">
        {items.map(([label, value]) => (
          <div className="admin-sparkline-tick" key={`${label}-${value}`}>
            <span>{label}</span>
            <strong>{value.toLocaleString("fr-FR")}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
