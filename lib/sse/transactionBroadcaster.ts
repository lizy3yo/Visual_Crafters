/**
 * SSE broadcaster for transaction events.
 * Mirrors the pattern used in reservationBroadcaster.ts.
 */

type Listener = (data: string) => void;

const listeners = new Set<Listener>();

export function addListener(fn: Listener)    { listeners.add(fn);    }
export function removeListener(fn: Listener) { listeners.delete(fn); }

export function broadcast(event: string, payload: unknown) {
  const data = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  listeners.forEach(fn => fn(data));
}
