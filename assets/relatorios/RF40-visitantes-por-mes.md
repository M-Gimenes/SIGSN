# RF40 — Totais de Visitantes por Mês

`GET /relatorios/visitantes-por-mes`

Agrupa os agendamentos por **mês/ano** da `dataVisita` e produz três métricas por bucket: total de agendamentos, total de visitantes e média de visitantes por agendamento. Também retorna um totalizador geral.

## Filtros aceitos (`req.query`)

| Parâmetro     | Tipo   | Default | Restrição                                                                |
|---------------|--------|---------|--------------------------------------------------------------------------|
| `dataInicial` | string | —       | `YYYY-MM-DD`. Comparada como `data_visita >= "<data> 00:00:00"`.         |
| `dataFinal`   | string | —       | `YYYY-MM-DD`. Comparada como `data_visita <= "<data> 23:59:59"`.         |

Sem paginação — este relatório retorna **uma linha por mês**, o volume é naturalmente baixo.

Validação em `parseFiltrosVisitantesPorMes`:

```js
export function parseFiltrosVisitantesPorMes(query) {
  const erros = [];
  const out = {
    dataInicial: parseDate(query.dataInicial, 'dataInicial', erros),
    dataFinal:   parseDate(query.dataFinal,   'dataFinal',   erros),
  };
  validarOrdemDeDatas(out.dataInicial, out.dataFinal, erros);
  finalize(erros);
  return out;
}
```

## Execução

Este é um dos dois relatórios que usam **SQL bruto** (`sequelize.query(..., { type: SELECT })`) em vez do ORM. O motivo é a função específica `strftime('%Y-%m', ...)` do SQLite, que agrupa em granularidade mensal:

```js
const params = {};
let dateFilter = '';
if (dataInicial) {
  dateFilter += ' AND a.data_visita >= :dataInicial';
  params.dataInicial = `${dataInicial} 00:00:00`;
}
if (dataFinal) {
  dateFilter += ' AND a.data_visita <= :dataFinal';
  params.dataFinal = `${dataFinal} 23:59:59`;
}

const linhas = await sequelize.query(
  `
    SELECT
      strftime('%Y-%m', a.data_visita) AS mesAno,
      COUNT(a.id)                      AS totalAgendamentos,
      SUM(c.quantidade_visitantes)     AS totalVisitantes,
      AVG(c.quantidade_visitantes)     AS mediaVisitantes
    FROM agendamentos a
    JOIN caravanas c ON c.id = a.caravana_id
    WHERE 1=1 ${dateFilter}
    GROUP BY strftime('%Y-%m', a.data_visita)
    ORDER BY mesAno ASC
  `,
  { replacements: params, type: QueryTypes.SELECT }
);

const [totais] = await sequelize.query(
  `
    SELECT
      COUNT(a.id)                  AS totalAgendamentos,
      SUM(c.quantidade_visitantes) AS totalVisitantes,
      AVG(c.quantidade_visitantes) AS mediaGeral
    FROM agendamentos a
    JOIN caravanas c ON c.id = a.caravana_id
    WHERE 1=1 ${dateFilter}
  `,
  { replacements: params, type: QueryTypes.SELECT }
);
```

### Variáveis SQL utilizáveis (`:replacements`)

| Bind         | Origem                                  | Quando entra na query                   |
|--------------|-----------------------------------------|------------------------------------------|
| `:dataInicial` | `${dataInicial} 00:00:00`             | Apenas se `dataInicial` foi informado.  |
| `:dataFinal`   | `${dataFinal} 23:59:59`               | Apenas se `dataFinal` foi informado.    |

A concatenação `WHERE 1=1 ${dateFilter}` é segura porque `dateFilter` contém apenas placeholders nomeados (`:dataInicial`, `:dataFinal`) — os valores reais são passados via `replacements`, escapados pelo Sequelize, evitando SQL injection.

### Por que duas queries?

- A primeira (`linhas`) retorna **um bucket por mês**.
- A segunda (`totais`) calcula `COUNT/SUM/AVG` sobre **todo o conjunto** filtrado, sem `GROUP BY`. Note que `mediaGeral` é a média global de visitantes por agendamento, **não** a média das médias mensais.

## Variáveis chave no método

| Variável     | Origem                                        | Uso                                          |
|--------------|-----------------------------------------------|----------------------------------------------|
| `filtros`    | `parseFiltrosVisitantesPorMes(req.query)`     | `{ dataInicial, dataFinal }` validados.      |
| `cacheKey`   | `reportCache.constructor.key('RF40', filtros)` | Identifica unicamente esta combinação.       |
| `dateFilter` | string concatenada                            | Fragmento de SQL com placeholders nomeados.  |
| `params`     | objeto                                        | `replacements` para `sequelize.query`.       |
| `linhas`     | 1ª query                                      | Buckets mensais.                             |
| `totais`     | 2ª query                                      | Totais e média geral.                        |

## Resposta

```jsonc
{
  "filtros": { "dataInicial": "2026-01-01", "dataFinal": "2026-12-31" },
  "linhas": [
    { "mesAno": "2026-04", "totalAgendamentos": 4, "totalVisitantes": 115, "mediaVisitantes": 28.75 },
    { "mesAno": "2026-06", "totalAgendamentos": 3, "totalVisitantes": 95,  "mediaVisitantes": 31.67 }
  ],
  "totais": { "totalAgendamentos": 7, "totalVisitantes": 210, "mediaGeral": 30 },
  "meta": { "cache": "MISS" }    // "HIT" se servido do cache
}
```

Os valores de `mediaVisitantes` e `mediaGeral` são arredondados a 2 casas decimais no JS:

```js
mediaVisitantes: Number(toNumber(l.mediaVisitantes).toFixed(2)),
```

## Cache

**Usa o `reportCache` (TTL 60 s).** Faz sentido aqui porque:

- O agrupamento mensal é estável dentro de uma janela curta.
- Não há paginação, então a chave depende apenas de `dataInicial`/`dataFinal`, gerando alta taxa de acerto.

```js
const cacheKey = reportCache.constructor.key('RF40', filtros);
const cached = reportCache.get(cacheKey);
if (cached) return { ...cached, meta: { cache: 'HIT' } };

// ... executa SQL ...

reportCache.set(cacheKey, resultado);
return { ...resultado, meta: { cache: 'MISS' } };
```

A chave é determinística (parâmetros ordenados alfabeticamente), então `?dataFinal=...&dataInicial=...` e `?dataInicial=...&dataFinal=...` colidem no mesmo bucket.

## Observações

- **Dependência de dialeto:** `strftime` é específico do SQLite. Caso o ambiente seja trocado para PostgreSQL (`backend/src/config/database-config.js`), substituir por `TO_CHAR(a.data_visita, 'YYYY-MM')`.
- O `JOIN` é `INNER` — agendamentos sem caravana associada não entram (o que, na prática, não ocorre por `quantidadeVisitantes` ser obrigatório no modelo).
