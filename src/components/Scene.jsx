import { clamp, D2R } from '../solar.js';
import { Mover, useReducedMotion } from './Mover.jsx';

const lerp = (a, b, t) => a + (b - a) * t;
const toRgb = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
const mix = (c1, c2, t) => {
  const a = toRgb(c1);
  const b = toRgb(c2);
  return `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], t))).join(',')})`;
};

const STOPS = [
  { a: -12, t: '#060c22', b: '#14224a' },
  { a: -2, t: '#2b3366', b: '#e98a55' },
  { a: 10, t: '#4a86cc', b: '#c7dcee' },
  { a: 45, t: '#2d7cd0', b: '#a6d3f3' },
];
function skyAt(alt) {
  if (alt <= STOPS[0].a) return STOPS[0];
  for (let i = 1; i < STOPS.length; i++) {
    if (alt <= STOPS[i].a) {
      const p = STOPS[i - 1];
      const q = STOPS[i];
      const k = (alt - p.a) / (q.a - p.a);
      return { t: mix(p.t, q.t, k), b: mix(p.b, q.b, k) };
    }
  }
  return STOPS[STOPS.length - 1];
}

const CLOUDS = [
  [150, 90, 1], [390, 140, 0.9], [610, 70, 1.1], [790, 150, 0.8], [270, 205, 0.75], [520, 200, 0.85],
];
const STARS = [[60, 40], [140, 90], [230, 30], [330, 70], [420, 28], [520, 85], [610, 35], [700, 80], [790, 30], [850, 95], [180, 150], [470, 140], [740, 140]];

