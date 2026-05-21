# RF44 — Estatísticas de Observações por Projeto e Constelação

`GET /relatorios/estatisticas-observacoes`

Para cada combinação **projeto × constelação**, agrega total de observações, total de descobertas, total de atualizações e o intervalo de datas (`MIN`/`MAX` de `data_observacao`). É o resumo executivo da atividade observacional.

## Filtros aceitos (`req.query`)

| Parâmetro       | Tipo    | Default | Restrição                                                    |
|-----------------|---------|---------|---------------------------------------------------------------|
| `dataInicial`   | string  | —       | `YYYY-MM-DD`. Compara contra `o.data_observacao`.            |
| `dataFinal`     | string  | —       | `YYYY-MM-DD`. Idem.                                          |
| `projetoId`     | inteiro | —       | `> 0`.                                                       |
| `constelacaoId` | inteiro | —       | `> 0`.                                                       |

Sem paginação — uma linha por combinação (projeto, constelação), volume baixo.

Validação em `parseFiltrosEstatisticasObservacoes`:

```js
export function parseFiltrosEstatisticasObservacoes(query) {
  const erros = [];
  const out = {
    dataInicial:   parseDate(query.dataInicial, 'dataInicial', erros),
    dataFinal:     parseDate(query.dataFinal,   'dataFinal',   erros),
    projetoId:     parseId(query.projetoId,     'projetoId',     erros),
    constelacaoId: parseId(query.constelacaoId, 'constelacaoId', erros),
  };
  validarOrdemDeDatas(out.dataInicial, out.dataFinal, erros);
  finalize(erros);
  return out;
}
```

## Execução

Como em RF40, é usado **SQL bruto** (`sequelize.query`). O motivo é a combinação `GROUP BY (projeto, constelação)` com agregações condicionais `SUM(CASE ...)` e `MIN/MAX` em uma única passagem — mais limpa em SQL nativo que via API do Sequelize.

```js
const params = {};
const conds = ['1=1'];
if (dataInicial)   { conds.push('o.data_observacao >= :dataInicial');   params.dataInicial   = dataInicial; }
if (dataFinal)     { conds.push('o.data_observacao <= :dataFinal');     params.dataFinal     = dataFinal; }
if (projetoId)     { conds.push('o.projeto_id      = :projetoId');      params.projetoId     = projetoId; }
if (constelacaoId) { conds.push('o.constelacao_id  = :constelacaoId');  params.constelacaoId = constelacaoId; }

const linhas = await sequelize.query(
  `
    SELECT
      MIN(o.data_observacao) AS dataPrimeiraObs,
      MAX(o.data_observacao) AS dataUltimaObs,
      p.titulo               AS projeto,
      c.nome                 AS constelacao,
      SUM(CASE WHEN o.versao_observacao = 1 THEN 1 ELSE 0 END) AS totalDescobertas,
      SUM(CASE WHEN o.versao_observacao > 1 THEN 1 ELSE 0 END) AS totalAtualizacoes,
      COUNT(o.id)            AS totalObservacoes
    FROM observacoes o
    JOIN projetos     p ON p.id = o.projeto_id
    JOIN constelacoes c ON c.id = o.constelacao_id
    WHERE ${conds.join(' AND ')}
    GROUP BY o.projeto_id, o.constelacao_id
    ORDER BY totalObservacoes DESC, projeto ASC, constelacao ASC
  `,
  { replacements: params, type: QueryTypes.SELECT }
);
```

### Construção dinâmica do `WHERE`

A query é montada em duas estruturas paralelas:

| Estrutura          | Conteúdo                                                | Resultado quando todos os filtros estão presentes                                                        |
|--------------------|---------------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| `conds: string[]`  | Fragmentos com placeholders nomeados                    | `['1=1', 'o.data_observacao >= :dataInicial', ..., 'o.constelacao_id = :constelacaoId']`                |
| `params: object`   | Valores correspondentes                                 | `{ dataInicial, dataFinal, projetoId, constelacaoId }`                                                   |

O fragmento `1=1` serve de "âncora" — permite usar `WHERE ${conds.join(' AND ')}` sem se preocupar se há ou não filtros adicionais.

