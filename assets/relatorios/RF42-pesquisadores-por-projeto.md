# RF42 — Pesquisadores por Projeto

`GET /relatorios/pesquisadores-por-projeto`

Lista pesquisadores que participam dos projetos (via grupo de pesquisa), opcionalmente restringindo a um projeto específico e/ou janela de data de ingresso. Apresenta também totais por grupo de pesquisa (`COUNT` em memória).

## Filtros aceitos (`req.query`)

| Parâmetro     | Tipo    | Default | Restrição                                                          |
|---------------|---------|---------|---------------------------------------------------------------------|
| `projetoId`   | inteiro | —       | `> 0`. Filtra `WHERE projeto.id = ?`.                              |
| `dataInicial` | string  | —       | `YYYY-MM-DD`. Aplicada sobre `pesquisador.createdAt` (ingresso).   |
| `dataFinal`   | string  | —       | `YYYY-MM-DD`. Idem.                                                |
| `page`        | inteiro | `1`     | `>= 1`.                                                            |
| `pageSize`    | inteiro | `50`    | `1 .. 500`.                                                        |

Validação em `parseFiltrosPesquisadoresPorProjeto`:

```js
export function parseFiltrosPesquisadoresPorProjeto(query) {
  const erros = [];
  const out = {
    projetoId:   parseId(query.projetoId, 'projetoId', erros),
    dataInicial: parseDate(query.dataInicial, 'dataInicial', erros),
    dataFinal:   parseDate(query.dataFinal,   'dataFinal',   erros),
    ...parsePagination(query, erros),
  };
  validarOrdemDeDatas(out.dataInicial, out.dataFinal, erros);
  finalize(erros);
  return out;
}
```

## Execução

Consulta puramente ORM com `include` aninhado **e** `required: true` para forçar `INNER JOIN`. A paginação é aplicada **em memória**, não no SQL (ver justificativa abaixo).

```js
const whereProjeto = projetoId ? { id: projetoId } : {};

const projetos = await Projeto.findAll({
  where: whereProjeto,
  include: [
    {
      model: GrupoDePesquisa,
      as: 'grupoDePesquisa',
      required: true,
      include: [
        {
          model: Pesquisador,
          as: 'pesquisadores',
          required: true,
          through: { attributes: [] },
          where: { ...rangeDate('createdAt', dataInicial, dataFinal) },
        },
      ],
    },
  ],
  order: [
    [{ model: GrupoDePesquisa, as: 'grupoDePesquisa' }, 'nome', 'ASC'],
    [
      { model: GrupoDePesquisa, as: 'grupoDePesquisa' },
      { model: Pesquisador, as: 'pesquisadores' },
      'nome',
      'ASC',
    ],
  ],
});
```

### SQL equivalente (aproximado)

```sql
SELECT p.*, g.*, pesq.*
FROM   projetos p
JOIN   grupos_de_pesquisa g  ON g.id = p.grupo_de_pesquisa_id      -- required → INNER
JOIN   grupo_pesquisador gp  ON gp.grupo_de_pesquisa_id = g.id
JOIN   pesquisadores pesq    ON pesq.id = gp.pesquisador_id        -- required → INNER
WHERE  p.id = :projetoId
  AND  pesq.created_at >= :dataInicial
  AND  pesq.created_at <= :dataFinal
ORDER  BY g.nome ASC, pesq.nome ASC;
```

### Por que paginar em memória?

Quando uma associação `M:N` é incluída com `where` e `required: true`, o Sequelize não consegue traduzir `LIMIT/OFFSET` corretamente para a entidade raiz e suas associações ao mesmo tempo — `LIMIT` aplicado no SQL cortaria pesquisadores associados aos primeiros N projetos, não os primeiros N pesquisadores. A solução adotada é:

1. Carregar **todos** os projetos+grupos+pesquisadores que satisfazem os filtros.
2. Achatar para `todasLinhas`.
3. Aplicar `slice` da página.

