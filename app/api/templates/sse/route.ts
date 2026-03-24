import { addListener, removeListener } from '@/lib/sse/templateBroadcaster';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const encoder = new TextEncoder();
  let cleanup: (() => void) | null = null;

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(': connected\n\n'));

      const listener = (data: string) => {
        try { controller.enqueue(encoder.encode(data)); } catch { /* client disconnected */ }
      };

      addListener(listener);

      const heartbeat = setInterval(() => {
        try { controller.enqueue(encoder.encode(': ping\n\n')); } catch { clearInterval(heartbeat); }
      }, 25_000);

      cleanup = () => {
        clearInterval(heartbeat);
        removeListener(listener);
        try { controller.close(); } catch { /* already closed */ }
      };

      req.signal.addEventListener('abort', () => cleanup?.());
    },
    cancel() { cleanup?.(); },
  });

  return new Response(stream, {
    headers: {
      'Content-Type':      'text/event-stream',
      'Cache-Control':     'no-cache, no-transform',
      'Connection':        'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
