/**
 * Cache em memória com TTL.
 * Uso restrito a relatórios puramente agregados (RF40, RF44) que
 * sofrem pouca rotação durante um intervalo de leitura.
 */

const DEFAULT_TTL_MS = 60_000;

class ReportCache {
  constructor(ttlMs = DEFAULT_TTL_MS) {
    this.ttlMs = ttlMs;
    this.store = new Map();
  }

  static key(scope, params) {
    const ordered = Object.keys(params)
      .filter((k) => params[k] !== undefined && params[k] !== '')
      .sort()
      .map((k) => `${k}=${params[k]}`)
      .join('&');
    return `${scope}::${ordered}`;
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key, value) {
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  invalidate(scopePrefix) {
    for (const k of this.store.keys()) {
      if (k.startsWith(scopePrefix)) this.store.delete(k);
    }
  }

  clear() {
    this.store.clear();
  }
}

export const reportCache = new ReportCache();
