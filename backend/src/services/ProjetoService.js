import { Op } from 'sequelize';
import sequelize from '../config/database-connection.js';
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

/**
 * RF31–RF34: no máx. 10 projetos ativos; coordenador no máx. 2 ativos.
 * Deve ser chamada dentro de uma transação para evitar race conditions.
 */
async function assertRegrasNegocio({ status, grupoDePesquisaId, coordenadorId }, excludeId, transaction) {
  const grupo = await GrupoDePesquisa.findByPk(grupoDePesquisaId, { transaction });
  if (!grupo) throw new Error('Grupo de Pesquisa não encontrado.');

  const coordenador = await Coordenador.findByPk(coordenadorId, { transaction });
  if (!coordenador) throw new Error('Coordenador não encontrado.');

  if (status !== 'ativo') return;

  const whereBase = { status: 'ativo' };
  const whereExclude = excludeId != null ? { id: { [Op.ne]: excludeId } } : {};

  const totalAtivos = await Projeto.count({
    where: { ...whereBase, ...whereExclude },
    transaction,
  });
  if (totalAtivos >= MAX_PROJETOS_ATIVOS) {
    throw new Error(
      `Não poderá existir mais que ${MAX_PROJETOS_ATIVOS} projetos ativos simultaneamente.`
    );
  }

  const ativosCoordenador = await Projeto.count({
    where: { ...whereBase, coordenadorId, ...whereExclude },
    transaction,
  });
  if (ativosCoordenador >= MAX_PROJETOS_ATIVOS_POR_COORDENADOR) {
    throw new Error(
      `Um coordenador só poderá ser responsável por no máximo ${MAX_PROJETOS_ATIVOS_POR_COORDENADOR} projetos com status Ativo.`
    );
  }
}

class ProjetoService {
  static async findAll() {
    return Projeto.findAll({ include });
  }

  static async findByPk(req) {
    const { id } = req.params;
    return Projeto.findByPk(id, { include });
  }

  static async create(req) {
    const { titulo, dataInicio, dataTermino, status, areaDePesquisa, grupoDePesquisaId, coordenadorId } =
      req.body;

    const statusVal = status ?? 'ativo';

    return sequelize.transaction(async (t) => {
      await assertRegrasNegocio(
        { status: statusVal, grupoDePesquisaId, coordenadorId },
        null,
        t
      );

      const projeto = await Projeto.create(
        { titulo, dataInicio, dataTermino, status: statusVal, areaDePesquisa, grupoDePesquisaId, coordenadorId },
        { transaction: t }
      );
      return Projeto.findByPk(projeto.id, { include, transaction: t });
    });
  }

  static async update(req) {
    const { id } = req.params;
    const { titulo, dataInicio, dataTermino, status, areaDePesquisa, grupoDePesquisaId, coordenadorId } =
      req.body;

    return sequelize.transaction(async (t) => {
      const projeto = await Projeto.findByPk(id, { transaction: t });
      if (!projeto) throw new Error('Projeto não encontrado.');

      const nextStatus = status !== undefined ? status : projeto.status;
      const nextGrupo = grupoDePesquisaId !== undefined ? grupoDePesquisaId : projeto.grupoDePesquisaId;
      const nextCoord = coordenadorId !== undefined ? coordenadorId : projeto.coordenadorId;

      await assertRegrasNegocio(
        { status: nextStatus, grupoDePesquisaId: nextGrupo, coordenadorId: nextCoord },
        Number(id),
        t
      );

      if (titulo !== undefined) projeto.titulo = titulo;
      if (dataInicio !== undefined) projeto.dataInicio = dataInicio;
      if (dataTermino !== undefined) projeto.dataTermino = dataTermino;
      if (status !== undefined) projeto.status = status;
      if (areaDePesquisa !== undefined) projeto.areaDePesquisa = areaDePesquisa;
      if (grupoDePesquisaId !== undefined) projeto.grupoDePesquisaId = grupoDePesquisaId;
      if (coordenadorId !== undefined) projeto.coordenadorId = coordenadorId;
      await projeto.save({ transaction: t });

      return Projeto.findByPk(projeto.id, { include, transaction: t });
    });
  }

  static async delete(req) {
    const { id } = req.params;
    const projeto = await Projeto.findByPk(id);
    if (!projeto) throw new Error('Projeto não encontrado.');
    try {
      await projeto.destroy();
      return projeto;
    } catch (error) {
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        throw new Error(
          'Não é possível remover o projeto: existem observações vinculadas.'
        );
      }
      throw error;
    }
  }
}

export { ProjetoService };
