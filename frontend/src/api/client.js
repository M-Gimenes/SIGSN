const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

export class ApiError extends Error {
  constructor(message, { status, payload } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

async function parseJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function extractErrorMessages(payload) {
  if (!payload) return ['Erro desconhecido.'];
  if (Array.isArray(payload.errors)) return payload.errors;
  if (Array.isArray(payload.erros)) return payload.erros;
  if (payload.message) return [payload.message];
  return ['Erro desconhecido.'];
}

async function request(path, { method = 'GET', body, signal } = {}) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch {
    throw new ApiError('Servidor indisponível. Verifique se o backend está rodando na porta 3333.', {
      status: 0,
    });
  }

  const payload = await parseJson(res);
  if (!res.ok) {
    const messages = extractErrorMessages(payload);
    throw new ApiError(messages.join(' · '), { status: res.status, payload: { errors: messages } });
  }
  return payload;
}

export const api = {
  get: (path, opts) => request(path, opts),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  del: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
};

export { API_URL };
