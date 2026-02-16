// Small fetch-based API helper to replace axios usage
// Prefer explicit Vite env var `VITE_API_URL`, otherwise default to backend port 3001 in dev
const API_PREFIX = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : (import.meta.env.DEV ? 'http://localhost:3000' : '');

async function parseResponse(res) {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  // try to return text for non-json responses
  return res.text().catch(() => null);
}

export async function apiGet(path, opts = {}) {
  console.log(`API GET: ${API_PREFIX}${path}`);
  const res = await fetch(`${API_PREFIX}${path}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
    ...opts,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const err = new Error(`GET ${path} failed with status ${res.status}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }

  return parseResponse(res);
}

export async function apiPost(path, body = undefined, opts = {}) {
  const headers = {
    Accept: 'application/json',
  };
  let bodyToSend;
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    bodyToSend = JSON.stringify(body);
  }

  const res = await fetch(`${API_PREFIX}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: bodyToSend,
    ...opts,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err = new Error(`POST ${path} failed with status ${res.status}`);
    err.status = res.status;
    err.body = text;
    throw err;
  }

  // For endpoints that redirect to HTML (like POST that redirects), parsing as JSON may fail.
  // parseResponse will return JSON when content-type is application/json, otherwise text.
  return parseResponse(res);
}

export default {
  apiGet,
  apiPost,
};
