import express from 'express';
import cors from 'cors';
import { existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import swaggerUi from 'swagger-ui-express';
import routes from './routes.js';
import errorHandler from './_middleware/errorHandler.js';
import './config/database-connection.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

const swaggerPath = join(__dirname, '..', 'swagger.json');
if (existsSync(swaggerPath)) {
  const swaggerDocument = JSON.parse(readFileSync(swaggerPath, 'utf-8'));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

app.use(cors());
app.use(express.json());
app.use(routes);
app.use(errorHandler);
app.listen(3333, () => console.log('Servidor rodando na porta 3333'));