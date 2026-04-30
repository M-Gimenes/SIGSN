# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands are run from the `backend/` directory (Claude Code's primary working directory is `backend/` — paths like `src/...` are relative to it):

```bash
# Install dependencies
npm install

# Development (with hot-reload via nodemon)
npm run dev

# Production
npm start

# Regenerate Swagger docs (outputs swagger.json)
npm run swagger
```

Via Docker (from the repo root):

```bash
docker compose up --build   # build and start
docker compose down         # stop and remove containers
```

The API listens on port **3333**. Use `backend/collection.json` (Postman) to test all routes. Swagger UI is served at `/docs`.

## Architecture

SIGSN is an astronomy observatory management system. It manages research groups, researchers, projects, star observations, guide-led caravan visits, and visit scheduling.

**Stack:** Node.js ESM (`"type": "module"`), Express, Sequelize ORM, SQLite (dev/test) or PostgreSQL (prod/staging). The database dialect is switched by editing the exported config in `backend/src/config/database-config.js`.

**Layer structure** (`backend/src/`):

| Layer | Path | Responsibility |
|-------|------|----------------|
| Entry point | `server.js` | Express app, mounts routes |
| Routes | `routes.js` | Maps HTTP verbs to controller methods (CRUD pattern) |
| Controllers | `controllers/` | Receives `req`/`res`, delegates to service, passes errors to `next` |
| Services | `services/` | Business logic, DB queries via Sequelize models |
| Models | `models/` | Sequelize model definitions + associations |
| Config | `config/database-config.js` | DB dialect config (swap to change environment) |
| Connection | `config/database-connection.js` | Instantiates Sequelize, calls `Model.init()` + `Model.associate()`, syncs DB with `force: true` on start, and seeds initial data |
| Utils | `utils/agendamentoTurno.js` | Shift (turno) logic used by `AgendamentoService` |
| Utils | `utils/errors.js` + `utils/validate.js` | `ValidationError` class and `validarCampos(Model, dados)` helper |
| Middleware | `_middleware/errorHandler.js` | Maps `ValidationError`, Sequelize errors → HTTP 400; others → 500 |

**Important: `sync({ force: true })` drops and recreates all tables on every server start.** The seed data in `database-connection.js` repopulates them each time.

**Domain model relationships:**

- `Pessoa` is an abstract base class (no table). `Coordenador`, `Pesquisador`, and `Guia` extend it via `Pessoa.atributosBase()`. This includes `login` (unique) and `senha` — do not redeclare these in subclasses.
- `GrupoDePesquisa` ↔ `Pesquisador`: many-to-many through the `grupo_pesquisador` join table.
- `Projeto` belongs to `GrupoDePesquisa` and `Coordenador`; has many `Observacao`.
- `Observacao` belongs to `Projeto` and `Constelacao`.
- `Agendamento` belongs to `Guia` and `Caravana` only — there is **no** `coordenadorId` on Agendamento.

**Business rules by entity:**

*Agendamento* (enforced in `AgendamentoService`):
- Guia must exist and have `disponibilidade` (MANHA/TARDE/NOITE) matching the shift of `dataVisita`.
- Max **3 agendamentos** per day per shift (Manhã: 06–12 h, Tarde: 12–18 h, Noite: 18–06 h).

*Observacao* (enforced in `ObservacaoService`):
- `constelacaoId` is mandatory (explicit business rule, not just a model constraint).
- Max **2 observações** per day for the same `projetoId` + `constelacaoId` combination.
- `versaoObservacao` is **auto-assigned** (sequential per projeto+constelação pair) — never send it in the request body.

*Projeto* (enforced in `ProjetoService`):
- Max **10 projetos** with `status = 'ativo'` simultaneously across the whole system.
- A single `Coordenador` can be responsible for at most **2 active projects** at a time.

**Adding a new entity** follows this pattern:
1. Create `models/EntityName.js` with `static init(sequelize)` and `static associate(models)`.
2. Register it in `config/database-connection.js` (import, call `init`, call `associate`, add seed data if needed).
3. Create `services/EntityNameService.js` with `findAll`, `findByPk`, `create`, `update`, `delete`. Use `validarCampos(Model, dados)` before create/update; throw `new ValidationError(erros)` on failure.
4. Create `controllers/EntityNameController.js` delegating to the service.
5. Add routes to `routes.js`.

**Active routes (all CRUD):** `/agendamentos`, `/caravanas`, `/constelacoes`, `/coordenadores`, `/grupos-de-pesquisa`, `/guias`, `/observacoes`, `/pesquisadores`, `/projetos`.

**Gotchas:**
- `PessoaController.js` exists in `controllers/` but is **not registered** in `routes.js` — it returns 501 for all methods. Use `CoordenadorController`, `PesquisadorController`, or `GuiaController` instead.
- `Guia.disponibilidade` must be exactly `'MANHA'`, `'TARDE'`, or `'NOITE'` (uppercase, without accent) — it must match the shift computed from `dataVisita` when creating an `Agendamento`.
- `Caravana.tipoCaravana` must be one of: `'Escolar'`, `'Universitária'`, `'Turística'`, `'Institucional'`.
- `Caravana.quantidadeVisitantes` is capped at 50.
- All service write operations (create/update) wrap logic in `sequelize.transaction(async (transaction) => { ... })` — pass `{ transaction }` to every Sequelize call inside.
- `underscored: true` is set globally: DB columns are `snake_case`, JS model attributes are `camelCase`. Sequelize maps them automatically; use camelCase in code.
- Active DB dialect is **SQLite** (`database.sqlite` file, dev default). To switch to PostgreSQL, uncomment the second block in `backend/src/config/database-config.js`.
- CORS is open (`cors()` with no restrictions) — the frontend can call the API from any local origin/port.

**Frontend** (all paths relative to `backend/`):
- `../frontend/SIGSN.html` — main CRUD frontend; serves all 9 entity routes against the API on port 3333.
- `../frontend/Identidade Visual SIGSN.html` — brand identity guide (standalone, no backend needed).
- `../frontend/deck-stage.js` — `<deck-stage>` web component for HTML presentation decks (keyboard nav, print-to-PDF).
- `../frontend/apresentacao/` — 20-slide presentation deck (`index.html` + `styles.css`); references `../deck-stage.js`.

**Visual identity tokens** (use for any new UI work):
- Colors: `--ink #1a2547` · `--paper #f4efe4` · `--ember #b8542b` · `--gold #c9a04a` · `--verdigris #516b5d`
- Fonts: Cormorant Garamond (headings/display) · Newsreader (body) · JetBrains Mono (data/code/labels)
- Aesthetic: parchment + indigo ink (not dark dashboard); `MANHA/TARDE/NOITE` map to gold/ember/verdigris pills.
