/* Универсальный прокси к FastAPI: всё, что уходит на /api/backend/<путь>,
 * пересылается на бэкенд как есть — вместе с заголовком Authorization.
 *
 * Так браузеру не нужно знать адрес бэкенда и не возникает вопросов с CORS,
 * а добавление нового эндпоинта на бэкенде не требует нового route-файла
 * здесь (в отличие от старых точечных прокси /api/investigate и т.п.). */

const BACKEND_URL = process.env.PHYLAX_API_URL ?? "http://127.0.0.1:8000";

async function proxy(request: Request, path: string[]) {
  const url = new URL(request.url);
  const target = `${BACKEND_URL}/${path.join("/")}${url.search}`;

  const headers = new Headers();
  const auth = request.headers.get("authorization");
  if (auth) headers.set("Authorization", auth);
  const ct = request.headers.get("content-type");
  if (ct) headers.set("Content-Type", ct);

  const method = request.method;
  const body = method === "GET" || method === "HEAD" ? undefined : await request.text();

  let upstream: Response;
  try {
    upstream = await fetch(target, { method, headers, body, cache: "no-store" });
  } catch {
    return Response.json(
      { error: `Бэкенд SAQ недоступен по адресу ${BACKEND_URL}. Запущен ли uvicorn?` },
      { status: 502 }
    );
  }

  // потоковые ответы (SSE) отдаём как есть, не буферизуя
  const upstreamCt = upstream.headers.get("content-type") ?? "";
  if (upstreamCt.includes("text/event-stream") && upstream.body) {
    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  }

  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: { "Content-Type": upstreamCt || "application/json" },
  });
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(request: Request, ctx: Ctx) {
  return proxy(request, (await ctx.params).path);
}
export async function POST(request: Request, ctx: Ctx) {
  return proxy(request, (await ctx.params).path);
}
export async function DELETE(request: Request, ctx: Ctx) {
  return proxy(request, (await ctx.params).path);
}
export async function PUT(request: Request, ctx: Ctx) {
  return proxy(request, (await ctx.params).path);
}
