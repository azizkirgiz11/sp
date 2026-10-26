import { useMemo } from 'react';
import { MONTHS, MONTHS_FULL, MID_DOY, DAYS_IN_MONTH, bestTilt, dayProfile, nf } from '../solar.js';

const SEASON_COLOR = ['#3b7bb0', '#3b7bb0', '#5aa05a', '#5aa05a', '#5aa05a', '#f4a300', '#f4a300', '#f4a300', '#c9702b', '#c9702b', '#c9702b', '#3b7bb0'];

export default function Seasons({ tilt, cloud }) {
  const data = useMemo(
    () => MID_DOY.map((d, i) => {
      const daily = dayProfile(d, tilt, cloud / 100).total;
      return { daily, monthly: daily * DAYS_IN_MONTH[i] };
    }),
    [tilt, cloud],
  );
  const bestYear = useMemo(() => bestTilt(MID_DOY, cloud / 100), [cloud]);
  const bestMonthly = useMemo(() => MID_DOY.map((d) => bestTilt([d], cloud / 100)), [cloud]);
  const annual = data.reduce((s, d) => s + d.monthly, 0);
  const maxM = Math.max(...data.map((d) => d.monthly), 300) * 1.1;

  const W = 760;
  const H = 280;
  const pad = { l: 50, r: 12, t: 16, b: 34 };
  const bw = (W - pad.l - pad.r) / 12;
  const Y = (v) => pad.t + (H - pad.t - pad.b) * (1 - v / maxM);

  return (
    <div className="seasonGrid">
      <section className="card facts">
        <h2>Ысык-Көл облусунун күн климаты</h2>
        <dl className="mini wide">
          <div><dt>Ачык же күнөстүү күн</dt><dd>жылына 250–280</dd></div>
          <div><dt>Күн радиациясы</dt><dd>1500–1700 кВт·саат/м²</dd></div>
          <div><dt>Максимум</dt><dd>жаз жана жай айлары</dd></div>
        </dl>
        <p>
          Кышында күн кыска болсо да, тоолуу аймактын тунук абасы нурду түз өткөрөт. Ошондуктан Ысык-Көл
          күн энергиясы үчүн Кыргызстандагы эң ыңгайлуу аймактардын бири.
        </p>
      </section>

      <section className="card chartCard">
        <h2>Ай сайын 3 кВттык станциянын өндүрүшү</h2>
        <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Ай боюнча энергия өндүрүшү">
          {[0, 0.25, 0.5, 0.75, 1].map((f) => (
            <g key={f}>
              <line x1={pad.l} x2={W - pad.r} y1={Y(maxM * f)} y2={Y(maxM * f)} className="grid" />
              <text x={pad.l - 8} y={Y(maxM * f) + 4} textAnchor="end" className="tick">{nf(maxM * f)}</text>
            </g>
          ))}
          {data.map((d, i) => (
            <g key={MONTHS[i]}>
              <rect x={pad.l + i * bw + 6} y={Y(d.monthly)} width={bw - 12} height={Y(0) - Y(d.monthly)} rx="3" fill={SEASON_COLOR[i]} />
              <text x={pad.l + i * bw + bw / 2} y={Y(d.monthly) - 5} textAnchor="middle" className="tick">{nf(d.monthly)}</text>
              <text x={pad.l + i * bw + bw / 2} y={H - 12} textAnchor="middle" className="tick">{MONTHS[i]}</text>
            </g>
          ))}
          <line x1={pad.l} x2={W - pad.r} y1={Y(300)} y2={Y(300)} stroke="#d9342b" strokeWidth="2" strokeDasharray="6 4" />
          <text x={W - pad.r} y={Y(300) - 6} textAnchor="end" className="tick" fill="#d9342b">үйдүн керектөөсү: 300</text>
          <text x="12" y={H / 2} transform={`rotate(-90 12 ${H / 2})`} textAnchor="middle" className="axis">кВт·саат / ай</text>
        </svg>
        <p className="note">
          Жыл бою болжол менен <b>{nf(annual)} кВт·саат</b> (панелдин жантайышы {tilt}°, булуттуулук {cloud}%).
          Жантайыш менен булуттуулукту «Симуляция» барагында өзгөртсөң, график да өзгөрөт.
          Модель орточо ай күнү боюнча эсептелген окуу болжолу.
        </p>
      </section>

      <section className="card tableCard">
        <h2>Эң жакшы жантайыш бурчу</h2>
        <p>Бүтүн жыл үчүн оптималдуу бурч: <b>{bestYear}°</b>. Ай сайын болсо ал өзгөрөт — жайында жалпак, кышында тик жакшы:</p>
        <div className="tiltRow">
          {bestMonthly.map((b, i) => (
            <div key={MONTHS_FULL[i]}><span>{MONTHS[i]}</span><b>{b}°</b></div>
          ))}
        </div>
      </section>
    </div>
  );
}
