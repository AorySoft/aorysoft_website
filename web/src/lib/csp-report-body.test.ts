import { describe, expect, it } from "vitest";
import { readBodyWithLimit } from "./csp-report-body";

function streamRequest(chunks: Uint8Array[], headers: HeadersInit = {}) {
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(chunk);
      controller.close();
    },
  });
  return new Request("http://localhost/api/csp-report", {
    method: "POST",
    body,
    headers,
    // @ts-expect-error — required by undici for streamed bodies
    duplex: "half",
  });
}

describe("readBodyWithLimit", () => {
  it("returns the body when under the cap", async () => {
    const req = new Request("http://localhost/x", { method: "POST", body: '{"a":1}' });
    await expect(readBodyWithLimit(req, 100)).resolves.toEqual({
      ok: true,
      text: '{"a":1}',
    });
  });

  it("rejects early from a declared Content-Length", async () => {
    const req = new Request("http://localhost/x", {
      method: "POST",
      body: "x",
      headers: { "content-length": "99999" },
    });
    await expect(readBodyWithLimit(req, 100)).resolves.toEqual({
      ok: false,
      reason: "too_large",
    });
  });

  it("counts bytes, not characters, on a streamed body without Content-Length", async () => {
    // 40 × "é" = 40 characters but 80 bytes in UTF-8.
    const bytes = new TextEncoder().encode("é".repeat(40));
    const req = streamRequest([bytes.slice(0, 30), bytes.slice(30)]);
    await expect(readBodyWithLimit(req, 60)).resolves.toEqual({
      ok: false,
      reason: "too_large",
    });
  });

  it("decodes multi-byte characters split across chunks", async () => {
    const bytes = new TextEncoder().encode("héllo");
    const req = streamRequest([bytes.slice(0, 2), bytes.slice(2)]);
    await expect(readBodyWithLimit(req, 100)).resolves.toEqual({
      ok: true,
      text: "héllo",
    });
  });
});
