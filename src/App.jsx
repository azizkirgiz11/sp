import { useState } from 'react';
import Simulation from './components/Simulation.jsx';
import HowItWorks from './components/HowItWorks.jsx';
import Lab from './components/Lab.jsx';
import Economics from './components/Economics.jsx';
import Seasons from './components/Seasons.jsx';

const TABS = [
  { id: 'sim', label: 'Симуляция' },
  { id: 'how', label: 'Кантип иштейт?' },
  { id: 'lab', label: 'STEM лаборатория' },
  { id: 'eco', label: 'Экономика жана экология' },
  { id: 'season', label: 'Сезондор жана метео' },
];

export default function App() {
  const [tab, setTab] = useState('sim');
  const [month, setMonth] = useState(5);
  const [hour, setHour] = useState(12);
  const [tilt, setTilt] = useState(42);
  const [cloud, setCloud] = useState(15);

  return (
    <div className="app">
      <header className="top">
        <div>
          <h1>Күн энергиясы жана анын региондук эффективдүүлүгү</h1>
          <p>Күн панелдерин колдонуунун экономикалык жана экологиялык натыйжалуулугу — Ысык-Көл облусунун мисалында</p>
        </div>
        <nav className="tabs" aria-label="Бөлүмдөр">
          {TABS.map((t) => (
            <button key={t.id} type="button" className={`tab ${tab === t.id ? 'on' : ''}`}
              onClick={() => setTab(t.id)} aria-current={tab === t.id ? 'page' : undefined}>
              {t.label}
            </button>
          ))}
        </nav>
      </header>
      <main>
        {tab === 'sim' && (
          <Simulation month={month} setMonth={setMonth} hour={hour} setHour={setHour}
            tilt={tilt} setTilt={setTilt} cloud={cloud} setCloud={setCloud} />
        )}
        {tab === 'how' && <HowItWorks />}
        {tab === 'lab' && <Lab />}
        {tab === 'eco' && <Economics />}
        {tab === 'season' && <Seasons tilt={tilt} cloud={cloud} />}
      </main>
      <footer>Окуу симуляциясы: сандар жөнөкөйлөштүрүлгөн модель боюнча эсептелет жана чыныгы өлчөөнү алмаштырбайт.</footer>
    </div>
  );
}
