import { useEffect, useState } from 'react';

const BASE = 'RUB';
const STORAGE_KEY = 'expense-tracker-rates';
const TTL_MS = 1000 * 60 * 60; // 1 час

export interface RatesState {
  rates: Record<string, number>; // курс: 1 RUB = X валюты
  updatedAt: number | null;
  loading: boolean;
  error: string | null;
}

interface CacheShape {
  rates: Record<string, number>;
  updatedAt: number;
}

function loadCache(): CacheShape | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (!v) return null;
    return JSON.parse(v) as CacheShape;
  } catch {
    return null;
  }
}

export function useExchangeRates(symbols: string[]) {
  const cache = loadCache();
  const [state, setState] = useState<RatesState>({
    rates: cache?.rates ?? { RUB: 1 },
    updatedAt: cache?.updatedAt ?? null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    const fresh = cache && Date.now() - cache.updatedAt < TTL_MS;
    if (fresh) return;

    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    // Бесплатный API без ключа
    fetch(`https://open.er-api.com/v6/latest/${BASE}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (!data || !data.rates) throw new Error('Нет данных от биржи');
        const filtered: Record<string, number> = { RUB: 1 };
        for (const code of symbols) {
          if (data.rates[code] != null) filtered[code] = data.rates[code];
        }
        const updatedAt = Date.now();
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ rates: filtered, updatedAt }));
        setState({ rates: filtered, updatedAt, loading: false, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        setState((s) => ({ ...s, loading: false, error: err.message ?? 'Ошибка курса' }));
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const convert = (amountInBase: number, targetCode: string): number => {
    const rate = state.rates[targetCode];
    if (!rate) return amountInBase;
    return amountInBase * rate;
  };

  return { ...state, convert, base: BASE };
}
