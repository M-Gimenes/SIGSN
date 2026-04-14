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
- `Agendamento` belongs to `Guia`, `Coordenador`, and `Caravana` (one-to-one with Caravana).

**Scheduling business rules** (enforced in `AgendamentoService`):

- A `dataVisita` timestamp must be unique (no two bookings at the same exact date+time).
- Max **3 agendamentos** per day per shift (Manhã: 06–12 h, Tarde: 12–18 h, Noite: 18–06 h).

**Adding a new entity** follows this pattern:
1. Create `models/EntityName.js` with `static init(sequelize)` and `static associate(models)`.
2. Register it in `config/database-connection.js` (import, call `init`, call `associate`, add seed data if needed).
3. Create `services/EntityNameService.js` with `findAll`, `findByPk`, `create`, `update`, `delete`. Use `validarCampos(Model, dados)` before create/update; throw `new ValidationError(erros)` on failure.
4. Create `controllers/EntityNameController.js` delegating to the service.
5. Add routes to `routes.js`.

**Active routes (all CRUD):** `/agendamentos`, `/caravanas`, `/constelacoes`, `/coordenadores`, `/grupos-de-pesquisa`, `/guias`, `/observacoes`, `/pesquisadores`, `/projetos`.

**Frontend:** `../frontend/SIGSN.html` — single-file static frontend (path relative to `backend/`).
