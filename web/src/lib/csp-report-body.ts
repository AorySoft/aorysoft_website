export type BodyReadResult =
  | { ok: true; text: string }
  | { ok: false; reason: "too_large" | "read_error" };

/**
 * Read a request body as UTF-8 while counting BYTES as they stream in, and
 * stop as soon as the cap is exceeded. Unlike `await request.text()`, a huge
 * or chunked (no Content-Length) body is never fully buffered (N3).
 */
export async function readBodyWithLimit(
  request: Request,
  maxBytes: number,
): Promise<BodyReadResult> {
  const declared = Number(request.headers.get("content-length") ?? "");
  if (Number.isFinite(declared) && declared > maxBytes) {
    return { ok: false, reason: "too_large" };
  }

  if (!request.body) return { ok: true, text: "" };

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let received = 0;
  let text = "";

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (received > maxBytes) {
        await reader.cancel().catch(() => {});
        return { ok: false, reason: "too_large" };
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    return { ok: true, text };
  } catch {
    return { ok: false, reason: "read_error" };
  }
}
