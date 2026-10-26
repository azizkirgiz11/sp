import { useEffect, useState } from 'react';

export function useReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduce(mq.matches);
    const fn = (e) => setReduce(e.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);
  return reduce;
}

// Жол боюнча жылган бөлүкчө (фотон же электрон)
export function Mover({ path, dur, begin = 0, r = 4, fill, stroke, reduce, repeat = 'indefinite' }) {
  if (reduce) return null;
  return (
    <circle r={r} fill={fill} stroke={stroke} strokeWidth={stroke ? 1 : 0}>
      <animateMotion dur={`${dur}s`} begin={`${begin}s`} repeatCount={repeat} path={path} />
    </circle>
  );
}