export default function Scene({ sun, st, tilt, cloud, load }) {
  const reduce = useReducedMotion();
  const { alt, az } = sun;
  const sx = clamp(450 + 420 * Math.sin(az * D2R), 40, 860);
  const sy = 330 - 270 * Math.sin(alt * D2R);
  const sky = skyAt(alt);
  const dayF = clamp((alt + 8) / 18, 0, 1);
  const cl = cloud / 100;
  const night = alt < -3;

  // Панель
  const px = 640;
  const py = 425;
  const dir = sx < px - 25 ? -1 : sx > px + 25 ? 1 : (sx - px) / 25;
  const rot = dir * tilt;
  const rr = rot * D2R;
  const pdx = Math.cos(rr);
  const pdy = Math.sin(rr);
  const vx = sx - px;
  const vy = sy - py;
  const vl = Math.hypot(vx, vy) || 1;
  const ux = vx / vl;
  const uy = vy / vl;
  const rays = alt > 0 ? [-72, -48, -24, 0, 24, 48, 72] : [];
  const rayOpacity = clamp(0.9 * (1 - 0.75 * cl), 0.18, 0.9);
  const backSide = alt > 0 && st.cosT <= 0;

  const dc = 'M640 478 L640 502 L500 502';
  const ac = 'M440 502 L300 502';
  const flowDur = 2.8 - 1.9 * Math.min(1, st.P / 3);
  const flowing = st.P > 0.03;
  const windowOn = night || load > 0.45;

  return (
    <svg viewBox="0 0 900 540" className="scene" role="img"
      aria-label="Күн нурунун панелге түшүшү жана электр энергиясына айланышы">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky.t} />
          <stop offset="1" stopColor={sky.b} />
        </linearGradient>
        <radialGradient id="sunGlow">
          <stop offset="0" stopColor="#fff3b0" stopOpacity="0.9" />
          <stop offset="0.35" stopColor="#ffd23f" stopOpacity="0.45" />
          <stop offset="1" stopColor="#ffd23f" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="lake" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={mix('#2f86bd', '#0d2a4a', 1 - dayF)} />
          <stop offset="1" stopColor={mix('#1d5f93', '#0a1d36', 1 - dayF)} />
        </linearGradient>
        <linearGradient id="panelFace" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#14306b" />
          <stop offset="1" stopColor="#1d4a9a" />
        </linearGradient>
      </defs>

      <rect width="900" height="540" fill="url(#sky)" />

      {STARS.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.6" fill="#fff" opacity={clamp((-alt - 3) / 8, 0, 1)} />
      ))}

      {alt > -6 && (
        <g>
          <circle cx={sx} cy={sy} r="90" fill="url(#sunGlow)" />
          <circle cx={sx} cy={sy} r="24" fill="#ffd23f" />
          <circle cx={sx} cy={sy} r="24" fill="none" stroke="#fff3b0" strokeWidth="3" opacity="0.7" />
        </g>
      )}

      {CLOUDS.slice(0, Math.round(cl * 6)).map(([x, y, s], i) => (
        <g key={i} className="cloud" style={{ animationDelay: `${-i * 3}s` }} opacity={0.9}>
          <g transform={`translate(${x} ${y}) scale(${s})`} fill={mix('#ffffff', '#8995a5', cl)}>
            <ellipse cx="0" cy="0" rx="48" ry="16" />
            <ellipse cx="-20" cy="-12" rx="24" ry="17" />
            <ellipse cx="14" cy="-16" rx="28" ry="20" />
          </g>
        </g>
      ))}

      {/* Теский Ала-Тоо тоолору */}
      <path d="M0 330 L0 292 L60 250 L110 272 L190 205 L250 256 L320 224 L400 272 L470 214 L540 264 L620 232 L700 276 L780 220 L850 258 L900 240 L900 330 Z"
        fill={mix('#7396b8', '#1a2a44', 1 - dayF)} />
      <g fill={mix('#ffffff', '#6f7fa0', 1 - dayF)} opacity="0.95">
        <polygon points="172,224 190,205 209,226 198,221 190,229 182,220" />
        <polygon points="303,243 320,224 338,245 328,240 320,247 312,239" />
        <polygon points="452,234 470,214 489,236 478,231 470,239 461,230" />
        <polygon points="762,240 780,220 799,242 788,237 780,245 771,236" />
      </g>

      {/* Ысык-Көл */}
      <rect y="330" width="900" height="38" fill="url(#lake)" />
      <text x="710" y="355" className="lakeLabel" fill="#e6f2fb" opacity={0.35 + 0.5 * dayF}>Ысык-Көл</text>
      {alt > 0 && (
        <line x1={sx} x2={sx} y1="332" y2="366" stroke="#ffe9a0" strokeWidth="6" strokeDasharray="10 7" opacity={0.5 * dayF} />
      )}

      {/* Жер */}
      <rect y="368" width="900" height="172" fill={mix('#5d8a45', '#1d2d1a', 1 - dayF)} />

      {/* Үй */}
      <g>
        <polygon points="72,402 195,326 318,402" fill="#8d3b2f" />
        <rect x="90" y="402" width="210" height="112" fill="#e9e1d1" />
        <rect x="232" y="448" width="42" height="66" fill="#7b5230" />
        <rect x="130" y="430" width="62" height="50" fill="#27425f" />
        <text x="195" y="540" textAnchor="middle" className="lbl" fill="#fff">Үй</text>
      </g>

      {/* Инвертор */}
      <g>
        <rect x="440" y="478" width="60" height="48" rx="6" fill="#e8ecf0" stroke="#5a6b7c" strokeWidth="2" />
        <text x="470" y="508" textAnchor="middle" fontSize="22" fontWeight="700" fill="#27425f">DC/AC</text>
        <text x="470" y="540" textAnchor="middle" className="lbl" fill="#fff">Инвертор</text>
      </g>

      {/* Зымдар */}
      <path d={dc} fill="none" stroke="#f4a300" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d={ac} fill="none" stroke="#9ad1ff" strokeWidth="4" strokeLinecap="round" />
      <text x="570" y="526" textAnchor="middle" className="lbl" fill="#ffd27a">туруктуу ток (DC)</text>
      <text x="368" y="526" textAnchor="middle" className="lbl" fill="#cfe8ff">өзгөрмө ток (AC)</text>

      {/* Панелдин таянычы жана өзү */}
      <line x1={px} y1={py} x2={px} y2="478" stroke="#6b7785" strokeWidth="6" />
      <g transform={`translate(${px} ${py}) rotate(${rot})`}>
        <rect x="-88" y="-7" width="176" height="14" rx="2" fill="url(#panelFace)" stroke="#cfd8e3" strokeWidth="2" />
        {[-58, -29, 0, 29, 58].map((x) => (
          <line key={x} x1={x} x2={x} y1="-7" y2="7" stroke="#8fb0e6" strokeWidth="1" opacity="0.6" />
        ))}
        <rect x="-88" y="-7" width="176" height="14" rx="2" fill="#ffc933" opacity={clamp(st.G / 1100, 0, 1) * 0.55} />
      </g>
      <text x={px + 70} y="500" textAnchor="start" className="lbl" fill="#fff">Күн панели</text>

      {/* Нурлар жана фотондор */}
      {rays.map((t, i) => {
        const hx = px + t * pdx;
        const hy = py + t * pdy - 8 * Math.cos(rr);
        const nx = hx + ux * 250;
        const ny = hy + uy * 250;
        return (
          <g key={t}>
            <line x1={nx} y1={ny} x2={hx} y2={hy}
              stroke={backSide ? '#ff8a7a' : '#ffd23f'} strokeWidth="2.2" opacity={rayOpacity}
              strokeDasharray={backSide ? '6 6' : undefined} />
            <Mover path={`M${nx.toFixed(1)} ${ny.toFixed(1)} L${hx.toFixed(1)} ${hy.toFixed(1)}`}
              dur={1.5} begin={-(i * 0.21)} r={4.5} fill="#fff3b0" stroke="#f4a300" reduce={reduce} />
          </g>
        );
      })}

      {/* Электрондор */}
      {flowing && [0, 1, 2, 3, 4, 5].map((i) => (
        <Mover key={`dc${i}`} path={dc} dur={flowDur} begin={-(i * flowDur) / 6} r={4} fill="#7dd3fc" stroke="#0b5d8a" reduce={reduce} />
      ))}
      {flowing && [0, 1, 2, 3, 4].map((i) => (
        <Mover key={`ac${i}`} path={ac} dur={flowDur} begin={-(i * flowDur) / 5} r={3.5} fill="#ffffff" reduce={reduce} />
      ))}

      {/* Түнкү көлөкө */}
      <rect width="900" height="540" fill="#020617" opacity={0.5 * (1 - dayF)} pointerEvents="none" />

      {/* Терезедеги жарык (түндө ачык көрүнөт) */}
      <rect x="130" y="430" width="62" height="50" fill="#ffd36b" opacity={windowOn ? 0.95 : 0.3} />
      <line x1="161" x2="161" y1="430" y2="480" stroke="#27425f" strokeWidth="2" />
      <line x1="130" x2="192" y1="455" y2="455" stroke="#27425f" strokeWidth="2" />

      {backSide && (
        <text x="450" y="28" textAnchor="middle" className="warn">Нур панелдин арткы бетине түшүп жатат</text>
      )}
      {alt <= 0 && (
        <text x="450" y="28" textAnchor="middle" className="warn">Түн — күн жок</text>
      )}
    </svg>
  );
}
