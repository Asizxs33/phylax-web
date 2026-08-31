const BACKEND_URL = process.env.PHYLAX_API_URL ?? "http://127.0.0.1:8000";

export async function POST(request: Request) {
  const body = await request.text();

  let upstream: Response;
  try {
    upstream = await fetch(`${BACKEND_URL}/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      // live SSE investigation stream, never cache or buffer it
      cache: "no-store",
    });
  } catch {
    return Response.json(
      {
        error: `Не удалось достучаться до бэкенда SAQ по адресу ${BACKEND_URL}. Убедитесь, что FastAPI-сервер запущен (uvicorn app.main:app).`,
      },
      { status: 502 }
    );
  }

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
