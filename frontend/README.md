# SIGSN — Frontend (React)

Frontend do Sistema de Gestão do Observatório Sidereus Nuncius. SPA construída em React + Vite que consome a API REST exposta pelo backend em `:3333`.

## Stack

- React 18 + Vite
- React Router 6
- CSS modular preservando a identidade visual (paleta indigo + paper, tipografia Cormorant/Newsreader/JetBrains Mono)
- Nginx para servir a build em produção
- Docker / docker-compose para subir junto com o backend

## Variáveis de ambiente

`VITE_API_URL` — URL base do backend. Default: `http://localhost:3333`.

Copie `.env.example` para `.env` e ajuste se necessário.

## Desenvolvimento

```bash
npm install
npm run dev
```

A aplicação fica disponível em `http://localhost:5173`. O backend precisa estar rodando em `:3333` (ver `backend/`).

## Build de produção

```bash
npm run build
npm run preview
```

## Docker

A partir da raiz do repositório:

```bash
docker compose up --build
```

Sobe backend (`:3333`) + frontend (`:5173`).

## Estrutura

```
src/
├── api/           # client HTTP + funções de serviços
├── components/    # layout, ui, forms, reports
├── config/        # configuração declarativa das entidades e relatórios
├── context/       # ThemeContext, ToastContext
├── hooks/         # hooks reutilizáveis
├── pages/         # HomePage, EntityPage, ReportPage
├── styles/        # CSS global
├── utils/         # formatação, escape
├── App.jsx        # provider + router shell
└── main.jsx       # entrypoint
```

## Funcionalidades cobertas

CRUD completo para todas as 9 entidades do backend (Agendamentos, Caravanas, Constelações, Coordenadores, Grupos de Pesquisa, Guias, Observações, Pesquisadores, Projetos) e os 6 relatórios (RF39–RF44).
