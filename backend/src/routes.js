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

// ─── Agendamentos ────────────────────────────────────────────────────────────

routes.get('/agendamentos', AgendamentoController.findAll);
routes.get('/agendamentos/:id', AgendamentoController.findByPk);

routes.post('/agendamentos', (req, res, next) => {
  /*
    #swagger.summary = 'Criar agendamento'
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          examples: {
            "Válido": {
              value: {
                dataVisita: "2025-08-15T20:00:00.000Z",
                tipoVisita: "Noturna",
                valorVisita: 35.00,
                observacoes: "Grupo escolar",
                guiaId: 1,
                caravanaId: 1
              }
            },
            "Com erros de validação": {
              value: {
                dataVisita: "nao-e-uma-data",
                tipoVisita: "TipoInvalido",
                valorVisita: "nao-e-numero",
                guiaId: null,
                caravanaId: null
              }
            }
          }
        }
      }
    }
  */
  AgendamentoController.create(req, res, next);
});

routes.put('/agendamentos/:id', AgendamentoController.update);
routes.delete('/agendamentos/:id', AgendamentoController.delete);

// ─── Caravanas ───────────────────────────────────────────────────────────────

routes.get('/caravanas', CaravanaController.findAll);
routes.get('/caravanas/:id', CaravanaController.findByPk);

routes.post('/caravanas', (req, res, next) => {
  /*
    #swagger.summary = 'Criar caravana'
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          examples: {
            "Válido": {
              value: {
                nome: "Caravana do Colégio Estadual",
                tipoCaravana: "Escolar",
                instituicao: "Colégio Estadual Central",
                responsavel: "João Silva",
                telefone: "(41) 99999-0001",
                quantidadeVisitantes: 30,
                observacoes: "Alunos do 3º ano"
              }
            },
            "Com erros de validação": {
              value: {
                nome: "",
                tipoCaravana: "TipoInvalido",
                instituicao: "",
                responsavel: "",
                telefone: "",
                quantidadeVisitantes: 0
              }
            }
          }
        }
      }
    }
  */
  CaravanaController.create(req, res, next);
});

routes.put('/caravanas/:id', CaravanaController.update);
routes.delete('/caravanas/:id', CaravanaController.delete);

// ─── Constelações ─────────────────────────────────────────────────────────────

routes.get('/constelacoes', ConstelacaoController.findAll);
routes.get('/constelacoes/:id', ConstelacaoController.findByPk);

routes.post('/constelacoes', (req, res, next) => {
  /*
    #swagger.summary = 'Criar constelação'
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          examples: {
            "Válido": {
              value: {
                nome: "Orion",
                hemisferio: "Norte",
                periodoVisibilidade: "Outubro a Março",
                principaisEstrelas: "Betelgeuse, Rigel, Bellatrix",
                descricao: "Constelação do caçador mitológico, visível em todo o mundo.",
                curiosidades: "Contém a Nebulosa de Orion."
              }
            },
            "Com erros de validação": {
              value: {
                nome: "X",
                hemisferio: "Leste",
                periodoVisibilidade: "",
                principaisEstrelas: "",
                descricao: ""
              }
            }
          }
        }
      }
    }
  */
  ConstelacaoController.create(req, res, next);
});

routes.put('/constelacoes/:id', ConstelacaoController.update);
routes.delete('/constelacoes/:id', ConstelacaoController.delete);

// ─── Coordenadores ────────────────────────────────────────────────────────────

routes.get('/coordenadores', CoordenadorController.findAll);
routes.get('/coordenadores/:id', CoordenadorController.findByPk);

routes.post('/coordenadores', (req, res, next) => {
  /*
    #swagger.summary = 'Criar coordenador'
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          examples: {
            "Válido": {
              value: {
                nome: "Dra. Ana Paula",
                cpf: "11122233344",
                telefone: "(41) 99999-0002",
                email: "ana.paula@observatorio.br",
                especialidade: "Astrofísica",
                login: "anapaulad",
                senha: "senha123"
              }
            },
            "Com erros de validação": {
              value: {
                nome: "",
                cpf: "",
                telefone: "",
                email: "email-invalido",
                especialidade: "",
                login: "",
                senha: ""
              }
            }
          }
        }
      }
    }
  */
  CoordenadorController.create(req, res, next);
});

routes.put('/coordenadores/:id', CoordenadorController.update);
routes.delete('/coordenadores/:id', CoordenadorController.delete);

// ─── Grupos de Pesquisa ───────────────────────────────────────────────────────

routes.get('/grupos-de-pesquisa', GrupoDePesquisaController.findAll);
routes.get('/grupos-de-pesquisa/:id', GrupoDePesquisaController.findByPk);