```js
const todasLinhas = [];
const contagemPorGrupo = new Map();
for (const p of projetos) {
  const grupo = p.grupoDePesquisa;
  if (!grupo) continue;
  for (const pesq of grupo.pesquisadores) {
    todasLinhas.push({
      nomeGrupo: grupo.nome,
      projetoVinculado: p.titulo,
      nomePesquisador: pesq.nome,
      curso: pesq.especialidade,
      dataIngresso: pesq.createdAt,
      status: pesq.status,
    });
    const chave = grupo.nome;
    contagemPorGrupo.set(chave, (contagemPorGrupo.get(chave) ?? 0) + 1);
  }
}

const inicio = (page - 1) * pageSize;
const linhas = todasLinhas.slice(inicio, inicio + pageSize);
```

Como o domínio tem volumetria controlada (poucos projetos × poucos pesquisadores por grupo), o custo de carregar tudo é aceitável.

## Totais por grupo

`contagemPorGrupo` é um `Map<nomeGrupo, total>` montado dentro do mesmo `for`. Em seguida é convertido em array ordenado por nome:

```js
const totaisPorGrupo = Array.from(contagemPorGrupo.entries())
  .map(([grupo, total]) => ({ grupo, totalPesquisadores: total }))
  .sort((a, b) => a.grupo.localeCompare(b.grupo));
```

## Variáveis chave no método

| Variável             | Origem                                       | Uso                                                  |
|----------------------|----------------------------------------------|-------------------------------------------------------|
| `filtros`            | `parseFiltrosPesquisadoresPorProjeto`        | Validados.                                            |
| `whereProjeto`       | `projetoId ? { id: projetoId } : {}`         | Filtro raiz sobre `Projeto`.                          |
| `projetos`           | `Projeto.findAll`                            | Árvore completa.                                      |
| `todasLinhas`        | Loop aninhado                                | Universo achatado (base para paginação e totais).     |
| `contagemPorGrupo`   | `Map`                                        | Contador por grupo.                                   |
| `linhas`             | `todasLinhas.slice(...)`                     | Página atual.                                         |
| `totaisPorGrupo`     | array derivado do `Map`                      | Lista ordenada de totais.                             |

## Resposta

```jsonc
{
  "filtros": { "projetoId": 1, "dataInicial": null, "dataFinal": null },
  "paginacao": { "page": 1, "pageSize": 50, "totalLinhas": 9, "totalPaginas": 1 },
  "linhas": [
    {
      "nomeGrupo": "Grupo Draco",
      "projetoVinculado": "Projeto Altair",
      "nomePesquisador": "Pesquisador 3",
      "curso": "Mecânica Celeste",
      "dataIngresso": "2026-05-14T17:00:09.715Z",
      "status": true
    }
  ],
  "totaisPorGrupo": [
    { "grupo": "Grupo Draco",   "totalPesquisadores": 3 },
    { "grupo": "Grupo Lyra",    "totalPesquisadores": 3 },
    { "grupo": "Grupo Orion",   "totalPesquisadores": 2 },
    { "grupo": "Grupo Pegasus", "totalPesquisadores": 1 }
  ],
  "totais": { "totalPesquisadores": 9, "totalGrupos": 4 }
}
```

`totalPesquisadores` reflete o **universo**, não a página; `totalGrupos` é `contagemPorGrupo.size`.

## Cache

**Não usa cache** — o relatório é paginado.

## Observações

- Como o `Pesquisador` está incluído com `required: true`, projetos cujo grupo não tenha nenhum pesquisador dentro da janela `[dataInicial, dataFinal]` são **excluídos** do resultado.
- `pesq.especialidade` é mapeado para o campo `curso` no JSON — o campo do modelo se chama `especialidade`, mas a UI exibe como "Curso".
- `dataIngresso` é o `createdAt` do pesquisador, não uma coluna explícita de ingresso no projeto/grupo (a tabela de junção `grupo_pesquisador` não armazena timestamp).
