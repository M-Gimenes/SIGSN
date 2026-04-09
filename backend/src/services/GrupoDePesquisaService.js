import sequelize from '../config/database-connection.js';
import { GrupoDePesquisa } from '../models/GrupoDePesquisa.js';
import { Pesquisador } from '../models/Pesquisador.js';

const include = [
  {
    model: Pesquisador,
    as: 'pesquisadores',
    through: { attributes: [] },
  },
];

class GrupoDePesquisaService {
  static async findAll() {
    return GrupoDePesquisa.findAll({ include });
  }

  static async findByPk(req) {
    const { id } = req.params;
    return GrupoDePesquisa.findByPk(id, { include });
  }

  static async create(req) {
    const { nome, areaDePesquisa, dataCriacao, descricao, status, pesquisadorIds } = req.body;

    return sequelize.transaction(async (t) => {
      const obj = await GrupoDePesquisa.create(
        { nome, areaDePesquisa, dataCriacao, descricao, status },
        { transaction: t }
      );

      if (pesquisadorIds && pesquisadorIds.length > 0) {
        await obj.setPesquisadores(pesquisadorIds, { transaction: t });
      }

      return GrupoDePesquisa.findByPk(obj.id, { include, transaction: t });
    });
  }

  static async update(req) {
    const { id } = req.params;
    const { nome, areaDePesquisa, dataCriacao, descricao, status, pesquisadorIds } = req.body;

    return sequelize.transaction(async (t) => {
      const obj = await GrupoDePesquisa.findByPk(id, { transaction: t });
      if (!obj) throw new Error('Grupo de Pesquisa não encontrado.');

      if (nome !== undefined) obj.nome = nome;
      if (areaDePesquisa !== undefined) obj.areaDePesquisa = areaDePesquisa;
      if (dataCriacao !== undefined) obj.dataCriacao = dataCriacao;
      if (descricao !== undefined) obj.descricao = descricao;
      if (status !== undefined) obj.status = status;
      await obj.save({ transaction: t });

      if (pesquisadorIds !== undefined) {
        await obj.setPesquisadores(pesquisadorIds, { transaction: t });
      }

      return GrupoDePesquisa.findByPk(obj.id, { include, transaction: t });
    });
  }

  static async delete(req) {
    const { id } = req.params;
    const obj = await GrupoDePesquisa.findByPk(id);
    if (!obj) throw new Error('Grupo de Pesquisa não encontrado.');
    try {
      await obj.destroy();
      return obj;
    } catch (error) {
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        throw new Error(
          'Não é possível remover o grupo: existem projetos ou vínculos com pesquisadores.'
        );
      }
      throw error;
    }
  }
}

export { GrupoDePesquisaService };
