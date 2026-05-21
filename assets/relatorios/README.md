# Relatórios SIGSN

Esta pasta documenta, em detalhes, cada um dos 6 relatórios expostos pelo `ReportService` (`backend/src/services/ReportService.js`). Cada relatório possui:

- Uma rota HTTP `GET` em `/relatorios/...`.
- Um método estático em `ReportService` (encadeado pelo `ReportController`).
- Um parser de filtros em `backend/src/utils/reportFilters.js` que valida `req.query` e lança `ValidationError` (HTTP 400) caso algo esteja errado.
- Telemetria via `withReportLogging('RFxx:nome', filtros, fn)` (`backend/src/utils/reportLogger.js`).
- Opcionalmente cache em memória (`reportCache`, TTL 60 s) — usado em RF40 e RF44.

## Arquitetura comum

```text
HTTP GET /relatorios/<rota>
       │
       ▼
ReportController.<acao>  ──►  ReportService.<acao>(req)
                                    │
                                    ├── parseFiltros<Acao>(req.query)  → valida e normaliza
                                    │
                                    ├── withReportLogging('RFxx', filtros, async () => { ... })
                                    │       │
                                    │       ├── (opcional) reportCache.get(key)
                                    │       │
                                    │       ├── Sequelize ORM (findAll/count) — RF39, RF41, RF42, RF43
                                    │       │   ou
                                    │       ├── SQL bruto via sequelize.query(..., { replacements, type: SELECT })
                                    │       │   — RF40, RF44
                                    │       │
                                    │       └── reportCache.set(key, resultado)  (RF40/RF44)
                                    │
                                    └── Promise<Resultado>  ──►  res.json(obj)
```

## Helpers reaproveitados

| Helper | Local | Função |
|--------|-------|--------|
| `rangeDate(field, dataInicial, dataFinal)`     | `ReportService.js` | Monta um `where` Sequelize com `Op.gte` / `Op.lte` para colunas tipo `DATE`. |
| `rangeDateTime(field, dataInicial, dataFinal)` | `ReportService.js` | Idem para `DATETIME`, anexando `00:00:00` e `23:59:59` para abranger o dia todo. |
| `paginar(totalLinhas, page, pageSize)`         | `ReportService.js` | Calcula `totalPaginas = ceil(totalLinhas / pageSize)`. |
| `toNumber(v)`                                  | `ReportService.js` | Converte agregações nulas em `0` para evitar `null` no JSON. |
| `parseDate / parseId / parseEnum / parsePagination` | `reportFilters.js` | Validações primitivas. |
| `validarOrdemDeDatas`                          | `reportFilters.js` | Garante que `dataInicial <= dataFinal`. |
| `reportCache.key(scope, params)`               | `reportCache.js`   | Gera chave estável ordenando os filtros não-vazios. |

## Convenções de paginação

- `page` default = `1`, `pageSize` default = `50`, `pageSize` máximo = `500`.
- `paginacao` é retornado apenas em relatórios paginados: RF39, RF42, RF43.

## Índice de relatórios

| RF   | Rota                                              | Método do Service               | Arquivo |
|------|---------------------------------------------------|----------------------------------|---------|
| RF39 | `GET /relatorios/agendamentos`                    | `agendamentos`                  | [RF39-agendamentos.md](./RF39-agendamentos.md) |
| RF40 | `GET /relatorios/visitantes-por-mes`              | `visitantesPorMes`              | [RF40-visitantes-por-mes.md](./RF40-visitantes-por-mes.md) |
| RF41 | `GET /relatorios/projetos`                        | `projetos`                      | [RF41-projetos.md](./RF41-projetos.md) |
| RF42 | `GET /relatorios/pesquisadores-por-projeto`       | `pesquisadoresPorProjeto`       | [RF42-pesquisadores-por-projeto.md](./RF42-pesquisadores-por-projeto.md) |
| RF43 | `GET /relatorios/observacoes`                     | `observacoes`                   | [RF43-observacoes.md](./RF43-observacoes.md) |
| RF44 | `GET /relatorios/estatisticas-observacoes`        | `estatisticasObservacoes`       | [RF44-estatisticas-observacoes.md](./RF44-estatisticas-observacoes.md) |
