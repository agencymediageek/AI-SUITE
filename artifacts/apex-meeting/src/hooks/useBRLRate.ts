import { useEffect, useState } from 'react';

const CACHE_KEY = 'apex_brl_rate';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hora

/**
 * Retorna a cotação USD→BRL em tempo real.
 * Usa localStorage como cache (TTL 1h). Fallback: 5.20 se a API falhar.
 */
export function useBRLRate(fallback = 5.20): number {
  const [rate, setRate] = useState<number>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { value, ts } = JSON.parse(cached);
        if (Date.now() - ts < CACHE_TTL_MS && typeof value === 'number') return value;
      }
    } catch {}
    return fallback;
  });

  useEffect(() => {
    // Verificar cache antes de buscar
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { ts } = JSON.parse(cached);
        if (Date.now() - ts < CACHE_TTL_MS) return; // ainda válido
      }
    } catch {}

    let cancelled = false;
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        const brl = data?.rates?.BRL;
        if (typeof brl === 'number' && brl > 4 && brl < 15) {
          setRate(brl);
          localStorage.setItem(CACHE_KEY, JSON.stringify({ value: brl, ts: Date.now() }));
        }
      })
      .catch(() => { /* fallback silencioso */ });

    return () => { cancelled = true; };
  }, []);

  return rate;
}
