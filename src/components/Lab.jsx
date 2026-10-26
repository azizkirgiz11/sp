import { useState } from 'react';
import LineChart from './LineChart.jsx';
import { D2R, nf } from '../solar.js';

const ISC = 120; // мА, окуу модели
function measure(beta, elev) {
  const theta = Math.abs(90 - elev - beta);
  const cosT = Math.cos(theta * D2R);
  const I = cosT > 0 ? ISC * cosT : 0;
  const V = cosT > 0 ? Math.max(0, 4.5 + 0.35 * Math.log(Math.max(cosT, 0.01))) : 0;
  return { theta, cosT, I, V, P: V * I };
}

export default function Lab() {
  const [beta, setBeta] = useState(0);
  const [elev, setElev] = useState(47.5);
  const [rows, setRows] = useState([]);

  const m = measure(beta, elev);
  const opt = Math.round(90 - elev);

  const pivot = { x: 370, y: 300 };
  const R = 250;
  const lx = pivot.x - R * Math.cos(elev * D2R);
  const ly = pivot.y - R * Math.sin(elev * D2R);
  const bb = beta * D2R;
  const eL = { x: pivot.x - 70 * Math.cos(bb), y: pivot.y + 70 * Math.sin(bb) };
  const eR = { x: pivot.x + 70 * Math.cos(bb), y: pivot.y - 70 * Math.sin(bb) };
  const nx = pivot.x - 95 * Math.sin(bb);
  const ny = pivot.y - 95 * Math.cos(bb);

  const addRow = (b = beta) => {
    const r = measure(b, elev);
    setRows((prev) => [...prev.filter((x) => x.beta !== b), { beta: b, V: r.V, I: r.I, P: r.P }].sort((a, c) => a.beta - c.beta));
  };
  const autoFill = () => {
    const list = [0, opt, 90];
    setRows(list.map((b) => { const r = measure(b, elev); return { beta: b, V: r.V, I: r.I, P: r.P }; }));
  };

  const curve = Array.from({ length: 91 }, (_, b) => [b, measure(b, elev).P]);
  const bestRow = rows.length ? rows.reduce((a, c) => (c.P > a.P ? c : a)) : null;

  return (
    <div className="labGrid">
      <section className="sceneCard">
        <svg viewBox="0 0 760 360" className="scene lab" role="img" aria-label="Виртуалдык STEM макети">
          <rect width="760" height="360" fill="#e9eef3" />
          <rect y="318" width="760" height="42" fill="#b99a6b" />
          {/* жарык */}
          <polygon points={`${lx},${ly} ${eL.x},${eL.y} ${eR.x},${eR.y}`} fill="#ffe27a" opacity="0.35" />
          <circle cx={lx} cy={ly} r="16" fill="#ffd23f" stroke="#c98f00" strokeWidth="3" />
          <text x={lx} y={ly - 24} textAnchor="middle" className="lbl" fill="#5a4400">Жарык булагы</text>
          {/* транспортир */}
          <path d={`M${pivot.x - 70} ${pivot.y} A70 70 0 0 1 ${pivot.x + 70} ${pivot.y}`} fill="rgba(120,160,200,0.12)" stroke="#6d8aa6" strokeWidth="1.5" />
          <line x1={pivot.x} y1={pivot.y} x2={nx} y2={ny} stroke="#6d8aa6" strokeDasharray="5 4" />
          <text x={pivot.x + 6} y={pivot.y - 78} className="lbl" fill="#3b5877">нормаль</text>
          {/* таяныч */}
          <polygon points={`${pivot.x - 30},318 ${pivot.x + 30},318 ${pivot.x},${pivot.y + 4}`} fill="#a98655" />
          {/* элемент */}
          <g transform={`translate(${pivot.x} ${pivot.y}) rotate(${-beta})`}>
            <rect x="-70" y="-9" width="140" height="9" rx="2" fill="#17408a" stroke="#0a2154" strokeWidth="2" />
            {[-46, -23, 0, 23, 46].map((x) => <line key={x} x1={x} x2={x} y1="-9" y2="0" stroke="#7fa6e8" strokeWidth="1" />)}
          </g>
          <text x={pivot.x} y={pivot.y + 40} textAnchor="middle" className="lbl" fill="#3b5877">β = {beta}°</text>
          {/* зымдар */}
          <path d={`M${eR.x} ${eR.y} C 470 ${eR.y} 500 220 560 220`} fill="none" stroke="#c62828" strokeWidth="3" />
          <path d={`M${eL.x} ${eL.y} C 470 330 520 250 560 250`} fill="none" stroke="#222" strokeWidth="3" />
          {/* мультиметр */}
          <rect x="556" y="90" width="180" height="200" rx="14" fill="#f2b705" stroke="#8a6a00" strokeWidth="3" />
          <rect x="574" y="108" width="144" height="56" rx="6" fill="#cfe3c6" stroke="#4d6b45" strokeWidth="2" />
          <text x="710" y="150" textAnchor="end" fontFamily="ui-monospace, Consolas, monospace" fontSize="34" fill="#18311a">{nf(m.V, 2)}</text>
          <text x="582" y="128" fontSize="12" fill="#2d4a2b">В (чыңалуу)</text>
          <circle cx="646" cy="218" r="30" fill="#2b2b2b" stroke="#111" strokeWidth="3" />
          <line x1="646" y1="218" x2="662" y2="200" stroke="#f2b705" strokeWidth="4" />
          <text x="646" y="268" textAnchor="middle" fontSize="12" fill="#3a2d00">Мультиметр</text>
          <text x="646" y="282" textAnchor="middle" fontSize="11" fill="#3a2d00">V DC режими</text>
        </svg>
        <p className="note">Кичинекей фотоэлектрдик элементти картон таянычка коюп, транспортир менен бурчту өлчөп, мультиметр менен чыңалууну каттайбыз — ушуну виртуалдуу түрдө кайталайбыз.</p>
      </section>

      <section className="card controls">
        <h2>Эксперимент</h2>
        <div className="field">
          <label htmlFor="beta">Элементтин бурчу β: <b>{beta}°</b></label>
          <input id="beta" type="range" min="0" max="90" step="1" value={beta} onChange={(e) => setBeta(Number(e.target.value))} />
          <div className="months">
            <button type="button" className="chip" onClick={() => setBeta(0)}>0° горизонталь</button>
            <button type="button" className="chip" onClick={() => setBeta(opt)}>{opt}° кеңдик</button>
            <button type="button" className="chip" onClick={() => setBeta(90)}>90° тик</button>
          </div>
        </div>
        <div className="field">
          <label htmlFor="elev">Жарыктын бийиктиги: <b>{nf(elev, 1)}°</b></label>
          <input id="elev" type="range" min="10" max="80" step="0.5" value={elev} onChange={(e) => { setElev(Number(e.target.value)); setRows([]); }} />
          <small>47,5° — Ысык-Көлдөгү тең күн түн теңелген күндөгү чак түштөгү күндүн бийиктиги.</small>
        </div>
        <dl className="mini">
          <div><dt>Түшүү бурчу θ</dt><dd>{nf(m.theta, 1)}°</dd></div>
          <div><dt>cos θ</dt><dd>{nf(m.cosT, 2)}</dd></div>
          <div><dt>Чыңалуу</dt><dd>{nf(m.V, 2)} В</dd></div>
          <div><dt>Ток</dt><dd>{nf(m.I, 0)} мА</dd></div>
          <div><dt>Кубаттуулук</dt><dd>{nf(m.P, 0)} мВт</dd></div>
        </dl>
        <div className="rowBtns">
          <button type="button" className="btn primary" onClick={() => addRow()}>Өлчөөнү жазуу</button>
          <button type="button" className="btn" onClick={autoFill}>0°, {opt}°, 90° толтуруу</button>
          <button type="button" className="btn" onClick={() => setRows([])}>Тазалоо</button>
        </div>
      </section>

      <section className="card tableCard">
        <h2>Өлчөөлөр таблицасы</h2>
        {rows.length === 0 ? (
          <p className="empty">Таблица бош. Бурчту тандап, «Өлчөөнү жазуу» баскычын бас.</p>
        ) : (
          <table>
            <thead><tr><th>Бурч β</th><th>Чыңалуу, В</th><th>Ток, мА</th><th>Кубаттуулук, мВт</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.beta} className={bestRow && r.beta === bestRow.beta ? 'best' : ''}>
                  <td>{r.beta}°</td><td>{nf(r.V, 2)}</td><td>{nf(r.I, 0)}</td><td>{nf(r.P, 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {bestRow && rows.length > 1 && (
          <p className="concl">
            Жыйынтык: эң көп энергия {bestRow.beta}° бурчта алынды. Нур панелдин бетине перпендикуляр түшкөндө
            (оптималдуу бурч ≈ {opt}°) энергия максимумга жетет.
          </p>
        )}
      </section>

      <section className="card chartCard">
        <h2>Бурч жана кубаттуулук</h2>
        <LineChart
          w={760} h={230} xMin={0} xMax={90} xTicks={[0, 15, 30, 45, 60, 75, 90]} fmtX={(v) => `${v}°`}
          fmtY={(v) => nf(v, 0)} yLabel="мВт" xLabel="Элементтин бурчу β" marker={beta}
          label="Бурчка жараша кубаттуулук"
          series={[
            { pts: curve, color: '#1f6f9f', area: true },
            { dots: rows.map((r) => [r.beta, r.P]), color: '#d9342b' },
          ]}
        />
        <div className="legend">
          <span><i style={{ background: '#1f6f9f' }} />Теориялык ийри</span>
          <span><i style={{ background: '#d9342b' }} />Сенин өлчөөлөрүң</span>
        </div>
      </section>
    </div>
  );
}
