import { Op } from 'sequelize';
import sequelize from '../config/database-connection.js';
import { ValidationError } from '../utils/errors.js';
import { validarCampos } from '../utils/validate.js';
import { Projeto } from '../models/Projeto.js';
import { GrupoDePesquisa } from '../models/GrupoDePesquisa.js';
import { Coordenador } from '../models/Coordenador.js';
import { Observacao } from '../models/Observacao.js';

// Matheus - Processo

const MAX_PROJETOS_ATIVOS = 10;
const MAX_PROJETOS_ATIVOS_POR_COORDENADOR = 2;

const include = [
  { model: GrupoDePesquisa, as: 'grupoDePesquisa' },
  { model: Coordenador, as: 'coordenador' },
  { model: Observacao, as: 'observacoes' },
];

const exclude = (excludeId) => (excludeId != null ? { id: { [Op.ne]: excludeId } } : {});

// ─── Regras ───────────────────────────────────────────────────────────────────

//Regra 1
async function validarLimiteProjetosAtivos(excludeId, transaction) {
  const total = await Projeto.count({
    where: { status: 'ativo', ...exclude(excludeId) },
    transaction,
  });
  if (total >= MAX_PROJETOS_ATIVOS) {
    throw new ValidationError(
      `Não poderá existir mais que ${MAX_PROJETOS_ATIVOS} projetos ativos simultaneamente.`
    );
  }
}

//Regra 2
async function validarLimiteProjetosPorCoordenador(coordenadorId, excludeId, transaction) {
  const total = await Projeto.count({
    where: { status: 'ativo', coordenadorId, ...exclude(excludeId) },
    transaction,
  });
  if (total >= MAX_PROJETOS_ATIVOS_POR_COORDENADOR) {
    throw new ValidationError(
      `Um coordenador só poderá ser responsável por no máximo ${MAX_PROJETOS_ATIVOS_POR_COORDENADOR} projetos com status Ativo.`
    );
  }
}

async function validarRegrasDeNegocio(dados, excludeId, transaction) {
  const erros = await validarCampos(Projeto, dados);

  const [grupo, coordenador] = await Promise.all([
    GrupoDePesquisa.findByPk(dados.grupoDePesquisaId, { transaction }),
    Coordenador.findByPk(dados.coordenadorId, { transaction }),
  ]);
  if (!grupo) erros.push('Grupo de Pesquisa não encontrado.');
  if (!coordenador) erros.push('Coordenador não encontrado.');

  if (erros.length) throw new ValidationError(erros);

  if (dados.status !== 'ativo') return;

  // Regra 2 antes de Regra 1: a por-coordenador é mais específica e dá feedback mais útil.
  // Ordem também permite testar as duas regras independentemente em qualquer estado.
  await validarLimiteProjetosPorCoordenador(dados.coordenadorId, excludeId, transaction);
  await validarLimiteProjetosAtivos(excludeId, transaction);
}

// ─── Service ──────────────────────────────────────────────────────────────────

class ProjetoService {
  static async findAll() {
    return Projeto.findAll({ include });
  }

  static async findByPk(req) {
    return Projeto.findByPk(req.params.id, { include });
  }

  static async create(req) {
    const { titulo, dataInicio, dataTermino, status, areaDePesquisa, grupoDePesquisaId, coordenadorId } = req.body;
    const dados = {
      titulo,
      dataInicio,
      dataTermino,
      status: status ?? 'ativo',
      areaDePesquisa,
      grupoDePesquisaId,
      coordenadorId,
    };

    return sequelize.transaction(async (transaction) => {
      await validarRegrasDeNegocio(dados, null, transaction);
      const { id } = await Projeto.create(dados, { transaction });
      return Projeto.findByPk(id, { include, transaction });
    });
  }

  static async update(req) {
    const id = Number(req.params.id);

    return sequelize.transaction(async (transaction) => {
      const projeto = await Projeto.findByPk(id, { transaction });
      if (!projeto) throw new ValidationError('Projeto não encontrado.');

      const dados = {
        titulo:            req.body.titulo            ?? projeto.titulo,
        dataInicio:        req.body.dataInicio        ?? projeto.dataInicio,
        dataTermino:       req.body.dataTermino       ?? projeto.dataTermino,
        status:            req.body.status            ?? projeto.status,
        areaDePesquisa:    req.body.areaDePesquisa    ?? projeto.areaDePesquisa,
        grupoDePesquisaId: req.body.grupoDePesquisaId ?? projeto.grupoDePesquisaId,
        coordenadorId:     req.body.coordenadorId     ?? projeto.coordenadorId,
      };

      await validarRegrasDeNegocio(dados, id, transaction);

      await projeto.update(dados, { transaction });
      return Projeto.findByPk(id, { include, transaction });
    });
  }

  static async delete(req) {
    const projeto = await Projeto.findByPk(req.params.id);
    if (!projeto) throw new ValidationError('Projeto não encontrado.');
    await projeto.destroy();
    return projeto;
  }
}

export { ProjetoService };
