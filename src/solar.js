// Күн геометриясы жана панелдин жөнөкөй физикалык модели
export const D2R = Math.PI / 180;
export const LAT = 42.5; // Ысык-Көл облусунун болжолдуу географиялык кеңдиги
export const KWP = 3; // 3 кВттык станция (документтеги мисал)
export const PR = 0.82; // системанын жалпы пайдалуу аракет коэффициенти
export const EF = 0.4; // кг CO2 / кВт·саат (болжолдуу, окуу максатында)

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
export const MONTHS_FULL = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
export const MID_DOY = [17, 47, 75, 105, 135, 162, 198, 228, 258, 288, 318, 344];
export const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export function declination(doy) {
  return 23.45 * Math.sin(D2R * (360 / 365) * (284 + doy));
}

// az: түштүктөн эсептелет, батыш тарап оң (+), чыгыш терс (−)
export function sunPos(doy, hour) {
  const d = declination(doy) * D2R;
  const phi = LAT * D2R;
  const h = 15 * (hour - 12) * D2R;
  const sinA = Math.sin(phi) * Math.sin(d) + Math.cos(phi) * Math.cos(d) * Math.cos(h);
  const alt = Math.asin(clamp(sinA, -1, 1)) / D2R;
  const az = Math.atan2(Math.sin(h), Math.cos(h) * Math.sin(phi) - Math.tan(d) * Math.cos(phi)) / D2R;
  return { alt, az };
}

export function dayLength(doy) {
  const d = declination(doy) * D2R;
  const phi = LAT * D2R;
  const c = clamp(-Math.tan(phi) * Math.tan(d), -1, 1);
  const h0 = Math.acos(c) / D2R / 15;
  return { rise: 12 - h0, set: 12 + h0 };
}

export function fmtTime(h) {
  let hh = Math.floor(h);
  let mm = Math.round((h - hh) * 60);
  if (mm === 60) { hh += 1; mm = 0; }
  if (hh >= 24) hh -= 24;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

// Панелдеги абал: панель түштүккө багытталган, жантайышы = tilt (градус), cloud = 0..1
export function panelState(doy, hour, tilt, cloud) {
  const { alt, az } = sunPos(doy, hour);
  if (alt <= 0) {
    return { alt, az, cosT: 0, theta: 90, G: 0, P: 0, dni: 0 };
  }
  const a = alt * D2R;
  const b = tilt * D2R;
  const z = az * D2R;
  const cosT = Math.sin(a) * Math.cos(b) + Math.cos(a) * Math.sin(b) * Math.cos(z);
  const am = Math.min(1 / Math.max(Math.sin(a), 0.02), 38);
  const dniClear = 1353 * Math.pow(0.7, Math.pow(am, 0.678)) * 1.03; // бийик тоо — нур жука
  const dni = dniClear * (1 - 0.9 * cloud);
  const dhi = dniClear * (0.1 + 0.12 * cloud) * Math.pow(Math.sin(a), 0.6);
  const ghi = dni * Math.sin(a) + dhi;
  const G = dni * Math.max(0, cosT) + (dhi * (1 + Math.cos(b))) / 2 + (0.2 * ghi * (1 - Math.cos(b))) / 2;
  const P = (KWP * G * PR) / 1000;
  const theta = Math.acos(clamp(cosT, -1, 1)) / D2R;
  return { alt, az, cosT, theta, G, P, dni };
}

export function dayProfile(doy, tilt, cloud) {
  const points = [];
  let total = 0;
  for (let i = 0; i <= 96; i++) {
    const h = i * 0.25;
    const s = panelState(doy, h, tilt, cloud);
    points.push({ h, P: s.P, G: s.G });
    if (i < 96) total += s.P * 0.25;
  }
  return { points, total };
}

export function bestTilt(doys, cloud) {
  let best = 0;
  let bestE = -1;
  for (let b = 0; b <= 90; b += 1) {
    let e = 0;
    for (const d of doys) e += dayProfile(d, b, cloud).total;
    if (e > bestE) { bestE = e; best = b; }
  }
  return best;
}

// Үйдүн күнүмдүк жүгү (кВт) — эртең менен жана кечинде жогору
const shape = (h) =>
  0.25 +
  0.45 * Math.exp(-Math.pow((h - 7.5) / 1.2, 2)) +
  0.9 * Math.exp(-Math.pow((h - 20) / 1.8, 2)) +
  0.2 * Math.exp(-Math.pow((h - 13) / 2, 2));
let shapeSum = 0;
for (let i = 0; i < 96; i++) shapeSum += shape(i * 0.25) * 0.25;
export function loadAt(hour, monthlyKwh) {
  return (shape(hour) / shapeSum) * (monthlyKwh / 30);
}

export const nf = (v, d = 0) =>
  Number(v).toLocaleString('ru-RU', { minimumFractionDigits: d, maximumFractionDigits: d });
