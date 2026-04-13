import Sequelize from 'sequelize';
import { databaseConfig } from './database-config.js';

import { Pesquisador } from '../models/Pesquisador.js';
import { Coordenador } from '../models/Coordenador.js';
import { Guia } from '../models/Guia.js';
import { GrupoDePesquisa } from '../models/GrupoDePesquisa.js';
import { Projeto } from '../models/Projeto.js';
import { Constelacao } from '../models/Constelacao.js';
import { Observacao } from '../models/Observacao.js';
import { Caravana } from '../models/Caravana.js';
import { Agendamento } from '../models/Agendamento.js';

const sequelize = new Sequelize(databaseConfig);

Pesquisador.init(sequelize);
Coordenador.init(sequelize);
Guia.init(sequelize);
GrupoDePesquisa.init(sequelize);
Projeto.init(sequelize);
Constelacao.init(sequelize);
Observacao.init(sequelize);
Caravana.init(sequelize);
Agendamento.init(sequelize);

Pesquisador.associate(sequelize.models);
Coordenador.associate(sequelize.models);
Guia.associate(sequelize.models);
GrupoDePesquisa.associate(sequelize.models);
Projeto.associate(sequelize.models);
Constelacao.associate(sequelize.models);
Observacao.associate(sequelize.models);
Caravana.associate(sequelize.models);
Agendamento.associate(sequelize.models);

syncDatabase();

async function syncDatabase() {
  await sequelize.sync({ force: true });
  await seedDatabase();
}

