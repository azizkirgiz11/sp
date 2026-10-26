import { useEffect, useMemo, useState } from 'react';
import Scene from './Scene.jsx';
import LineChart from './LineChart.jsx';
import {
  MONTHS, MONTHS_FULL, MID_DOY, EF, sunPos, panelState, dayProfile, dayLength, loadAt, fmtTime, nf,
} from '../solar.js';

const MONTHLY_USE = 300; // документтеги мисал: айына 300 кВт·саат

function explain(st, cloud) {
  if (st.alt <= 0) return 'Түн: күн горизонттун астында. Панель энергия бербейт, үй электр энергиясын тармактан алат.';
  if (st.cosT <= 0) return 'Нур панелдин арткы бетине түшүп жатат — фотондор жутулбайт. Панелди башка бурчка буруп көр.';
  if (cloud > 70) return 'Булут жарыкты чачыратып жатат: түз нур азайды, ошондуктан кубаттуулук төмөн.';
  if (st.alt < 10) return 'Күн горизонтко жакын: нур атмосферанын калың катмары аркылуу өтүп, начарлайт. Кубаттуулук аз.';
  if (st.theta < 12) return `Нур панелге дээрлик перпендикуляр түшүп жатат (θ = ${nf(st.theta)}°). Фотондор көп жутулат — кубаттуулук максимумга жакын.`;
  if (st.theta < 45) return `Нур панелге бир аз жантайып түшүп жатат (θ = ${nf(st.theta)}°). Түшкөн энергия cos θ эсеп менен азаят — панелдин бурчун күнгө жакындатсаң көбөйөт.`;
  return `Нур панелге катуу жантайып түшүп жатат (θ = ${nf(st.theta)}°), панелдин бети нурду аз кармайт. Бурчту өзгөртүп көр.`;
}

