export default function LineChart({
  w = 640, h = 220, series = [], xMin = 0, xMax = 24, yMin = 0, yMax,
  marker, xTicks, yTicks = 4, fmtX = (v) => v, fmtY = (v) => v.toFixed(1),
  xLabel, yLabel, label = 'график',
}) {
  const pad = { l: 52, r: 14, t: 14, b: 34 };
  const iw = w - pad.l - pad.r;
  const ih = h - pad.t - pad.b;
  const allY = series.flatMap((s) => (s.pts || []).map((p) => p[1]));
  const top = yMax ?? Math.max(1e-6, ...allY) * 1.1;
  const X = (v) => pad.l + ((v - xMin) / (xMax - xMin)) * iw;
  const Y = (v) => pad.t + ih - ((v - yMin) / (top - yMin)) * ih;
  const ticksX = xTicks || [xMin, (xMin + xMax) / 2, xMax];
  const ticksY = Array.from({ length: yTicks + 1 }, (_, i) => yMin + ((top - yMin) * i) / yTicks);
  const path = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${X(p[0]).toFixed(1)} ${Y(p[1]).toFixed(1)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="chart" role="img" aria-label={label}>
      {ticksY.map((v, i) => (
        <g key={i}>
          <line x1={pad.l} x2={w - pad.r} y1={Y(v)} y2={Y(v)} className="grid" />
          <text x={pad.l - 8} y={Y(v) + 4} textAnchor="end" className="tick">{fmtY(v)}</text>
        </g>
      ))}
      {yMin < 0 && top > 0 && <line x1={pad.l} x2={w - pad.r} y1={Y(0)} y2={Y(0)} className="zero" />}
      {ticksX.map((v, i) => (
        <text key={i} x={X(v)} y={h - pad.b + 18} textAnchor="middle" className="tick">{fmtX(v)}</text>
      ))}
      {series.map((s, i) => (
        <g key={i}>
          {s.pts && s.area && (
            <path
              d={`${path(s.pts)} L${X(s.pts[s.pts.length - 1][0])} ${Y(Math.max(yMin, 0))} L${X(s.pts[0][0])} ${Y(Math.max(yMin, 0))} Z`}
              fill={s.color}
              opacity="0.22"
            />
          )}
          {s.pts && (
            <path d={path(s.pts)} fill="none" stroke={s.color} strokeWidth={s.width || 2.2}
              strokeDasharray={s.dash} strokeLinejoin="round" />
          )}
          {s.dots && s.dots.map((p, j) => (
            <circle key={j} cx={X(p[0])} cy={Y(p[1])} r={s.r || 4.5} fill={s.color} stroke="#fff" strokeWidth="1.5" />
          ))}
        </g>
      ))}
      {marker != null && (
        <line x1={X(marker)} x2={X(marker)} y1={pad.t} y2={pad.t + ih} className="marker" />
      )}
      {xLabel && <text x={pad.l + iw / 2} y={h - 3} textAnchor="middle" className="axis">{xLabel}</text>}
      {yLabel && <text x={12} y={pad.t + ih / 2} transform={`rotate(-90 12 ${pad.t + ih / 2})`} textAnchor="middle" className="axis">{yLabel}</text>}
    </svg>
  );
}