async function seedDatabase() {
  const coordenadores = await Coordenador.bulkCreate([
    {
      nome: 'Coordenador 1',
      cpf: '10000000001',
      telefone: '(28) 99991-0001',
      email: 'coord1@sigsn.com',
      status: true,
      especialidade: 'Astronomia Observacional',
      login: 'coord1',
      senha: '123456',
    },
    {
      nome: 'Coordenador 2',
      cpf: '10000000002',
      telefone: '(28) 99992-0002',
      email: 'coord2@sigsn.com',
      status: true,
      especialidade: 'Cosmologia',
      login: 'coord2',
      senha: '123456',
    },
    {
      nome: 'Coordenador 3',
      cpf: '10000000003',
      telefone: '(28) 99993-0003',
      email: 'coord3@sigsn.com',
      status: true,
      especialidade: 'Astrofísica',
      login: 'coord3',
      senha: '123456',
    },
    {
      nome: 'Coordenador 4',
      cpf: '10000000004',
      telefone: '(28) 99994-0004',
      email: 'coord4@sigsn.com',
      status: true,
      especialidade: 'Instrumentação',
      login: 'coord4',
      senha: '123456',
    },
  ]);

  const pesquisadores = await Pesquisador.bulkCreate([
    {
      nome: 'Pesquisador 1',
      cpf: '20000000001',
      telefone: '(28) 98881-0001',
      email: 'pesq1@sigsn.com',
      status: true,
      especialidade: 'Fotometria',
      login: 'pesq1',
      senha: '123456',
    },
    {
      nome: 'Pesquisador 2',
      cpf: '20000000002',
      telefone: '(28) 98882-0002',
      email: 'pesq2@sigsn.com',
      status: true,
      especialidade: 'Espectroscopia',
      login: 'pesq2',
      senha: '123456',
    },
    {
      nome: 'Pesquisador 3',
      cpf: '20000000003',
      telefone: '(28) 98883-0003',
      email: 'pesq3@sigsn.com',
      status: true,
      especialidade: 'Mecânica Celeste',
      login: 'pesq3',
      senha: '123456',
    },
    {
      nome: 'Pesquisador 4',
      cpf: '20000000004',
      telefone: '(28) 98884-0004',
      email: 'pesq4@sigsn.com',
      status: true,
      especialidade: 'Astrobiologia',
      login: 'pesq4',
      senha: '123456',
    },
  ]);

  const guias = await Guia.bulkCreate([
    {
      nome: 'Guia 1',
      cpf: '30000000001',
      telefone: '(28) 97771-0001',
      email: 'guia1@sigsn.com',
      status: true,
      especialidade: 'Planetário',
      disponibilidade: 'MANHA',
    },
    {
      nome: 'Guia 2',
      cpf: '30000000002',
      telefone: '(28) 97772-0002',
      email: 'guia2@sigsn.com',
      status: true,
      especialidade: 'Telescópios',
      disponibilidade: 'TARDE',
    },
    {
      nome: 'Guia 3',
      cpf: '30000000003',
      telefone: '(28) 97773-0003',
      email: 'guia3@sigsn.com',
      status: true,
      especialidade: 'Visitas Escolares',
      disponibilidade: 'NOITE',
    },
    {
      nome: 'Guia 4',
      cpf: '30000000004',
      telefone: '(28) 97774-0004',
      email: 'guia4@sigsn.com',
      status: true,
      especialidade: 'Sessões Especiais',
      disponibilidade: 'MANHA',
    },
  ]);

  const grupos = await GrupoDePesquisa.bulkCreate([
    {
      nome: 'Grupo Orion',
      areaDePesquisa: 'Evolução estelar',
      dataCriacao: '2025-01-10',
      descricao: 'Grupo focado em estrelas jovens.',
      status: true,
    },
    {
      nome: 'Grupo Lyra',
      areaDePesquisa: 'Exoplanetas',
      dataCriacao: '2025-02-14',
      descricao: 'Busca e análise de exoplanetas.',
      status: true,
    },
    {
      nome: 'Grupo Draco',
      areaDePesquisa: 'Galáxias',
      dataCriacao: '2025-03-20',
      descricao: 'Mapeamento de galáxias próximas.',
      status: true,
    },
    {
      nome: 'Grupo Pegasus',
      areaDePesquisa: 'Nebulosas',
      dataCriacao: '2025-04-01',
      descricao: 'Estudo de nebulosas de emissão.',
      status: true,
    },
  ]);

  await sequelize.models.grupo_pesquisador.bulkCreate([
    { pesquisadorId: pesquisadores[0].id, grupoDePesquisaId: grupos[0].id },
    { pesquisadorId: pesquisadores[1].id, grupoDePesquisaId: grupos[1].id },
    { pesquisadorId: pesquisadores[2].id, grupoDePesquisaId: grupos[2].id },
    { pesquisadorId: pesquisadores[3].id, grupoDePesquisaId: grupos[3].id },
  ]);

  const projetos = await Projeto.bulkCreate([
    {
      titulo: 'Projeto Aster',
      dataInicio: '2025-05-01',
      dataTermino: '2025-10-30',
      status: 'ativo',
      areaDePesquisa: 'Estrelas variáveis',
      grupoDePesquisaId: grupos[0].id,
      coordenadorId: coordenadores[0].id,
    },
    {
      titulo: 'Projeto Helios',
      dataInicio: '2025-06-01',
      dataTermino: '2025-11-30',
      status: 'ativo',
      areaDePesquisa: 'Atividade solar',
      grupoDePesquisaId: grupos[1].id,
      coordenadorId: coordenadores[1].id,
    },
    {
      titulo: 'Projeto Atlas',
      dataInicio: '2025-07-01',
      dataTermino: '2025-12-31',
      status: 'ativo',
      areaDePesquisa: 'Objetos de céu profundo',
      grupoDePesquisaId: grupos[2].id,
      coordenadorId: coordenadores[2].id,
    },
    {
      titulo: 'Projeto Selene',
      dataInicio: '2025-08-01',
      dataTermino: '2026-01-31',
      status: 'ativo',
      areaDePesquisa: 'Superfície lunar',
      grupoDePesquisaId: grupos[3].id,
      coordenadorId: coordenadores[3].id,
    },
  ]);

  const constelacoes = await Constelacao.bulkCreate([
    {
      nome: 'Orion',
      hemisferio: 'Sul',
      periodoVisibilidade: 'Novembro a Março',
      principaisEstrelas: 'Betelgeuse, Rigel',
      descricao: 'Constelação de referência no céu de verão.',
      curiosidades: 'Contém uma das nebulosas mais observadas.',
    },
    {
      nome: 'Cassiopeia',
      hemisferio: 'Norte',
      periodoVisibilidade: 'Agosto a Fevereiro',
      principaisEstrelas: 'Schedar, Caph',
      descricao: 'Constelação em forma de W.',
      curiosidades: 'Fácil de identificar em céu limpo.',
    },
    {
      nome: 'Scorpius',
      hemisferio: 'Sul',
      periodoVisibilidade: 'Maio a Setembro',
      principaisEstrelas: 'Antares, Shaula',
      descricao: 'Uma das mais brilhantes do céu.',
      curiosidades: 'Muito usada em visitas noturnas.',
    },
    {
      nome: 'Crux',
      hemisferio: 'Sul',
      periodoVisibilidade: 'Abril a Junho',
      principaisEstrelas: 'Acrux, Mimosa',
      descricao: 'Conhecida como Cruzeiro do Sul.',
      curiosidades: 'Utilizada para orientação no hemisfério sul.',
    },
  ]);

  await Observacao.bulkCreate([
    {
      dataObservacao: '2025-09-10',
      descricao: 'Registro inicial da constelação.',
      instrumentoUtilizado: 'Telescópio refrator 120mm',
      versaoObservacao: 1,
      projetoId: projetos[0].id,
      constelacaoId: constelacoes[0].id,
    },
    {
      dataObservacao: '2025-09-11',
      descricao: 'Condições atmosféricas estáveis.',
      instrumentoUtilizado: 'Telescópio refletor 200mm',
      versaoObservacao: 1,
      projetoId: projetos[1].id,
      constelacaoId: constelacoes[1].id,
    },
    {
      dataObservacao: '2025-09-12',
      descricao: 'Nova sequência de imagens capturadas.',
      instrumentoUtilizado: 'Câmera CCD',
      versaoObservacao: 1,
      projetoId: projetos[2].id,
      constelacaoId: constelacoes[2].id,
    },
    {
      dataObservacao: '2025-09-13',
      descricao: 'Atualização de catálogo com novas medidas.',
      instrumentoUtilizado: 'Binóculo astronômico 25x100',
      versaoObservacao: 1,
      projetoId: projetos[3].id,
      constelacaoId: constelacoes[3].id,
    },
  ]);

  const caravanas = await Caravana.bulkCreate([
    {
      nome: 'Caravana Aurora',
      tipoCaravana: 'Escolar',
      instituicao: 'Escola Estadual A',
      responsavel: 'Maria Silva',
      telefone: '(28) 96661-0001',
      quantidadeVisitantes: 30,
      observacoes: 'Visita com foco educacional.',
    },
    {
      nome: 'Caravana Cosmos',
      tipoCaravana: 'Universitária',
      instituicao: 'Universidade B',
      responsavel: 'João Souza',
      telefone: '(28) 96662-0002',
      quantidadeVisitantes: 25,
      observacoes: 'Grupo de alunos de física.',
    },
    {
      nome: 'Caravana Estelar',
      tipoCaravana: 'Turística',
      instituicao: 'Agência ViaCéu',
      responsavel: 'Ana Costa',
      telefone: '(28) 96663-0003',
      quantidadeVisitantes: 40,
      observacoes: 'Roteiro noturno.',
    },
    {
      nome: 'Caravana Nebulosa',
      tipoCaravana: 'Institucional',
      instituicao: 'Instituto C',
      responsavel: 'Paulo Lima',
      telefone: '(28) 96664-0004',
      quantidadeVisitantes: 20,
      observacoes: 'Visita técnica.',
    },
  ]);

  await Agendamento.bulkCreate([
    {
      dataVisita: '2026-04-01 09:00:00',
      tipoVisita: 'Diurna',
      valorVisita: 300.0,
      observacoes: 'Primeiro horário da manhã.',
      guiaId: guias[0].id,
      caravanaId: caravanas[0].id,
    },
    {
      dataVisita: '2026-04-02 14:00:00',
      tipoVisita: 'Diurna',
      valorVisita: 280.0,
      observacoes: 'Visita acadêmica.',
      guiaId: guias[1].id,
      caravanaId: caravanas[1].id,
    },
    {
      dataVisita: '2026-04-03 19:30:00',
      tipoVisita: 'Noturna',
      valorVisita: 450.0,
      observacoes: 'Observação a olho nu e telescópio.',
      guiaId: guias[2].id,
      caravanaId: caravanas[2].id,
    },
    {
      dataVisita: '2026-04-04 20:00:00',
      tipoVisita: 'Sessão Especial',
      valorVisita: 500.0,
      observacoes: 'Sessão com conteúdo exclusivo.',
      guiaId: guias[3].id,
      caravanaId: caravanas[3].id,
    },
  ]);
}

export default sequelize;
