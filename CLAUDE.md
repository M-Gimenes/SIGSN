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

**Stack:** Node.js ESM (`"type": "module"`), Express, Sequelize ORM, SQLite (dev fallback) or PostgreSQL (prod/staging). The database dialect is resolved at runtime from environment variables in `backend/src/config/database-config.js` (priority: `DATABASE_URL` → `PG*` individual vars → SQLite fallback). Production is hosted on Render with managed Postgres. Copy `backend/.env.example` → `backend/.env` for local Postgres; leave it absent to use SQLite.

**Layer structure** (`backend/src/`):

| Layer | Path | Responsibility |
|-------|------|----------------|
| Entry point | `server.js` | Express app, mounts routes |
| Routes | `routes.js` | Maps HTTP verbs to controller methods (CRUD pattern) |
| Controllers | `controllers/` | Receives `req`/`res`, delegates to service, passes errors to `next` |
| Services | `services/` | Business logic, DB queries via Sequelize models |
| Models | `models/` | Sequelize model definitions + associations |
| Config | `config/database-config.js` | DB dialect config (swap to change environment) |
| Connection | `config/database-connection.js` | Instantiates Sequelize, calls `Model.init()` + `Model.associate()`, runs `sequelize.sync()` (non-destructive) on start. `seedDatabase()` exists but is commented out — uncomment locally for SQLite/test data; do not run it against production. |
| Utils | `utils/agendamentoTurno.js` | Shift (turno) logic used by `AgendamentoService` |
| Utils | `utils/errors.js` + `utils/validate.js` | `ValidationError` class and `validarCampos(Model, dados)` helper |
| Middleware | `_middleware/errorHandler.js` | Maps `ValidationError`, Sequelize errors → HTTP 400; others → 500 |

**Important: `sequelize.sync()` is non-destructive** — tables are created if missing but existing data is preserved across restarts. The seed in `database-connection.js` is **opt-in** (commented out).

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
- DB dialect is **resolved by env vars**, not by editing code. Production (Render) sets `DATABASE_URL`. Local with Postgres uses `PG*` vars. No env vars → SQLite at `backend/database.sqlite`.
- `docker-compose.yml` mounts `backend/.env` via `env_file` (marked `required: false`, so missing file is fine).
- CORS is open (`cors()` with no restrictions) — the frontend can call the API from any local origin/port.

**Frontend** (React SPA at `frontend/`):
- Stack: React 18 + Vite + React Router 6, served by Nginx in production. CSS preserves the parchment/indigo identity from the original HTML.
- Entry: `frontend/index.html` → `src/main.jsx` → `App.jsx` (router shell).
- Layers: `api/` (HTTP client + service functions), `config/` (declarative `entities.jsx` + `reports.jsx` driving the generic CRUD/report pages), `components/{layout,ui,forms,reports}`, `context/` (Theme + Toast), `hooks/useFkOptions.js` (cached FK dropdowns), `pages/{HomePage,EntityPage,ReportPage}`.
- API base URL is configurable via `VITE_API_URL` (default `http://localhost:3333`).
- Dev: `cd frontend && npm install && npm run dev` (port 5173). Production: `docker compose up --build` serves frontend on `:5173` (Nginx) + backend on `:3333`.

**Visual identity tokens** (use for any new UI work):
- Colors: `--ink #1a2547` · `--paper #f4efe4` · `--ember #b8542b` · `--gold #c9a04a` · `--verdigris #516b5d`
- Fonts: Cormorant Garamond (headings/display) · Newsreader (body) · JetBrains Mono (data/code/labels)
- Aesthetic: parchment + indigo ink (not dark dashboard); `MANHA/TARDE/NOITE` map to gold/ember/verdigris pills.
