import { useEffect, useState } from 'react';
import { Mover, useReducedMotion } from './Mover.jsx';

const STEPS = [
  {
    t: 'Күн нуру келет',
    d: 'Күн фотондорду — жарык бөлүкчөлөрүн — чыгарат. Алар Жерге болжол менен 8 мүнөттө жетет. Нур панелге перпендикуляр түшкөндө фотондор эң көп жутулат.',
  },
  {
    t: 'Фотон кремнийге жутулат',
    d: 'Панелдин ичинде кремний (Si) катмарлары бар. Фотондун энергиясы жетиштүү болсо, ал кремний атомунан электронду «сууруп» чыгарат.',
  },
  {
    t: 'Электрон–тешик жуптары пайда болот',
    d: 'Электрон кеткен бош орун «тешик» (+) деп аталат. Ошентип, ар бир жутулган фотондон эркин электрон (−) жана тешик (+) жубу пайда болот.',
  },
  {
    t: 'p–n өткөөл аларды бөлүп салат',
    d: 'n катмарда электрон көп, p катмарда тешик көп. Алардын чек арасындагы электр талаасы электрондорду n тарапка, тешиктерди p тарапка түртөт. Натыйжада жогорку жак (−), ылдыйкы жак (+) болуп, чыңалуу пайда болот.',
  },
  {
    t: 'Туташкан чынжырда ток жүрөт',
    d: 'Электрондор өз орунуна кайтууну каалайт, бирок кремний аркылуу жол жок. Алар сырткы зым аркылуу (лампа аркылуу) p катмарына барат. Электрондордун ушул багытталган кыймылы — электр тогу.',
  },
  {
    t: 'Инвертор жана үй',
    d: 'Панель туруктуу ток (DC) берет. Инвертор аны үйдөгү өзгөрмө токко (AC, 220 В) айлантат. Ашыкча энергия тармакка кетет, жетишпегенин үй тармактан алат.',
  },
];

const WIRE_FULL = 'M700 134 L790 134 L790 338 L700 338';

