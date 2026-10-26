import { useState } from 'react';
import LineChart from './LineChart.jsx';
import { EF, nf } from '../solar.js';

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

export default function Economics() {
  const [kwh, setKwh] = useState(300);
  const [cost, setCost] = useState(180000);
  const [cover, setCover] = useState(75);
  const [tariff, setTariff] = useState(6.67);
  const [life, setLife] = useState(25);

  const annualUse = kwh * 12;
  const savedKwh = (annualUse * cover) / 100;
  const saving = savedKwh * tariff;
  const payback = saving > 0 ? cost / saving : Infinity;
  const co2 = savedKwh * EF;
  const trees = co2 / 21;
  const net = saving * life - cost;
  const years = Array.from({ length: life + 1 }, (_, t) => [t, -cost + saving * t]);
  const top = Math.max(cost * 0.2, saving * life - cost) * 1.1;

  const reset = () => { setKwh(300); setCost(180000); setCover(75); setTariff(6.67); setLife(25); };

  return (
    <div className="ecoGrid">
      <section className="card controls">
        <h2>Эсептөө</h2>
        <div className="field">
          <label htmlFor="kwh">Айлык керектөө (кВт·саат)</label>
          <input id="kwh" type="number" min="0" value={kwh} onChange={(e) => setKwh(num(e.target.value))} />
        </div>
        <div className="field">
          <label htmlFor="cost">Системанын баасы (сом) — панель, инвертор, монтаж</label>
          <input id="cost" type="number" min="0" step="1000" value={cost} onChange={(e) => setCost(num(e.target.value))} />
        </div>
        <div className="field">
          <label htmlFor="cover">Панель чыгымдын канчасын жабат: <b>{cover}%</b></label>
          <input id="cover" type="range" min="10" max="100" value={cover} onChange={(e) => setCover(num(e.target.value))} />
        </div>
        <div className="field">
          <label htmlFor="tariff">Электр тарифи (сом / кВт·саат)</label>
          <input id="tariff" type="number" min="0" step="0.01" value={tariff} onChange={(e) => setTariff(num(e.target.value))} />
          <small>Демейки мааниси документтеги мисалга (жылына ≈ 18 000 сом үнөмдөө) ылайыкталган. Чыныгы тарифти өзүң киргиз.</small>
        </div>
        <div className="field">
          <label htmlFor="life">Панелдин иштөө мөөнөтү: <b>{life} жыл</b></label>
          <input id="life" type="range" min="10" max="30" value={life} onChange={(e) => setLife(num(e.target.value))} />
        </div>
        <button type="button" className="btn" onClick={reset}>Документтеги мисал</button>
      </section>

      <section className="card result">
        <h2>Жыйынтык</h2>
        <p className="formula">
          Өзүн актоо мөөнөтү = Системанын баасы ÷ Жылдык үнөмдөлгөн каражат
        </p>
        <p className="formula big">
          {nf(cost)} ÷ {nf(saving)} ≈ <b>{Number.isFinite(payback) ? `${nf(payback, 1)} жыл` : '—'}</b>
        </p>
        <dl className="mini wide">
          <div><dt>Жылына үнөмдөлгөн электр</dt><dd>{nf(savedKwh)} кВт·саат</dd></div>
          <div><dt>Жылына үнөмдөлгөн акча</dt><dd>{nf(saving)} сом</dd></div>
          <div><dt>{life} жылдагы таза пайда</dt><dd className={net >= 0 ? 'pos' : 'neg'}>{nf(net)} сом</dd></div>
          <div><dt>CO₂ азаят (жылына)</dt><dd>{nf(co2)} кг</dd></div>
          <div><dt>Бул болжол менен</dt><dd>{nf(trees)} дарак</dd></div>
        </dl>
        <small>CO₂ эсеби: {EF} кг/кВт·саат (болжолдуу окуу маани); бир дарак жылына ≈ 21 кг CO₂ сиңирет деп алынды. Чыныгы көрсөткүчтөр тармактын түрүнө жараша өзгөрөт.</small>
      </section>

      <section className="card chartCard">
        <h2>Каражаттын жыйынды балансы</h2>
        <LineChart
          w={760} h={260} xMin={0} xMax={life} xTicks={[0, Math.round(life / 4), Math.round(life / 2), Math.round((life * 3) / 4), life]}
          yMin={-cost} yMax={top} fmtX={(v) => `${v} ж.`} fmtY={(v) => `${nf(v / 1000)}к`} yLabel="сом"
          label="Өзүн актоо графиги"
          series={[
            { pts: years, color: '#1f6f9f', width: 2.6 },
            ...(Number.isFinite(payback) && payback <= life ? [{ dots: [[payback, 0]], color: '#d9342b', r: 6 }] : []),
          ]}
        />
        <p className="note">Ийри нөлдү кесип өткөн жерде (кызыл чекит) система өзүн актайт. Андан кийин панель таза үнөмдөө берет.</p>
      </section>
    </div>
  );
}
