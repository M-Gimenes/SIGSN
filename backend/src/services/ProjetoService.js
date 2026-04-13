import { Op } from 'sequelize';
import sequelize from '../config/database-connection.js';
import { ValidationError } from '../utils/errors.js';
import { validarCampos } from '../utils/validate.js';
import { Projeto } from '../models/Projeto.js';
import { GrupoDePesquisa } from '../models/GrupoDePesquisa.js';
import { Coordenador } from '../models/Coordenador.js';
import { Observacao } from '../models/Observacao.js';

const MAX_PROJETOS_ATIVOS = 10;
const MAX_PROJETOS_ATIVOS_POR_COORDENADOR = 2;

const include = [
  { model: GrupoDePesquisa, as: 'grupoDePesquisa' },
  { model: Coordenador, as: 'coordenador' },
  { model: Observacao, as: 'observacoes' },
];

// ─── Validação ────────────────────────────────────────────────────────────────

async function assertValido(dados, excludeId, transaction) {
  const [campoErros, regraErros] = await Promise.all([
    validarCampos(Projeto, dados),
    errosDeNegocio(dados, excludeId, transaction),
  ]);

  const todos = [...campoErros, ...regraErros];
  if (todos.length > 0) throw new ValidationError(todos);
}

async function errosDeNegocio({ status, grupoDePesquisaId, coordenadorId }, excludeId, transaction) {
  const erros = [];

  const [grupo, coordenador] = await Promise.all([
    GrupoDePesquisa.findByPk(grupoDePesquisaId, { transaction }),
    Coordenador.findByPk(coordenadorId, { transaction }),
  ]);

  if (!grupo) erros.push('Grupo de Pesquisa não encontrado.');
  if (!coordenador) erros.push('Coordenador não encontrado.');

  if (status === 'ativo') {
    const whereBase = { status: 'ativo' };
    const whereExclude = excludeId != null ? { id: { [Op.ne]: excludeId } } : {};

    const [totalAtivos, ativosCoordenador] = await Promise.all([
      Projeto.count({ where: { ...whereBase, ...whereExclude }, transaction }),
      Projeto.count({ where: { ...whereBase, coordenadorId, ...whereExclude }, transaction }),
    ]);

    if (totalAtivos >= MAX_PROJETOS_ATIVOS) {
      erros.push(`Não poderá existir mais que ${MAX_PROJETOS_ATIVOS} projetos ativos simultaneamente.`);
    }
    if (ativosCoordenador >= MAX_PROJETOS_ATIVOS_POR_COORDENADOR) {
      erros.push(`Um coordenador só poderá ser responsável por no máximo ${MAX_PROJETOS_ATIVOS_POR_COORDENADOR} projetos com status Ativo.`);
    }
  }

  return erros;
}

// ─── Service ──────────────────────────────────────────────────────────────────

class ProjetoService {
  static async findAll() {
    return Projeto.findAll({ include });
  }

  static async findByPk(req) {
    const { id } = req.params;
    return Projeto.findByPk(id, { include });
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
      await assertValido(dados, null, transaction);

      const projeto = await Projeto.create(dados, { transaction });
      return Projeto.findByPk(projeto.id, { include, transaction });
    });
  }

  static async update(req) {
    const { id } = req.params;
    const { titulo, dataInicio, dataTermino, status, areaDePesquisa, grupoDePesquisaId, coordenadorId } = req.body;

    return sequelize.transaction(async (transaction) => {
      const projeto = await Projeto.findByPk(id, { transaction });
      if (!projeto) throw new ValidationError('Projeto não encontrado.');

      const dados = {
        titulo:            titulo            ?? projeto.titulo,
        dataInicio:        dataInicio        ?? projeto.dataInicio,
        dataTermino:       dataTermino       ?? projeto.dataTermino,
        status:            status            ?? projeto.status,
        areaDePesquisa:    areaDePesquisa    ?? projeto.areaDePesquisa,
        grupoDePesquisaId: grupoDePesquisaId ?? projeto.grupoDePesquisaId,
        coordenadorId:     coordenadorId     ?? projeto.coordenadorId,
      };

      await assertValido(dados, Number(id), transaction);

      Object.assign(projeto, dados);
      await projeto.save({ transaction });
      return Projeto.findByPk(projeto.id, { include, transaction });
    });
  }

  static async delete(req) {
    const { id } = req.params;
    const projeto = await Projeto.findByPk(id);
    if (!projeto) throw new ValidationError('Projeto não encontrado.');
    try {
      await projeto.destroy();
      return projeto;
    } catch (error) {
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        throw new ValidationError('Não é possível remover o projeto: existem observações vinculadas.');
      }
      throw error;
    }
  }
}

export { ProjetoService };