function Cell({ step, reduce }) {
  const photonXs = [220, 300, 380, 460, 540, 620];
  const pairs = [250, 360, 470, 580];
  const showPhotons = step <= 5;
  const strong = step <= 2;
  return (
    <svg viewBox="0 0 900 400" className="scene how" role="img" aria-label="Күн элементинин кесилиши">
      <rect width="900" height="400" fill="#0f2740" />
      {/* катмарлар */}
      <rect x="150" y="104" width="550" height="26" fill="#a8d4f0" opacity="0.45" />
      <rect x="150" y="130" width="550" height="70" fill="#2f6db3" />
      <rect x="150" y="200" width="550" height="18" fill="#8a64b8" opacity={step >= 4 ? 0.85 : 0.5} />
      <rect x="150" y="218" width="550" height="112" fill="#c8503e" />
      <rect x="150" y="330" width="550" height="14" fill="#7a8591" />
      {[180, 300, 420, 540, 660].map((x) => <rect key={x} x={x} y="126" width="14" height="6" fill="#d7dde4" />)}
      <g className="layerLbl">
        <text x="162" y="120" fill="#0f2740">Айнек (чагылууга каршы катмар)</text>
        <text x="162" y="168" fill="#fff">n катмар — электрон көп</text>
        <text x="162" y="214" fill="#fff" fontSize="11">p–n өткөөл</text>
        <text x="162" y="280" fill="#fff">p катмар — тешик көп</text>
        <text x="162" y="341" fill="#fff" fontSize="11">Арткы контакт</text>
      </g>

      {/* Электр талаасы */}
      {step >= 4 && [210, 330, 450, 570, 650].map((x) => (
        <g key={x} stroke="#fff" strokeWidth="2" opacity="0.9">
          <line x1={x} y1="202" x2={x} y2="216" />
          <polygon points={`${x - 4},212 ${x + 4},212 ${x},218`} fill="#fff" />
        </g>
      ))}
      {step >= 4 && <text x="690" y="213" fill="#fff" fontSize="11" textAnchor="end">E — электр талаасы</text>}

      {/* Фотондор */}
      {showPhotons && photonXs.map((x, i) => (
        <g key={x}>
          <line x1={x} y1="20" x2={x} y2="100" stroke="#ffd23f" strokeWidth="1.5" opacity={strong ? 0.5 : 0.25} />
          <Mover path={`M${x} 20 L${x} ${150 + (i % 3) * 30}`} dur={strong ? 2 : 3.2} begin={-(i * 0.45)} r={5}
            fill="#fff3b0" stroke="#f4a300" reduce={reduce} />
        </g>
      ))}
      {step === 1 && <text x="450" y="14" textAnchor="middle" fill="#ffd23f" fontSize="13">фотондор (күн нуру)</text>}

      {/* жутулуу жарк этүүсү */}
      {step === 2 && !reduce && [250, 360, 470, 580].map((x, i) => (
        <circle key={x} cx={x} cy={170 + (i % 2) * 18} r="4" fill="none" stroke="#fff3b0" strokeWidth="2">
          <animate attributeName="r" values="4;22;4" dur="1.6s" begin={`${-i * 0.3}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0;1" dur="1.6s" begin={`${-i * 0.3}s`} repeatCount="indefinite" />
        </circle>
      ))}

      {/* Электрон–тешик жуптары */}
      {step === 3 && pairs.map((x) => (
        <g key={x}>
          <circle cx={x - 9} cy="208" r="8" fill="#7dd3fc" stroke="#0b5d8a" strokeWidth="1.5" />
          <text x={x - 9} y="212" textAnchor="middle" fontSize="12" fontWeight="700" fill="#06344f">−</text>
          <circle cx={x + 9} cy="208" r="8" fill="#ffb3a8" stroke="#8c2a1d" strokeWidth="1.5" />
          <text x={x + 9} y="212" textAnchor="middle" fontSize="12" fontWeight="700" fill="#6b1409">+</text>
        </g>
      ))}

      {/* Бөлүнүү */}
      {step >= 4 && pairs.map((x, i) => (
        <g key={x}>
          {reduce ? (
            <>
              <circle cx={x - 9} cy="160" r="8" fill="#7dd3fc" stroke="#0b5d8a" strokeWidth="1.5" />
              <circle cx={x + 9} cy="270" r="8" fill="#ffb3a8" stroke="#8c2a1d" strokeWidth="1.5" />
            </>
          ) : (
            <>
              <circle r="8" fill="#7dd3fc" stroke="#0b5d8a" strokeWidth="1.5">
                <animateMotion dur="2.6s" begin={`${-i * 0.6}s`} repeatCount="indefinite" path={`M${x - 9} 208 L${x - 9} 150`} />
              </circle>
              <circle r="8" fill="#ffb3a8" stroke="#8c2a1d" strokeWidth="1.5">
                <animateMotion dur="2.6s" begin={`${-i * 0.6}s`} repeatCount="indefinite" path={`M${x + 9} 208 L${x + 9} 300`} />
              </circle>
            </>
          )}
        </g>
      ))}
      {step >= 4 && (
        <>
          <text x="690" y="152" textAnchor="end" fill="#cfeaff" fontSize="12">электрондор (−) жогору</text>
          <text x="690" y="318" textAnchor="end" fill="#ffe0da" fontSize="12">тешиктер (+) ылдый</text>
        </>
      )}

      {/* Сырткы чынжыр */}
      <path d={WIRE_FULL} fill="none" stroke={step >= 5 ? '#f4a300' : '#6b7a8a'} strokeWidth="4" strokeLinejoin="round" />
      <circle cx="790" cy="232" r="26" fill={step >= 5 ? '#ffe27a' : '#2b3c4f'} stroke="#cfd8e3" strokeWidth="3" />
      {step >= 5 && <circle cx="790" cy="232" r="42" fill="#ffd23f" opacity="0.22" />}
      <text x="790" y="237" textAnchor="middle" fontSize="12" fontWeight="700" fill={step >= 5 ? '#5a3b00' : '#8aa0b5'}>лампа</text>
      <text x="700" y="124" fill="#9ad1ff" fontSize="12" textAnchor="start">(−) терс клемма</text>
      <text x="700" y="362" fill="#ffb3a8" fontSize="12" textAnchor="start">(+) оң клемма</text>
      {step >= 5 && [0, 1, 2, 3, 4, 5].map((i) => (
        <Mover key={i} path={WIRE_FULL} dur={4} begin={-(i * 4) / 6} r={5} fill="#7dd3fc" stroke="#0b5d8a" reduce={reduce} />
      ))}
      {step >= 5 && <text x="745" y="90" fill="#cfeaff" fontSize="12">электрондор зым боюнча агат</text>}
    </svg>
  );
}

function Chain({ reduce }) {
  const boxes = [
    { x: 40, t: 'Күн панели', s: 'DC ~ 250 В' },
    { x: 260, t: 'Инвертор', s: 'DC → AC' },
    { x: 480, t: 'Үй', s: 'AC 220 В' },
    { x: 700, t: 'Эсептегич жана тармак', s: 'ашыкчасы берилет' },
  ];
  return (
    <svg viewBox="0 0 900 400" className="scene how" role="img" aria-label="Панелден үйгө чейинки жол">
      <rect width="900" height="400" fill="#0f2740" />
      {boxes.map((b) => (
        <g key={b.t}>
          <rect x={b.x} y="150" width="160" height="100" rx="12" fill="#e8f0f7" stroke="#7aa5c7" strokeWidth="2" />
          <text x={b.x + 80} y="195" textAnchor="middle" fontSize="15" fontWeight="700" fill="#0f2740">{b.t}</text>
          <text x={b.x + 80} y="220" textAnchor="middle" fontSize="13" fill="#3b5877">{b.s}</text>
        </g>
      ))}
      <path d="M170 200 L260 200" stroke="#f4a300" strokeWidth="4" />
      <path d="M390 200 L480 200 M610 200 L700 200" stroke="#9ad1ff" strokeWidth="4" />
      {[0, 1, 2].map((i) => (
        <Mover key={i} path="M170 200 L260 200" dur={1.8} begin={-i * 0.6} r={5} fill="#7dd3fc" stroke="#0b5d8a" reduce={reduce} />
      ))}
      {[0, 1, 2].map((i) => (
        <Mover key={`b${i}`} path="M390 200 L480 200" dur={1.8} begin={-i * 0.6} r={5} fill="#fff" reduce={reduce} />
      ))}
      {[0, 1, 2].map((i) => (
        <Mover key={`c${i}`} path="M610 200 L700 200" dur={1.8} begin={-i * 0.6} r={5} fill="#fff" reduce={reduce} />
      ))}
      <text x="215" y="185" textAnchor="middle" fill="#ffd27a" fontSize="12">DC</text>
      <text x="435" y="185" textAnchor="middle" fill="#cfe8ff" fontSize="12">AC</text>
      <text x="655" y="185" textAnchor="middle" fill="#cfe8ff" fontSize="12">AC</text>
      <text x="450" y="320" textAnchor="middle" fill="#cfe8ff" fontSize="14">Күндүз ашыкча энергия тармакка кетет, түнкүсүн үй тармактан алат.</text>
    </svg>
  );
}

export default function HowItWorks() {
  const [step, setStep] = useState(1);
  const [auto, setAuto] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!auto) return undefined;
    const id = setInterval(() => setStep((s) => (s >= STEPS.length ? 1 : s + 1)), 4500);
    return () => clearInterval(id);
  }, [auto]);

  const cur = STEPS[step - 1];
  return (
    <div className="howGrid">
      <section className="sceneCard">
        {step === 6 ? <Chain reduce={reduce} /> : <Cell step={step} reduce={reduce} />}
      </section>
      <section className="card steps">
        <h2>Күн нуру кантип электр болуп калат?</h2>
        <ol className="stepList">
          {STEPS.map((s, i) => (
            <li key={s.t}>
              <button type="button" className={`stepBtn ${step === i + 1 ? 'on' : ''}`}
                onClick={() => { setAuto(false); setStep(i + 1); }} aria-current={step === i + 1 ? 'step' : undefined}>
                <span className="n">{i + 1}</span>{s.t}
              </button>
            </li>
          ))}
        </ol>
        <div className="stepText" aria-live="polite">
          <h3>{cur.t}</h3>
          <p>{cur.d}</p>
        </div>
        <div className="rowBtns">
          <button type="button" className="btn" onClick={() => { setAuto(false); setStep((s) => Math.max(1, s - 1)); }} disabled={step === 1}>Мурунку</button>
          <button type="button" className="btn" onClick={() => { setAuto(false); setStep((s) => Math.min(STEPS.length, s + 1)); }} disabled={step === STEPS.length}>Кийинки</button>
          <button type="button" className="btn primary" onClick={() => setAuto((a) => !a)}>{auto ? 'Токтотуу' : 'Автоматтык'}</button>
        </div>
      </section>
    </div>
  );
}
