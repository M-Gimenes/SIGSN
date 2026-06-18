# SIGSN

Sistema de gestão para um observatório astronômico — controla grupos de pesquisa, pesquisadores, coordenadores, projetos, observações estelares, guias e o agendamento de visitas em caravanas. O escopo do domínio veio do documento de requisitos em `assets/SIGSN-DocumentoDeRequisitos.pdf` e do diagrama de classes em `assets/DiagramaDeClasse.png`.

## Status

| Componente | Estado |
|------------|--------|
| Backend (API REST) | Em produção — hospedado no Render |
| Banco de dados | PostgreSQL gerenciado no Render |
| Frontend web | SPA em React 18 + Vite (`frontend/`); roda em `:5173` |
| Documentação interativa (Swagger) | Disponível em `/docs` |
| Coleção Postman | `backend/collection.json` |

## Acesso

- **API**: <https://sigsn.onrender.com>
- **Swagger UI**: <https://sigsn.onrender.com/docs>

Por se tratar do plano gratuito do Render, a primeira requisição após um período de ociosidade pode demorar alguns segundos enquanto o serviço sobe (*cold start*).

## Stack

- **Runtime**: Node.js (ESM) + Express
- **ORM**: Sequelize
- **Banco**: PostgreSQL em produção; SQLite suportado para desenvolvimento local
- **Documentação**: `swagger-autogen` + `swagger-ui-express`
- **Containerização**: Docker / Docker Compose
- **Deploy**: Render (Web Service + Postgres)

## Domínio

A modelagem traduz o regulamento operacional do observatório em invariantes do código, não apenas em validações de campo. Os pontos centrais:

- `Pessoa` é uma base abstrata (sem tabela própria) reutilizada por `Coordenador`, `Pesquisador` e `Guia` via `Pessoa.atributosBase()`, evitando duplicação dos campos comuns de cadastro.
- `GrupoDePesquisa` ↔ `Pesquisador`: relação muitos-para-muitos por meio da tabela `grupo_pesquisador`.
- `Projeto` pertence a um `GrupoDePesquisa` e a um `Coordenador`; possui muitas `Observacao`.
- `Observacao` pertence a `Projeto` e `Constelacao`.
- `Agendamento` pertence a `Guia` e `Caravana`.

### Regras de negócio aplicadas na camada de serviço

| Entidade | Regras |
|----------|--------|
| `Agendamento` | Disponibilidade do guia (`MANHA`/`TARDE`/`NOITE`) precisa casar com o turno calculado a partir de `dataVisita`. Limite de 3 agendamentos por turno por dia. |
| `Observacao` | `constelacaoId` obrigatório. Máximo de 2 observações por dia para o mesmo par projeto + constelação. `versaoObservacao` é atribuída automaticamente, de forma sequencial por par projeto + constelação. |
| `Projeto` | No máximo 10 projetos com `status = 'ativo'` simultâneos em todo o sistema. Um mesmo coordenador pode responder por no máximo 2 projetos ativos ao mesmo tempo. |
| `Caravana` | `tipoCaravana` restrito a `Escolar`, `Universitária`, `Turística`, `Institucional`. `quantidadeVisitantes` limitada a 50. |

As regras estão expostas no Swagger com exemplos nomeados (`RN 1`, `RN 2`, ...) para cada `POST`, o que ajuda a exercitar tanto o caminho feliz quanto os cenários de erro.

## Arquitetura

O backend é organizado em camadas, com responsabilidades bem definidas:

```
HTTP  →  routes.js  →  Controller  →  Service  →  Model (Sequelize)
                                  ↓
                          errorHandler (mapeia ValidationError / Sequelize → HTTP)
```

| Camada | Responsabilidade |
|--------|------------------|
| `routes.js` | Mapeia verbos HTTP para métodos do controller. Contém anotações `swagger-autogen` que geram `swagger.json`. |
| `controllers/` | Recebem `req`/`res`, delegam ao serviço e repassam erros via `next`. Sem lógica de negócio. |
| `services/` | Concentram regras de negócio, acessam o banco via Sequelize e disparam `ValidationError` quando uma invariante é violada. |
| `models/` | Definições Sequelize: campos, validações declarativas e `associate` para relacionamentos. |
| `utils/validate.js` | `validarCampos(Model, dados)` reaproveita as regras declaradas no model para validar payloads antes da escrita. |
| `utils/errors.js` | Classe `ValidationError` que carrega uma lista de mensagens. |
| `_middleware/errorHandler.js` | Converte `ValidationError` e erros do Sequelize em `400`; demais erros viram `500`. Resposta de erro tem formato único. |

