import express from 'express';
import cors from 'cors';
import routes from './routes.js';
import './config/database-connection.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);

app.use((err, _req, res, _next) => {
  console.error(err.message);
  res.status(500).json({ erro: err.message });
});

app.listen(3333, () => console.log('Servidor rodando na porta 3333'));
