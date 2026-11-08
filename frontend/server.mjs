import { createServer } from 'node:http';
import Exa from 'exa-js';

/**
 * Server-only search endpoint for the site's web search feature.
 *
 * EXA_API_KEY is read from the process environment (loaded from the local env file
 * by the `server` npm script). The key and the Exa SDK never reach the browser:
 * the frontend only talks to this route through Vite's /api proxy.
 */

// Pick up the local env file(s) when the process is started directly with `node server.mjs`.
for (const envFile of ['.env', '../.env']) {
  try {
    process.loadEnvFile(envFile);
  } catch {
    // No such env file, or a Node version without loadEnvFile: use the process environment.
  }
}

const PORT = Number(process.env.SEARCH_API_PORT ?? 8787);
const MAX_QUERY_LENGTH = 200;
const MAX_BODY_BYTES = 10_000;
const NUM_RESULTS = 5;

class SearchError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = 'SearchError';
    this.status = status;
    this.code = code;
  }
}

let exaClient;

function getExaClient() {
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) {
    throw new SearchError(
      503,
      'missing_api_key',
      'Web search is not configured yet. Add EXA_API_KEY to your local env file and restart the search server.'
    );
  }

  exaClient ??= new Exa(apiKey);
  return exaClient;
}

function toSearchError(error) {
  if (error instanceof SearchError) {
    return error;
  }

  const status = error?.statusCode ?? error?.status;

  if (status === 401) {
    return new SearchError(401, 'unauthorized', 'Exa rejected the API key. Check EXA_API_KEY in your local env file.');
  }
  if (status === 402) {
    return new SearchError(402, 'credits_exhausted', 'Exa credits are exhausted. Add credits in your Exa dashboard.');
  }
  if (status === 429) {
    return new SearchError(429, 'rate_limited', 'Exa is rate limiting requests right now. Please try again in a moment.');
  }

  return new SearchError(502, 'search_failed', 'The search provider did not return results. Please try again.');
}

async function searchWeb(query) {
  const exa = getExaClient();
  const response = await exa.search(query, {
    type: 'auto',
    numResults: NUM_RESULTS,
    contents: { highlights: true },
  });

  return (response.results ?? []).map((result) => ({
    title: result.title ?? null,
    url: result.url,
    publishedDate: result.publishedDate ?? null,
    author: result.author ?? null,
    highlights: (result.highlights ?? []).filter(Boolean).slice(0, 2),
  }));
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];

    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new SearchError(413, 'payload_too_large', 'That search request was too large.'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new SearchError(400, 'invalid_json', 'The search request body was not valid JSON.'));
      }
    });

    req.on('error', () => reject(new SearchError(400, 'invalid_request', 'The search request could not be read.')));
  });
}

async function handleSearch(req, res) {
  const payload = await readJsonBody(req);
  const query = typeof payload.query === 'string' ? payload.query.trim() : '';

  if (!query) {
    throw new SearchError(400, 'invalid_query', 'Enter something to search for.');
  }
  if (query.length > MAX_QUERY_LENGTH) {
    throw new SearchError(400, 'invalid_query', `Keep the search under ${MAX_QUERY_LENGTH} characters.`);
  }

  const results = await searchWeb(query);
  sendJson(res, 200, { query, results });
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

  if (url.pathname === '/api/health') {
    sendJson(res, 200, { ok: true, configured: Boolean(process.env.EXA_API_KEY) });
    return;
  }

  if (url.pathname !== '/api/search') {
    sendJson(res, 404, { error: { code: 'not_found', message: 'Unknown route.' } });
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    sendJson(res, 405, { error: { code: 'method_not_allowed', message: 'Use POST for search.' } });
    return;
  }

  try {
    await handleSearch(req, res);
  } catch (error) {
    const searchError = toSearchError(error);
    if (!(error instanceof SearchError)) {
      console.error('[search] Exa search failed:', error);
    }
    sendJson(res, searchError.status, {
      error: { code: searchError.code, message: searchError.message },
    });
  }
});

server.listen(PORT, () => {
  console.log(`[search] Exa search API listening on http://localhost:${PORT}`);
});