### Consistência transacional

Todas as operações de escrita encapsulam suas etapas em `sequelize.transaction(async (transaction) => { ... })` e propagam `{ transaction }` para cada chamada ORM. Isso garante que regras compostas — como "criar projeto + vincular pesquisadores + verificar limite de projetos ativos" — sejam atômicas: ou todos os efeitos são persistidos, ou nenhum.

### Camada de relatórios

Existem 6 relatórios (`RF39`–`RF44`) com pipeline próprio em `services/ReportService.js`:

- Parsers de filtros dedicados (`utils/reportFilters.js`) validam `req.query` e levantam `ValidationError` (`400`) com mensagens específicas.
- Telemetria estruturada via `withReportLogging('RFxx', filtros, fn)`.
- Cache em memória com TTL de 60 s para os relatórios mais pesados (`RF40`, `RF44`).
- Paginação opcional (`page`, `pageSize`) nos relatórios que retornam linhas detalhadas.

A documentação completa de cada relatório está em [`assets/relatorios/`](./assets/relatorios/README.md).

## Como rodar localmente

Todos os comandos abaixo são executados a partir de `backend/`.

### Com Node

```bash
npm install
npm run dev        # nodemon, hot-reload
npm start          # produção
npm run swagger    # regenera swagger.json a partir das anotações em routes.js
```

### Com Docker

A partir da raiz do repositório:

```bash
docker compose up --build   # constrói e sobe a API
docker compose down         # para e remove os containers
```

A API escuta em `http://localhost:3333`. A UI do Swagger fica em `http://localhost:3333/docs`.

### Configuração do banco

A conexão é resolvida em tempo de execução por variáveis de ambiente (`backend/src/config/database-config.js`), em ordem de prioridade:

1. `DATABASE_URL` — string única no formato `postgres://usuario:senha@host:porta/banco` (padrão usado pelo Render).
2. `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` — variáveis separadas (úteis para Postgres local). `PGSSL=false` desativa SSL.
3. Nenhuma das acima → fallback para SQLite em `backend/database.sqlite`.

Para desenvolvimento local, copie `backend/.env.example` para `backend/.env` e preencha o cenário que quiser. O `.env` está no `.gitignore` e nunca deve ser commitado. No Render, as variáveis são configuradas no painel do serviço.

## Testando a API

- **Swagger**: navegue até `/docs`. Cada endpoint `POST` expõe exemplos válidos e exemplos que disparam cada regra de negócio.
- **Postman**: importe `backend/collection.json` para uma coleção pronta com as rotas principais.

## Frontend

SPA em React 18 + Vite (`frontend/`) que consome a API REST. Estrutura:

- `api/` — cliente HTTP + serviços por entidade/relatório.
- `config/entities.jsx` + `config/reports.jsx` — descrição declarativa (colunas, filtros, formulários) que alimenta o `EntityPage` e o `ReportPage` genéricos.
- `components/{layout,ui,forms,reports}` — modulares e reutilizáveis.
- `context/{Theme,Toast}` — tema claro/escuro persistido e notificações globais.
- `hooks/useFkOptions.js` — cache de opções de chave estrangeira para selects.

Cobre CRUD completo das 9 entidades e os 6 relatórios (RF39–RF44). Identidade visual preservada da versão HTML original (paleta indigo + parchment, tipografia Cormorant/Newsreader/JetBrains Mono).

Para rodar localmente:

```bash
cd frontend
npm install
npm run dev        # :5173
```

A URL da API é configurada por `VITE_API_URL` (default `http://localhost:3333`). Veja `frontend/README.md` para detalhes.

## Como rodar tudo via Docker

A partir da raiz, sobe backend (`:3333`) + frontend (`:5173`) juntos:

```bash
docker compose up --build
```

## Estrutura do repositório

```
backend/         Código do servidor (Express + Sequelize)
frontend/        Frontend React (Vite + Nginx)
assets/          Documento de requisitos, diagramas e docs dos relatórios
docker-compose.yml
```

## Equipe

Projeto desenvolvido para as disciplinas de **Desenvolvimento Web** e **Laboratório de Desenvolvimento de Software**.

- Matheus Gimenes
- Emanuelly Bedim
- Larissa Paganini

## Licença

Ver `backend/LICENSE.md`.
