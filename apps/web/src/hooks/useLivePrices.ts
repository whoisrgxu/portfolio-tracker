import { useEffect, useMemo, useRef, useState } from 'react';

type PriceMap = Record<
  string,
  {
    price: number;
    timestamp: number;
    volume?: number;
  }
>;

interface UseLivePricesOptions {
  enabled?: boolean;
}

const DEFAULT_HTTP_API_URL =
  (import.meta as any)?.env?.VITE_API_URL ?? 'http://localhost:8000';
function buildDefaultWsUrl(): string {
  const explicit = (import.meta as any)?.env?.VITE_API_WS_URL;
  if (explicit) return explicit;

  try {
    const url = new URL(DEFAULT_HTTP_API_URL);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    url.pathname = `${url.pathname.replace(/\/$/, '')}/stream/prices`;
    return url.toString();
  } catch {
    return 'ws://localhost:8000/stream/prices';
  }
}

const DEFAULT_WS_API_URL = buildDefaultWsUrl();

/**
 * Small helper that normalizes a list of symbols so we avoid resubscribing
 * unless the actual watch list changed (order/duplicates do not matter).
 */
function dedupeSymbols(symbols: string[]): string[] {
  const unique = new Set(
    symbols
      .filter(Boolean)
      .map((symbol) => symbol.trim().toUpperCase())
      .filter(Boolean),
  );
  return Array.from(unique).sort();
}

/**
 * Hook that connects to our backend WebSocket stream and keeps the latest trade
 * per symbol in memory. Components can consume the returned map to update their
 * UI without worrying about socket lifecycle, retries, or subscription diffs.
 */
export function useLivePrices(
  symbols: string[],
  options: UseLivePricesOptions = {},
): PriceMap {
  const { enabled = true } = options;
  const [prices, setPrices] = useState<PriceMap>({});
  const [reconnectNonce, bumpReconnectNonce] = useState(0);
  const websocketRef = useRef<WebSocket | null>(null);

  const watchList = useMemo(() => dedupeSymbols(symbols), [symbols]);
  const watchKey = watchList.join(',');

  useEffect(() => {
    if (!enabled || watchList.length === 0) {
      return;
    }

    const ws = new WebSocket(DEFAULT_WS_API_URL);
    websocketRef.current = ws;

    let reconnectTimer: number | null = null;

    const subscribe = () => {
      ws.send(JSON.stringify({ action: 'subscribe', symbols: watchList }));
    };

    ws.onopen = subscribe;

    ws.onmessage = (event: MessageEvent<string>) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'trade') {
          setPrices((prev) => ({
            ...prev,
            [payload.symbol]: {
              price: payload.price,
              timestamp: payload.timestamp,
              volume: payload.volume,
            },
          }));
        }
      } catch (error) {
        console.error('Failed to parse price event', error);
      }
    };

    ws.onerror = (event) => {
      console.error('Live price socket error', event);
    };

    ws.onclose = () => {
      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer);
      }
      // Attempt a very simple reconnect using a short delay so we keep prices
      // flowing even if the server restarts.
      reconnectTimer = window.setTimeout(() => {
        setPrices({});
        bumpReconnectNonce((value) => value + 1);
      }, 1000);
    };

    return () => {
      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer);
      }
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ action: 'unsubscribe', symbols: watchList }));
      }
      ws.close();
      websocketRef.current = null;
    };
  }, [enabled, watchKey, reconnectNonce]);

  return prices;
}