export default function Simulation({ month, setMonth, hour, setHour, tilt, setTilt, cloud, setCloud }) {
  const [playing, setPlaying] = useState(false);
  const doy = MID_DOY[month];

  useEffect(() => {
    if (!playing) return undefined;
    const id = setInterval(() => setHour((h) => (h + 0.04 >= 24 ? 0 : h + 0.04)), 40);
    return () => clearInterval(id);
  }, [playing, setHour]);

  const sun = sunPos(doy, hour);
  const st = panelState(doy, hour, tilt, cloud / 100);
  const profile = useMemo(() => dayProfile(doy, tilt, cloud / 100), [doy, tilt, cloud]);
  const dl = dayLength(doy);
  const load = loadAt(hour, MONTHLY_USE);
  const net = st.P - load;
  const eSoFar = profile.points.reduce((s, p) => (p.h <= hour ? s + p.P * 0.25 : s), 0);
  const volts = st.G > 5 ? 190 + 60 * Math.min(1, st.G / 800) : 0;
  const amps = volts > 0 ? (st.P * 1000) / volts : 0;
  const loadDay = MONTHLY_USE / 30;

  const pts = profile.points.map((p) => [p.h, p.P]);
  const loadPts = profile.points.map((p) => [p.h, loadAt(p.h, MONTHLY_USE)]);

  return (
    <div className="simGrid">
      <section className="sceneCard">
        <Scene sun={sun} st={st} tilt={tilt} cloud={cloud} load={load} />
        <p className="note">
          Сүрөт схемалык: панелдин жантайышы күн турган тарапка бурулуп чийилет. Сандар (θ, кубаттуулук) түштүккө
          багытталган панель үчүн 3D формула менен эсептелет.
        </p>
      </section>

      <section className="card controls" aria-label="Башкаруу">
        <h2>Параметрлер</h2>

        <div className="field">
          <label htmlFor="hour">Убакыт: <b>{fmtTime(hour)}</b></label>
          <input id="hour" type="range" min="0" max="24" step="0.05" value={hour}
            onChange={(e) => { setPlaying(false); setHour(Number(e.target.value)); }} />
          <div className="rowBtns">
            <button type="button" className="btn primary" onClick={() => setPlaying((p) => !p)}>
              {playing ? 'Токтотуу' : 'Күндү ойнотуу'}
            </button>
            <button type="button" className="btn" onClick={() => { setPlaying(false); setHour(12); }}>Чак түш</button>
          </div>
          <small>Күн {fmtTime(dl.rise)} чыгат, {fmtTime(dl.set)} батат ({MONTHS_FULL[month].toLowerCase()}).</small>
        </div>

        <div className="field">
          <span className="lab">Ай</span>
          <div className="months">
            {MONTHS.map((m, i) => (
              <button key={m} type="button" className={`chip ${i === month ? 'on' : ''}`} onClick={() => setMonth(i)}>{m}</button>
            ))}
          </div>
        </div>

        <div className="field">
          <label htmlFor="tilt">Панелдин жантайышы: <b>{tilt}°</b></label>
          <input id="tilt" type="range" min="0" max="90" step="1" value={tilt} onChange={(e) => setTilt(Number(e.target.value))} />
          <div className="months">
            {[0, 30, 42, 60, 90].map((v) => (
              <button key={v} type="button" className={`chip ${tilt === v ? 'on' : ''}`} onClick={() => setTilt(v)}>{v}°</button>
            ))}
          </div>
          <small>Ысык-Көлдүн кеңдигине жакын бурч — болжол менен 40°–45°.</small>
        </div>

        <div className="field">
          <label htmlFor="cloud">Булуттуулук: <b>{cloud}%</b></label>
          <input id="cloud" type="range" min="0" max="100" step="1" value={cloud} onChange={(e) => setCloud(Number(e.target.value))} />
        </div>
      </section>

      <section className="card explain" aria-live="polite">
        <h2>Азыр эмне болуп жатат?</h2>
        <p>{explain(st, cloud)}</p>
        <ol className="flow">
          <li><b>Күн нуру</b><span>{nf(st.G)} Вт/м²</span></li>
          <li><b>Панель</b><span>{nf(st.P, 2)} кВт</span></li>
          <li><b>Инвертор</b><span>{nf(st.P * 0.97, 2)} кВт AC</span></li>
          <li><b>Үй</b><span>{nf(load, 2)} кВт</span></li>
        </ol>
        <p className={`grid ${net >= 0 ? 'out' : 'in'}`}>
          {st.alt <= 0 || st.P < 0.005
            ? `Тармактан алынат: ${nf(load, 2)} кВт`
            : net >= 0
              ? `Ашыкча ${nf(net, 2)} кВт тармакка берилет`
              : `Жетишпеген ${nf(-net, 2)} кВт тармактан алынат`}
        </p>
      </section>

      <section className="card readouts" aria-label="Көрсөткүчтөр">
        <h2>Өлчөөлөр</h2>
        <dl>
          <div><dt>Күндүн бийиктиги</dt><dd>{nf(sun.alt, 1)}°</dd></div>
          <div><dt>Нурдун түшүү бурчу θ</dt><dd>{st.alt > 0 ? `${nf(st.theta, 1)}°` : '—'}</dd></div>
          <div><dt>Нурдануу (панелде)</dt><dd>{nf(st.G)} Вт/м²</dd></div>
          <div><dt>Кубаттуулук</dt><dd>{nf(st.P, 2)} кВт</dd></div>
          <div><dt>Чыңалуу (DC)</dt><dd>{nf(volts)} В</dd></div>
          <div><dt>Ток</dt><dd>{nf(amps, 1)} А</dd></div>
          <div><dt>Азыркыга чейин</dt><dd>{nf(eSoFar, 1)} кВт·саат</dd></div>
          <div><dt>Күнүнө жалпысы</dt><dd>{nf(profile.total, 1)} кВт·саат</dd></div>
          <div><dt>Үйдүн күнүмдүк керектөөсү</dt><dd>{nf(loadDay, 1)} кВт·саат</dd></div>
          <div><dt>CO₂ үнөмдөлөт (күнүнө)</dt><dd>{nf(profile.total * EF, 1)} кг</dd></div>
        </dl>
        <small>Чыңалуу менен ток — окуу модели (6 панелдик тизме). 3 кВттык станция, айына 300 кВт·саат керектөө.</small>
      </section>

      <section className="card chartCard">
        <h2>Күндүн ичиндеги кубаттуулук</h2>
        <LineChart
          w={760} h={240} xMin={0} xMax={24} xTicks={[0, 4, 8, 12, 16, 20, 24]} marker={hour}
          fmtX={(v) => `${v}:00`} fmtY={(v) => v.toFixed(1)} yLabel="кВт" yMax={Math.max(3, Math.max(...profile.points.map((p) => p.P)) * 1.1)}
          label="Панелдин кубаттуулугу жана үйдүн керектөөсү"
          series={[
            { pts, color: '#f4a300', area: true },
            { pts: loadPts, color: '#1f6f9f', dash: '6 4', width: 2 },
          ]}
        />
        <div className="legend">
          <span><i style={{ background: '#f4a300' }} />Панель өндүрөт</span>
          <span><i style={{ background: '#1f6f9f' }} />Үй керектейт</span>
        </div>
      </section>
    </div>
  );
}