**Apenas placeholders nomeados** são concatenados ao SQL; os valores entram pelo `replacements` e são escapados pelo Sequelize → **não há SQL injection**.

### Variáveis SQL utilizáveis (`:replacements`)

| Bind             | Quando entra                          | Coluna comparada            |
|------------------|----------------------------------------|------------------------------|
| `:dataInicial`   | `dataInicial` informado               | `o.data_observacao` (`>=`)   |
| `:dataFinal`     | `dataFinal` informado                 | `o.data_observacao` (`<=`)   |
| `:projetoId`     | `projetoId` informado                 | `o.projeto_id` (`=`)         |
| `:constelacaoId` | `constelacaoId` informado             | `o.constelacao_id` (`=`)     |

### Por que `JOIN` (não `LEFT JOIN`)?

`Observacao.projetoId` e `Observacao.constelacaoId` são **obrigatórios** (regras de negócio no `ObservacaoService`), então `INNER JOIN` é seguro e ligeiramente mais barato.

### Ordenação

```sql
ORDER BY totalObservacoes DESC, projeto ASC, constelacao ASC
```

Coloca primeiro os pares (projeto, constelação) com mais observações — útil para identificar os alvos mais estudados.

## Variáveis chave no método

| Variável     | Origem                                              | Uso                                                  |
|--------------|-----------------------------------------------------|-------------------------------------------------------|
| `filtros`    | `parseFiltrosEstatisticasObservacoes(req.query)`    | Validados.                                            |
| `cacheKey`   | `reportCache.constructor.key('RF44', filtros)`      | Identifica unicamente esta combinação.                |
| `conds`      | `string[]` com placeholders                         | Fragmentos do `WHERE`.                                |
| `params`     | objeto                                              | `replacements` para `sequelize.query`.                |
| `linhas`     | resultado bruto                                     | Uma linha por par (projeto, constelação).             |
| `linhasNum`  | `linhas.map(...)`                                   | Mesmas linhas com agregações convertidas via `toNumber`. |

## Resposta

```jsonc
{
  "filtros": { "dataInicial": null, "dataFinal": null, "projetoId": null, "constelacaoId": null },
  "linhas": [
    {
      "dataPrimeiraObs": "2025-09-10",
      "dataUltimaObs":   "2025-09-10",
      "projeto":         "Projeto Aster",
      "constelacao":     "Orion",
      "totalDescobertas": 1,
      "totalAtualizacoes": 1,
      "totalObservacoes": 2
    }
  ],
  "totais": { "totalProjetos": 4, "totalConstelacoes": 4, "totalObservacoes": 5 },
  "meta": { "cache": "MISS" }
}
```

Os totais gerais são calculados em JS:

```js
totais: {
  totalProjetos:     new Set(linhasNum.map((l) => l.projeto)).size,
  totalConstelacoes: new Set(linhasNum.map((l) => l.constelacao)).size,
  totalObservacoes:  linhasNum.reduce((s, l) => s + l.totalObservacoes, 0),
},
```

- `totalProjetos` / `totalConstelacoes` contam **distinct** via `Set`. Se um projeto aparece em duas constelações, ele é contado **uma única vez**.
- `totalObservacoes` é simplesmente a soma das linhas (não há sobreposição porque o `GROUP BY` é por par).

## Cache

**Usa o `reportCache` (TTL 60 s).** Mesmas razões de RF40: não paginado, chave estável a partir dos filtros, alta probabilidade de chamadas repetidas no front em curto intervalo.

```js
const cacheKey = reportCache.constructor.key('RF44', filtros);
const cached = reportCache.get(cacheKey);
if (cached) return { ...cached, meta: { cache: 'HIT' } };

// ... executa SQL ...

reportCache.set(cacheKey, resultado);
return { ...resultado, meta: { cache: 'MISS' } };
```

## Observações

- O SQL é portável entre SQLite e PostgreSQL — não usa funções dependentes de dialeto (diferente do RF40, que usa `strftime`).
- O middleware `errorHandler` mapeia `SequelizeConnectionError` → **HTTP 503**.
- Os campos `totalDescobertas` e `totalAtualizacoes` somam exatamente `totalObservacoes`, pois `versaoObservacao` é sempre `>= 1`.
