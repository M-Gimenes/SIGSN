# RF39 — Listar Agendamentos

`GET /relatorios/agendamentos`

Lista agendamentos de visitas de caravanas dentro de uma janela de datas, opcionalmente filtrando por tipo de caravana e/ou guia responsável. Retorna a página solicitada **e** três agregações calculadas sobre o universo completo (não apenas a página).

## Filtros aceitos (`req.query`)

| Parâmetro      | Tipo    | Default | Restrição                                                                 |
|----------------|---------|---------|---------------------------------------------------------------------------|
| `dataInicial`  | string  | —       | `YYYY-MM-DD`. Comparada como `dataVisita >= "<data> 00:00:00"`.           |
| `dataFinal`    | string  | —       | `YYYY-MM-DD`. Comparada como `dataVisita <= "<data> 23:59:59"`.           |
| `tipoVisita`   | string  | —       | Um de: `Escolar`, `Universitária`, `Turística`, `Institucional`.          |
| `guiaId`       | inteiro | —       | `> 0`. Filtra por `agendamento.guia_id`.                                  |
| `page`         | inteiro | `1`     | `>= 1`.                                                                   |
| `pageSize`     | inteiro | `50`    | `1 .. 500`.                                                               |

Validação centralizada em `parseFiltrosAgendamentos` (`backend/src/utils/reportFilters.js`):

```js
export function parseFiltrosAgendamentos(query) {
  const erros = [];
  const out = {
    dataInicial: parseDate(query.dataInicial, 'dataInicial', erros),
    dataFinal:   parseDate(query.dataFinal,   'dataFinal',   erros),
    tipoVisita:  parseEnum(query.tipoVisita, 'tipoVisita', TIPOS_CARAVANA, erros),
    guiaId:      parseId(query.guiaId, 'guiaId', erros),
    ...parsePagination(query, erros),
  };
  validarOrdemDeDatas(out.dataInicial, out.dataFinal, erros);
  finalize(erros);
  return out;
}
```

Quaisquer erros são acumulados em `erros[]` e lançados como `ValidationError`, que o middleware `errorHandler.js` traduz para **HTTP 400**.

## Execução

Não há SQL bruto — a consulta é construída inteiramente pelo Sequelize. São disparadas **três queries em paralelo** com `Promise.all`:

1. **Página de linhas** — `Agendamento.findAll` com `include` de `Caravana` e `Guia`, `ORDER BY dataVisita ASC`, `LIMIT/OFFSET` a partir de `page`/`pageSize`.
2. **Agregações** — outro `findAll` no mesmo `where`, sem retornar linhas, apenas três colunas agregadas (ver abaixo).
3. **Contagem distinta** — `Agendamento.count` com `distinct: true, col: 'id'` para obter o `totalLinhas` do universo completo (necessário porque `caravanaWhere` é um `INNER JOIN`).

```js
const where = {
  ...rangeDateTime('dataVisita', dataInicial, dataFinal),
  ...(guiaId ? { guiaId } : {}),
};
const caravanaWhere = tipoVisita ? { tipoCaravana: tipoVisita } : undefined;

const [linhas, agg, totalLinhasUniverso] = await Promise.all([
  Agendamento.findAll({
    where,
    include: [
      { model: Caravana, as: 'caravana', required: !!caravanaWhere, where: caravanaWhere },
      { model: Guia, as: 'guia' },
    ],
    order: [['dataVisita', 'ASC']],
    limit: pageSize,
    offset: (page - 1) * pageSize,
  }),
  Agendamento.findAll({
    where,
    include: [{ model: Caravana, as: 'caravana', attributes: [], required: true, where: caravanaWhere }],
    attributes: [
      [fn('COUNT', col('agendamento.id')),              'totalAgendamentos'],
      [fn('SUM',   col('caravana.quantidade_visitantes')), 'totalVisitantes'],
      [fn('SUM',   col('valor_visita')),                'totalValor'],
    ],
    raw: true,
  }).then((r) => r[0]),
  Agendamento.count({
    where,
    include: caravanaWhere
      ? [{ model: Caravana, as: 'caravana', attributes: [], required: true, where: caravanaWhere }]
      : [],
    distinct: true,
    col: 'id',
  }),
]);
```

