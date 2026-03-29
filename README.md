# SIGSN

SIGSN é um sistema desenvolvido como trabalho para as disciplinas de **Desenvolvimento Web** e **Laboratório de Desenvolvimento de Software**. O repositório contém um backend em Node.js (Express + Sequelize) e um frontend simples em HTML, além de documentação de requisitos e diagramas na pasta `assets/`.

**Resumo do projeto**
- **Backend:** Node.js + Express + Sequelize (usa SQLite/Postgres conforme configuração). O servidor escuta na porta `3333`.
- **Frontend:** página estática em `frontend/SIGSN.html` (pode ser aberta diretamente no navegador ou servida por um servidor estático).
- **Documentação / diagramas:** `assets/SIGSN-DocumentoDeRequisitos.pdf` e `assets/DiagramaDeClasse.png`.
- **Postman:** existe uma coleção em `backend/collection.json` para testar as rotas.

**Como rodar (Docker)**

Na raiz do projeto execute:

```powershell
docker compose up --build
```

Isso irá construir e iniciar o serviço `backend` definido em `docker-compose.yml`. A API ficará disponível em `http://localhost:3333`.

Para parar e remover os containers:

```powershell
docker compose down
```

**Arquivos relevantes**
- `backend/` : código do servidor (Express + Sequelize). Veja `backend/package.json` e `backend/src/server.js`.
- `frontend/SIGSN.html` : interface estática para teste.
- `assets/SIGSN-DocumentoDeRequisitos.pdf` : documento de requisitos do projeto.
- `assets/DiagramaDeClasse.png` : diagrama de classes do sistema.
- `backend/collection.json` : coleção Postman para testar a API.

**Notas sobre desenvolvimento**
- O backend utiliza `nodemon` para desenvolvimento (`npm run dev`).
- A porta padrão do servidor é `3333` (mapeada no `docker-compose.yml`).

**Licença e referências**
- Ver `backend/LICENSE.md` para informações sobre licença (o backend original usa MIT).
