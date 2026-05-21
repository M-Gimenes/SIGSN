# RF41 — Listar Projetos por Grupo, Status e Data

`GET /relatorios/projetos`

Lista os projetos do sistema, opcionalmente filtrados por grupo de pesquisa, status e janela de data de início. Para cada projeto traz o grupo responsável, o coordenador e a quantidade de pesquisadores vinculados ao grupo. Inclui também totais agregados em JS (não em SQL).

## Filtros aceitos (`req.query`)

| Parâmetro             | Tipo    | Default | Restrição                                                       |
|-----------------------|---------|---------|------------------------------------------------------------------|
| `dataInicial`         | string  | —       | `YYYY-MM-DD`. Compara contra `projeto.data_inicio` (campo `DATE`).|
| `dataFinal`           | string  | —       | `YYYY-MM-DD`. Idem.                                              |
| `grupoDePesquisaId`   | inteiro | —       | `> 0`.                                                           |
| `status`              | string  | —       | Um de: `ativo`, `concluido`, `suspenso`.                         |

Sem paginação — o volume de projetos é pequeno e há uma regra de negócio limitando a no máximo **10 projetos ativos** simultâneos no sistema (`ProjetoService`).

Validação em `parseFiltrosProjetos`:

```js
export function parseFiltrosProjetos(query) {
  const erros = [];
  const out = {
    dataInicial:       parseDate(query.dataInicial, 'dataInicial', erros),
    dataFinal:         parseDate(query.dataFinal,   'dataFinal',   erros),
    grupoDePesquisaId: parseId(query.grupoDePesquisaId, 'grupoDePesquisaId', erros),
    status:            parseEnum(query.status, 'status', ['ativo', 'concluido', 'suspenso'], erros),
  };
  validarOrdemDeDatas(out.dataInicial, out.dataFinal, erros);
  finalize(erros);
  return out;
}
```

## Execução

Consulta puramente ORM. Apenas **um** `findAll` com `include` aninhado:

```js
const where = {
  ...rangeDate('dataInicio', dataInicial, dataFinal),
  ...(grupoDePesquisaId ? { grupoDePesquisaId } : {}),
  ...(status ? { status } : {}),
};

const projetos = await Projeto.findAll({
  where,
  include: [
    {
      model: GrupoDePesquisa,
      as: 'grupoDePesquisa',
      include: [
        { model: Pesquisador, as: 'pesquisadores', attributes: ['id'], through: { attributes: [] } },
      ],
    },
    { model: Coordenador, as: 'coordenador' },
  ],
  order: [[{ model: GrupoDePesquisa, as: 'grupoDePesquisa' }, 'nome', 'ASC']],
});
```

### O que `include` está fazendo

| Include                                | Cardinalidade | Propósito                                                                  |
|----------------------------------------|---------------|----------------------------------------------------------------------------|
| `Projeto → GrupoDePesquisa`            | N:1           | Trazer `nomeGrupo`.                                                        |
| `GrupoDePesquisa → Pesquisador` (M:N)  | M:N           | Trazer **apenas os IDs** dos pesquisadores para calcular `qtdPesquisadores`. |
| `Projeto → Coordenador`                | N:1           | Trazer `responsavel` (nome do coordenador).                                |

- `attributes: ['id']` em `Pesquisador` evita carregar colunas inúteis — só precisamos do `COUNT` via `.length`.
- `through: { attributes: [] }` suprime os campos da tabela de junção `grupo_pesquisador`.

### SQL equivalente (aproximado)

```sql
SELECT p.*, g.id AS "grupoDePesquisa.id", g.nome AS "grupoDePesquisa.nome", ...,
       pesq.id  AS "grupoDePesquisa.pesquisadores.id",
       c.*
FROM   projetos p
LEFT   JOIN grupos_de_pesquisa g ON g.id = p.grupo_de_pesquisa_id
LEFT   JOIN grupo_pesquisador gp ON gp.grupo_de_pesquisa_id = g.id
LEFT   JOIN pesquisadores pesq  ON pesq.id = gp.pesquisador_id
LEFT   JOIN coordenadores c     ON c.id = p.coordenador_id
WHERE  p.data_inicio >= :dataInicial
  AND  p.data_inicio <= :dataFinal
  AND  p.grupo_de_pesquisa_id = :grupoDePesquisaId
  AND  p.status = :status
ORDER  BY g.nome ASC;
```

A contagem de pesquisadores é feita **em memória**, não via `COUNT(*)`:

```js
qtdPesquisadores: p.grupoDePesquisa?.pesquisadores?.length ?? 0,
```

## Totais

Calculados em JS após o `findAll`:

```js
totais: {
  totalProjetos: linhas.length,
  totalPesquisadores: linhas.reduce((s, l) => s + l.qtdPesquisadores, 0),
},
```

`totalPesquisadores` é a **soma das contagens por projeto** — ou seja, um pesquisador que participa de dois projetos será contado duas vezes. Isto é intencional: o totalizador reflete "pesquisadores envolvidos em projetos listados", não pesquisadores distintos.

## Variáveis chave no método

| Variável             | Origem                                | Uso                                                  |
|----------------------|---------------------------------------|-------------------------------------------------------|
| `filtros`            | `parseFiltrosProjetos(req.query)`     | Validados.                                            |
| `where`              | `rangeDate` + IDs/status              | Filtro sobre `Projeto`.                               |
| `projetos`           | `Projeto.findAll`                     | Lista com associações.                                |
| `linhas`             | `projetos.map(...)`                   | Projeção plana para o JSON.                           |

## Resposta

```jsonc
{
  "filtros": { "status": "ativo" },
  "linhas": [
    {
      "dataInicio": "2025-09-15",
      "projeto": "Projeto Altair",
      "responsavel": "Coordenador 2",
      "nomeGrupo": "Grupo Draco",
      "area": "Fotometria diferencial",
      "qtdPesquisadores": 1,
      "status": "ativo"
    }
  ],
  "totais": { "totalProjetos": 10, "totalPesquisadores": 10 }
}
```

## Cache

**Não usa cache.** Listas curtas, sem paginação, e o `findAll` com `include` é barato neste domínio.

## Observações

- A ordenação é por `grupoDePesquisa.nome ASC`. Projetos sem grupo (caso ocorra) iriam para o final.
- O `?.` em `p.coordenador?.nome` protege contra projetos sem coordenador definido (situação rara — o relacionamento é geralmente obrigatório).
- Filtros de data se aplicam a `dataInicio`, não a `createdAt` — refletem a janela de início real do projeto.
