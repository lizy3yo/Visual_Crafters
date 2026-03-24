import { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { ACCESS_COOKIE } from '@/lib/auth/cookies';
import { addListener, removeListener } from '@/lib/sse/templateBroadcaster';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // EventSource sends cookies automatically when withCredentials: true
  const token = req.cookies.get(ACCESS_COOKIE)?.value;
  if (!token) return new Response('Unauthorized', { status: 401 });

  const user = verifyAccessToken(token);
  if (!user || user.role !== 'admin') {
    return new Response('Unauthorized', { status: 401 });
  }

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