### SQL equivalente (aproximado)

```sql
-- (1) Página de linhas
SELECT a.*, c.*, g.*
FROM   agendamentos a
JOIN   caravanas c ON c.id = a.caravana_id        -- INNER se tipoVisita; LEFT caso contrário
LEFT   JOIN guias  g ON g.id = a.guia_id
WHERE  a.data_visita >= :dataInicial
  AND  a.data_visita <= :dataFinal
  AND  a.guia_id     = :guiaId                    -- opcional
  AND  c.tipo_caravana = :tipoVisita              -- opcional
ORDER BY a.data_visita ASC
LIMIT  :pageSize OFFSET ((:page - 1) * :pageSize);

-- (2) Agregações sobre o mesmo universo
SELECT COUNT(a.id)                       AS totalAgendamentos,
       SUM(c.quantidade_visitantes)      AS totalVisitantes,
       SUM(a.valor_visita)               AS totalValor
FROM   agendamentos a
JOIN   caravanas c ON c.id = a.caravana_id
WHERE  ... mesmos filtros ...;

-- (3) Contagem distinta de IDs
SELECT COUNT(DISTINCT a.id) FROM agendamentos a [JOIN caravanas ...] WHERE ...;
```

### Por que três queries?

- A página retorna apenas `pageSize` linhas. Para totalizar **todo** o intervalo filtrado (não só a página atual), as agregações precisam de uma query separada com o mesmo `where`.
- `count` é separado de `findAll` porque com `include + required` o Sequelize pode duplicar linhas; `distinct: true, col: 'id'` resolve isso.

## Variáveis chave no método

| Variável                | Origem                                            | Uso                                                                   |
|-------------------------|---------------------------------------------------|-----------------------------------------------------------------------|
| `filtros`               | `parseFiltrosAgendamentos(req.query)`             | Dicionário validado e normalizado.                                    |
| `where`                 | `rangeDateTime` + `guiaId`                        | Filtro principal aplicado a `Agendamento`.                            |
| `caravanaWhere`         | `tipoVisita ? { tipoCaravana } : undefined`       | Quando presente, transforma o `JOIN` em `INNER` (`required: true`).   |
| `linhas`                | `Agendamento.findAll`                             | Página atual.                                                         |
| `agg`                   | `findAll` com `attributes` agregados              | `{ totalAgendamentos, totalVisitantes, totalValor }`.                 |
| `totalLinhasUniverso`   | `Agendamento.count({ distinct: true })`           | Base para `paginar(...)`.                                             |

## Resposta

```jsonc
{
  "filtros":  { "dataInicial": "...", "dataFinal": "...", "tipoVisita": "...", "guiaId": 1 },
  "paginacao": { "page": 1, "pageSize": 50, "totalLinhas": 4, "totalPaginas": 1 },
  "linhas": [
    {
      "id": 1,
      "dataVisita": "2026-04-01T12:00:00.000Z",
      "horario": "09:00",                      // derivado: HH:mm de dataVisita
      "nomeCaravana": "Caravana Aurora",
      "instituicao": "Escola Estadual A",
      "quantidadeVisitantes": 30,
      "guiaResponsavel": "Guia 1",
      "tipoVisita": "Escolar",
      "valorVisita": 300
    }
  ],
  "totais": { "totalAgendamentos": 4, "totalVisitantes": 115, "totalValor": 1530 }
}
```

`horario` é calculado em JS, não no banco:

```js
const d = a.dataVisita instanceof Date ? a.dataVisita : new Date(a.dataVisita);
horario: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
```

## Cache

**Não usa cache.** O relatório é paginado e cada combinação de página/filtro geraria uma chave diferente, o que reduziria a taxa de acerto. Optou-se por executar sempre a query.

## Observações

- A ordenação é fixa em `dataVisita ASC` — não é configurável via query.
- O middleware `errorHandler` mapeia `SequelizeConnectionError` → **HTTP 503**, conforme documentado no Swagger.
