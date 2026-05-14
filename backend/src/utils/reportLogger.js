/**
 * Wrapper de logging para métodos de relatório.
 * Cada execução loga: nome, filtros, duração, total de linhas, hit/miss de cache.
 */

const SLOW_MS = 250;

export async function withReportLogging(nome, filtros, fn) {
  const inicio = process.hrtime.bigint();
  try {
    const resultado = await fn();
    const durationMs = Number(process.hrtime.bigint() - inicio) / 1_000_000;
    const totalLinhas = Array.isArray(resultado?.linhas) ? resultado.linhas.length : 0;
    const meta = resultado?.meta ?? {};
    const flag = durationMs >= SLOW_MS ? 'SLOW' : 'OK';
    console.log(
      `[report] ${nome} ${flag} duration=${durationMs.toFixed(1)}ms linhas=${totalLinhas}` +
      (meta.cache ? ` cache=${meta.cache}` : '') +
      (Object.keys(filtros).length ? ` filtros=${JSON.stringify(filtros)}` : '')
    );
    return resultado;
  } catch (err) {
    const durationMs = Number(process.hrtime.bigint() - inicio) / 1_000_000;
    console.error(
      `[report] ${nome} ERROR duration=${durationMs.toFixed(1)}ms err=${err.name}: ${err.message}` +
      (Object.keys(filtros).length ? ` filtros=${JSON.stringify(filtros)}` : '')
    );
    throw err;
  }
}
