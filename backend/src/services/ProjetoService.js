import { Op } from 'sequelize';
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

function isProjetoAtivo(status) {
  return status === 'ativo';
}

class ProjetoService {
  /**
   * Regras (doc RF31–RF34): no máx. 10 projetos ativos; coordenador no máx. 2 ativos.
   */
  static async _assertRegrasNegocio({ status, grupoDePesquisaId, coordenadorId }, { excludeId } = {}) {
    const grupo = await GrupoDePesquisa.findByPk(grupoDePesquisaId);
    if (!grupo) throw new Error('Grupo de Pesquisa não encontrado.');

    const coordenador = await Coordenador.findByPk(coordenadorId);
    if (!coordenador) throw new Error('Coordenador não encontrado.');

    if (!isProjetoAtivo(status)) return;

    const whereBase = { status: 'ativo' };
    const whereTotal = excludeId
      ? { ...whereBase, id: { [Op.ne]: excludeId } }
      : whereBase;
    const totalAtivos = await Projeto.count({ where: whereTotal });
    if (totalAtivos >= MAX_PROJETOS_ATIVOS) {
      throw new Error(
        `Não poderá existir mais que ${MAX_PROJETOS_ATIVOS} projetos ativos simultaneamente.`
      );
    }

    const whereCoord = {
      ...whereBase,
      coordenadorId,
      ...(excludeId ? { id: { [Op.ne]: excludeId } } : {}),
    };
    const ativosCoordenador = await Projeto.count({ where: whereCoord });
    if (ativosCoordenador >= MAX_PROJETOS_ATIVOS_POR_COORDENADOR) {
      throw new Error(
        `Um coordenador só poderá ser responsável por no máximo ${MAX_PROJETOS_ATIVOS_POR_COORDENADOR} projetos com status Ativo.`
      );
    }
  }

  static async findAll(req) {
    return Projeto.findAll({ include });
  }

  static async findByPk(req) {
    const { id } = req.params;
    return Projeto.findByPk(id, { include });
  }

  static async create(req) {
    const {
      titulo,
      dataInicio,
      dataTermino,
      status,
      areaDePesquisa,
      grupoDePesquisaId,
      coordenadorId,
    } = req.body;

    const statusVal = status !== undefined && status !== null ? status : 'ativo';

    await this._assertRegrasNegocio(
      {
        status: statusVal,
        grupoDePesquisaId,
        coordenadorId,
      },
      {}
    );

    const obj = await Projeto.create({
      titulo,
      dataInicio,
      dataTermino,
      status: statusVal,
      areaDePesquisa,
      grupoDePesquisaId,
      coordenadorId,
    });
    return Projeto.findByPk(obj.id, { include });
  }

  static async update(req) {
    const { id } = req.params;
    const obj = await Projeto.findByPk(id);
    if (!obj) throw new Error('Projeto não encontrado.');

    const {
      titulo,
      dataInicio,
      dataTermino,
      status,
      areaDePesquisa,
      grupoDePesquisaId,
      coordenadorId,
    } = req.body;

    const nextStatus = status !== undefined ? status : obj.status;
    const nextGrupo = grupoDePesquisaId !== undefined ? grupoDePesquisaId : obj.grupoDePesquisaId;
    const nextCoord = coordenadorId !== undefined ? coordenadorId : obj.coordenadorId;

    await this._assertRegrasNegocio(
      { status: nextStatus, grupoDePesquisaId: nextGrupo, coordenadorId: nextCoord },
      { excludeId: Number(id) }
    );

    if (titulo !== undefined) obj.titulo = titulo;
    if (dataInicio !== undefined) obj.dataInicio = dataInicio;
    if (dataTermino !== undefined) obj.dataTermino = dataTermino;
    if (status !== undefined) obj.status = status;
    if (areaDePesquisa !== undefined) obj.areaDePesquisa = areaDePesquisa;
    if (grupoDePesquisaId !== undefined) obj.grupoDePesquisaId = grupoDePesquisaId;
    if (coordenadorId !== undefined) obj.coordenadorId = coordenadorId;

    await obj.save();
    return Projeto.findByPk(obj.id, { include });
  }

  static async delete(req) {
    const { id } = req.params;
    const obj = await Projeto.findByPk(id);
    if (!obj) throw new Error('Projeto não encontrado.');

    try {
      await obj.destroy();
      return obj;
    } catch (error) {
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        throw new Error(
          'Não é possível remover o projeto: existem registros dependentes (ex.: observações).'
        );
      }
      throw error;
    }
  }
}

export { ProjetoService };