routes.post('/grupos-de-pesquisa', (req, res, next) => {
  /*
    #swagger.summary = 'Criar grupo de pesquisa'
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          examples: {
            "Válido": {
              value: {
                nome: "Grupo Astrofísica",
                areaDePesquisa: "Astrofísica Observacional",
                dataCriacao: "2022-03-10",
                descricao: "Grupo dedicado ao estudo de fenômenos astrofísicos.",
                status: true,
                pesquisadorIds: [1, 2]
              }
            },
            "Com erros de validação": {
              value: {
                nome: "AB",
                areaDePesquisa: "",
                dataCriacao: "nao-e-uma-data",
                status: null
              }
            }
          }
        }
      }
    }
  */
  GrupoDePesquisaController.create(req, res, next);
});

routes.put('/grupos-de-pesquisa/:id', GrupoDePesquisaController.update);
routes.delete('/grupos-de-pesquisa/:id', GrupoDePesquisaController.delete);

// ─── Guias ────────────────────────────────────────────────────────────────────

routes.get('/guias', GuiaController.findAll);
routes.get('/guias/:id', GuiaController.findByPk);

routes.post('/guias', (req, res, next) => {
  /*
    #swagger.summary = 'Criar guia'
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          examples: {
            "Válido": {
              value: {
                nome: "Carlos Mendes",
                cpf: "55566677788",
                telefone: "(41) 99999-0003",
                email: "carlos.mendes@observatorio.br",
                especialidade: "Astronomia Popular",
                disponibilidade: "Segunda a Sexta, 18h–22h"
              }
            },
            "Com erros de validação": {
              value: {
                nome: "",
                cpf: "",
                telefone: "",
                email: "nao-e-email",
                especialidade: "",
                disponibilidade: ""
              }
            }
          }
        }
      }
    }
  */
  GuiaController.create(req, res, next);
});

routes.put('/guias/:id', GuiaController.update);
routes.delete('/guias/:id', GuiaController.delete);

// ─── Observações ──────────────────────────────────────────────────────────────

routes.get('/observacoes', ObservacaoController.findAll);
routes.get('/observacoes/:id', ObservacaoController.findByPk);

routes.post('/observacoes', (req, res, next) => {
  /*
    #swagger.summary = 'Criar observação'
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          examples: {
            "Válido": {
              value: {
                dataObservacao: "2025-07-20",
                descricao: "Observação da Nebulosa de Orion com alta nitidez.",
                instrumentoUtilizado: "Telescópio Refrator 120mm",
                projetoId: 1,
                constelacaoId: 1
              }
            },
            "Com erros de validação": {
              value: {
                dataObservacao: "nao-e-uma-data",
                descricao: "",
                instrumentoUtilizado: "",
                projetoId: null,
                constelacaoId: null
              }
            }
          }
        }
      }
    }
  */
  ObservacaoController.create(req, res, next);
});

routes.put('/observacoes/:id', ObservacaoController.update);
routes.delete('/observacoes/:id', ObservacaoController.delete);

// ─── Pesquisadores ────────────────────────────────────────────────────────────

routes.get('/pesquisadores', PesquisadorController.findAll);
routes.get('/pesquisadores/:id', PesquisadorController.findByPk);

routes.post('/pesquisadores', (req, res, next) => {
  /*
    #swagger.summary = 'Criar pesquisador'
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          examples: {
            "Válido": {
              value: {
                nome: "Dr. Marcos Lima",
                cpf: "99988877766",
                telefone: "(41) 99999-0004",
                email: "marcos.lima@observatorio.br",
                especialidade: "Cosmologia",
                login: "marcoslima",
                senha: "senha456"
              }
            },
            "Com erros de validação": {
              value: {
                nome: "",
                cpf: "",
                telefone: "",
                email: "nao-e-email",
                especialidade: "",
                login: "",
                senha: ""
              }
            }
          }
        }
      }
    }
  */
  PesquisadorController.create(req, res, next);
});

routes.put('/pesquisadores/:id', PesquisadorController.update);
routes.delete('/pesquisadores/:id', PesquisadorController.delete);

// ─── Projetos ─────────────────────────────────────────────────────────────────

routes.get('/projetos', ProjetoController.findAll);
routes.get('/projetos/:id', ProjetoController.findByPk);

routes.post('/projetos', (req, res, next) => {
  /*
    #swagger.summary = 'Criar projeto'
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          examples: {
            "Válido": {
              value: {
                titulo: "Mapeamento Estelar",
                dataInicio: "2025-01-01",
                dataTermino: "2025-12-31",
                status: "ativo",
                areaDePesquisa: "Astrometria",
                grupoDePesquisaId: 1,
                coordenadorId: 1
              }
            },
            "Com erros de validação": {
              value: {
                titulo: "AB",
                dataInicio: "nao-e-uma-data",
                dataTermino: "2024-01-01",
                status: "invalido",
                areaDePesquisa: "",
                grupoDePesquisaId: null,
                coordenadorId: null
              }
            }
          }
        }
      }
    }
  */
  ProjetoController.create(req, res, next);
});

routes.put('/projetos/:id', ProjetoController.update);
routes.delete('/projetos/:id', ProjetoController.delete);

export default routes;
