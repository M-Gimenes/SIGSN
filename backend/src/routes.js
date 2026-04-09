import express from 'express';

import { AgendamentoController } from './controllers/AgendamentoController.js';
import { CaravanaController } from './controllers/CaravanaController.js';
import { ConstelacaoController } from './controllers/ConstelacaoController.js';
import { CoordenadorController } from './controllers/CoordenadorController.js';
import { GrupoDePesquisaController } from './controllers/GrupoDePesquisaController.js';
import { GuiaController } from './controllers/GuiaController.js';
import { ObservacaoController } from './controllers/ObservacaoController.js';
import { PesquisadorController } from './controllers/PesquisadorController.js';
import { ProjetoController } from './controllers/ProjetoController.js';

const routes = express.Router();

routes.get('/agendamentos', AgendamentoController.findAll);
routes.get('/agendamentos/:id', AgendamentoController.findByPk);
routes.post('/agendamentos', AgendamentoController.create);
routes.put('/agendamentos/:id', AgendamentoController.update);
routes.delete('/agendamentos/:id', AgendamentoController.delete);

routes.get('/caravanas', CaravanaController.findAll);
routes.get('/caravanas/:id', CaravanaController.findByPk);
routes.post('/caravanas', CaravanaController.create);
routes.put('/caravanas/:id', CaravanaController.update);
routes.delete('/caravanas/:id', CaravanaController.delete);

routes.get('/constelacoes', ConstelacaoController.findAll);
routes.get('/constelacoes/:id', ConstelacaoController.findByPk);
routes.post('/constelacoes', ConstelacaoController.create);
routes.put('/constelacoes/:id', ConstelacaoController.update);
routes.delete('/constelacoes/:id', ConstelacaoController.delete);

routes.get('/coordenadores', CoordenadorController.findAll);
routes.get('/coordenadores/:id', CoordenadorController.findByPk);
routes.post('/coordenadores', CoordenadorController.create);
routes.put('/coordenadores/:id', CoordenadorController.update);
routes.delete('/coordenadores/:id', CoordenadorController.delete);

routes.get('/grupos-de-pesquisa', GrupoDePesquisaController.findAll);
routes.get('/grupos-de-pesquisa/:id', GrupoDePesquisaController.findByPk);
routes.post('/grupos-de-pesquisa', GrupoDePesquisaController.create);
routes.put('/grupos-de-pesquisa/:id', GrupoDePesquisaController.update);
routes.delete('/grupos-de-pesquisa/:id', GrupoDePesquisaController.delete);

routes.get('/guias', GuiaController.findAll);
routes.get('/guias/:id', GuiaController.findByPk);
routes.post('/guias', GuiaController.create);
routes.put('/guias/:id', GuiaController.update);
routes.delete('/guias/:id', GuiaController.delete);

routes.get('/observacoes', ObservacaoController.findAll);
routes.get('/observacoes/:id', ObservacaoController.findByPk);
routes.post('/observacoes', ObservacaoController.create);
routes.put('/observacoes/:id', ObservacaoController.update);
routes.delete('/observacoes/:id', ObservacaoController.delete);

routes.get('/pesquisadores', PesquisadorController.findAll);
routes.get('/pesquisadores/:id', PesquisadorController.findByPk);
routes.post('/pesquisadores', PesquisadorController.create);
routes.put('/pesquisadores/:id', PesquisadorController.update);
routes.delete('/pesquisadores/:id', PesquisadorController.delete);

routes.get('/projetos', ProjetoController.findAll);
routes.get('/projetos/:id', ProjetoController.findByPk);
routes.post('/projetos', ProjetoController.create);
routes.put('/projetos/:id', ProjetoController.update);
routes.delete('/projetos/:id', ProjetoController.delete);

export default routes;
