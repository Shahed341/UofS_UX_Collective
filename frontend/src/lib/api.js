import { useCallback, useEffect, useState } from 'react';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = 'GET', body, headers } = {}) {
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  const res = await fetch(path, {
    method,
    credentials: 'same-origin',
    headers: body && !isForm ? { 'Content-Type': 'application/json', ...headers } : headers,
    body: body && !isForm ? JSON.stringify(body) : body,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    // non-JSON response (e.g. proxy error page)
  }
  if (!res.ok || data?.success === false) {
    throw new ApiError(data?.error || `Request failed (${res.status})`, res.status);
  }
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  del: (path) => request(path, { method: 'DELETE' }),
};

// Fetches `path` on mount (and whenever it changes). Returns { data, error, loading, reload }.
export function useApi(path, { select = (res) => res.data, initial = null } = {}) {
  const [state, setState] = useState({ data: initial, error: null, loading: !!path });

  const load = useCallback(async () => {
    if (!path) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await api.get(path);
      setState({ data: select(res), error: null, loading: false });
    } catch (error) {
      setState((s) => ({ ...s, error, loading: false }));
    }
    // `select` is intentionally excluded: callers pass inline functions
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}
