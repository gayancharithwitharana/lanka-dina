import { useEffect, useState } from 'react';

const ONE_MINUTE = 60_000;

export function useNow(): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), ONE_MINUTE);
    return () => clearInterval(timer);
  }, []);

  return now;
}
