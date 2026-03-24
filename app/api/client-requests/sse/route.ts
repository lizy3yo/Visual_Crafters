import { NextRequest } from 'next/server';
import { authenticate, authorizeRole } from '@/lib/auth/middleware';
import { addListener, removeListener } from '@/lib/sse/clientRequestBroadcaster';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Admin-only SSE stream
  const user = await authenticate(req);
  if (!user || !authorizeRole(user, ['admin'])) {
    return new Response('Unauthorized', { status: 401 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Send initial heartbeat
      controller.enqueue(encoder.encode(': connected\n\n'));

      const listener = (data: string) => {
        try { controller.enqueue(encoder.encode(data)); } catch { /* client gone */ }
      };

      addListener(listener);

      // Heartbeat every 25 s to keep connection alive
      const hb = setInterval(() => {
        try { controller.enqueue(encoder.encode(': ping\n\n')); } catch { clearInterval(hb); }
      }, 25_000);

      req.signal.addEventListener('abort', () => {
        clearInterval(hb);
        removeListener(listener);
        try { controller.close(); } catch { /* already closed */ }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection':    'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
