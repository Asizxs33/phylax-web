const BACKEND_URL = process.env.PHYLAX_API_URL ?? "http://127.0.0.1:8000";

export async function POST(request: Request) {
  const body = await request.text();

  let upstream: Response;
  try {
    upstream = await fetch(`${BACKEND_URL}/tips`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      cache: "no-store",
    });
  } catch {
    return Response.json(
      { error: `Не удалось достучаться до бэкенда Phylax по адресу ${BACKEND_URL}.` },
      { status: 502 }
    );
  }

  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  });
}
