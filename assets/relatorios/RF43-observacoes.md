# RF43 — Listar Observações

`GET /relatorios/observacoes`

Lista observações astronômicas registradas, classificando cada linha como **Descoberta** (`versaoObservacao = 1`) ou **Atualização** (`versaoObservacao > 1`). Retorna a página solicitada e totais agregados sobre o universo completo.

## Filtros aceitos (`req.query`)

| Parâmetro       | Tipo    | Default | Restrição                                                       |
|-----------------|---------|---------|------------------------------------------------------------------|
| `dataInicial`   | string  | —       | `YYYY-MM-DD`. Compara contra `observacao.data_observacao` (`DATE`). |
| `dataFinal`     | string  | —       | `YYYY-MM-DD`. Idem.                                              |
| `projetoId`     | inteiro | —       | `> 0`.                                                           |
| `constelacaoId` | inteiro | —       | `> 0`.                                                           |
| `page`          | inteiro | `1`     | `>= 1`.                                                          |
| `pageSize`      | inteiro | `50`    | `1 .. 500`.                                                      |

Validação em `parseFiltrosObservacoes`:

```js
export function parseFiltrosObservacoes(query) {
  const erros = [];
  const out = {
    dataInicial:   parseDate(query.dataInicial, 'dataInicial', erros),
    dataFinal:     parseDate(query.dataFinal,   'dataFinal',   erros),
    projetoId:     parseId(query.projetoId,     'projetoId',     erros),
    constelacaoId: parseId(query.constelacaoId, 'constelacaoId', erros),
    ...parsePagination(query, erros),
  };
  validarOrdemDeDatas(out.dataInicial, out.dataFinal, erros);
  finalize(erros);
  return out;
}
```

## Execução

Três queries Sequelize disparadas em paralelo (`Promise.all`), com **a mesma cláusula `where`**:

```js
const where = {
  ...rangeDate('dataObservacao', dataInicial, dataFinal),
  ...(projetoId ? { projetoId } : {}),
  ...(constelacaoId ? { constelacaoId } : {}),
};

const [linhas, agg, totalLinhasUniverso] = await Promise.all([
  // 1) Página de linhas com Projeto (e Coordenador) e Constelação
  Observacao.findAll({
    where,
    include: [
      { model: Projeto, as: 'projeto', include: [{ model: Coordenador, as: 'coordenador' }] },
      { model: Constelacao, as: 'constelacao' },
    ],
    order: [['dataObservacao', 'ASC']],
    limit: pageSize,
    offset: (page - 1) * pageSize,
  }),

  // 2) Agregações: total, descobertas, atualizações
  Observacao.findAll({
    where,
    attributes: [
      [fn('COUNT', col('id')),                                                  'totalObservacoes'],
      [fn('SUM',   literal('CASE WHEN versao_observacao = 1 THEN 1 ELSE 0 END')), 'totalDescobertas'],
      [fn('SUM',   literal('CASE WHEN versao_observacao > 1 THEN 1 ELSE 0 END')), 'totalAtualizacoes'],
    ],
    raw: true,
  }).then((r) => r[0]),

  // 3) Total bruto para paginação
  Observacao.count({ where }),
]);
```

### SQL equivalente (aproximado)

```sql
-- (1) Página
SELECT o.*, p.*, p_coord.*, c.*
FROM   observacoes o
LEFT   JOIN projetos     p       ON p.id = o.projeto_id
LEFT   JOIN coordenadores p_coord ON p_coord.id = p.coordenador_id
LEFT   JOIN constelacoes c       ON c.id = o.constelacao_id
WHERE  o.data_observacao >= :dataInicial
  AND  o.data_observacao <= :dataFinal
  AND  o.projeto_id     = :projetoId
  AND  o.constelacao_id = :constelacaoId
ORDER BY o.data_observacao ASC
LIMIT :pageSize OFFSET ((:page - 1) * :pageSize);

-- (2) Agregações
SELECT COUNT(id)                                              AS totalObservacoes,
       SUM(CASE WHEN versao_observacao = 1 THEN 1 ELSE 0 END) AS totalDescobertas,
       SUM(CASE WHEN versao_observacao > 1 THEN 1 ELSE 0 END) AS totalAtualizacoes
FROM   observacoes
WHERE  ... mesmos filtros ...;

-- (3) Contagem para paginação
SELECT COUNT(*) FROM observacoes WHERE ...;
```

### A expressão `CASE` dentro de `SUM`

A semântica de Descoberta vs Atualização é regra de negócio:

- `versaoObservacao = 1` → primeira versão criada para o par (projetoId, constelacaoId) → **Descoberta**.
- `versaoObservacao > 1` → versões subsequentes → **Atualização**.

`SUM(CASE WHEN ... THEN 1 ELSE 0 END)` é um padrão SQL para contar condicionalmente sem dois `SELECT`s separados. O `literal(...)` é usado porque essa expressão não tem um equivalente direto na API de funções do Sequelize.

## Variáveis chave no método

| Variável               | Origem                                      | Uso                                                  |
|------------------------|---------------------------------------------|-------------------------------------------------------|
| `filtros`              | `parseFiltrosObservacoes(req.query)`        | Validados.                                            |
| `where`                | `rangeDate` + projetoId + constelacaoId     | Aplicada nas três queries.                            |
| `linhas`               | `Observacao.findAll` (1ª)                   | Página atual.                                         |
| `agg`                  | `findAll` agregado (2ª)                     | `{ totalObservacoes, totalDescobertas, totalAtualizacoes }`. |
| `totalLinhasUniverso`  | `Observacao.count` (3ª)                     | Base para `paginar(...)`.                             |

## Resposta

```jsonc
{
  "filtros": { "dataInicial": null, "dataFinal": null, "projetoId": null, "constelacaoId": null },
  "paginacao": { "page": 1, "pageSize": 50, "totalLinhas": 5, "totalPaginas": 1 },
  "linhas": [
    {
      "dataObservacao": "2025-09-10",
      "projetoVinculado": "Projeto Aster",
      "coordenadorResponsavel": "Coordenador 1",
      "constelacao": "Orion",
      "instrumento": "Telescópio refrator 120mm",
      "versao": 1,
      "tipoRegistro": "Descoberta"          // derivado: versao === 1 ? 'Descoberta' : 'Atualização'
    }
  ],
  "totais": { "totalObservacoes": 5, "totalDescobertas": 4, "totalAtualizacoes": 1 }
}
```

A coluna `tipoRegistro` é calculada em JS:

```js
tipoRegistro: o.versaoObservacao === 1 ? 'Descoberta' : 'Atualização',
```

## Cache

**Não usa cache** — paginado.

## Observações

- A ordenação é fixa em `dataObservacao ASC`.
- A relação `Observacao → Projeto → Coordenador` é trazida em um único `JOIN` aninhado para evitar N+1.
- Note que `total = descobertas + atualizacoes` apenas se todas as observações tiverem `versaoObservacao >= 1`. Como `versaoObservacao` é gerado automaticamente pelo `ObservacaoService` (sequência por projeto+constelação, começando em 1), essa invariante se mantém.
