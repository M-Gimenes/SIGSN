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

    return sequelize.transaction(async (transaction) => {
      const grupo = await GrupoDePesquisa.create(
        { nome, areaDePesquisa, dataCriacao, descricao, status },
        { transaction }
      );

      if (pesquisadorIds && pesquisadorIds.length > 0) {
        await grupo.setPesquisadores(pesquisadorIds, { transaction });
      }

      return GrupoDePesquisa.findByPk(grupo.id, { include, transaction });
    });
  }

  static async update(req) {
    const { id } = req.params;
    const { nome, areaDePesquisa, dataCriacao, descricao, status, pesquisadorIds } = req.body;

    return sequelize.transaction(async (transaction) => {
      const grupo = await GrupoDePesquisa.findByPk(id, { transaction });
      if (!grupo) throw new Error('Grupo de Pesquisa não encontrado.');

      if (nome !== undefined) grupo.nome = nome;
      if (areaDePesquisa !== undefined) grupo.areaDePesquisa = areaDePesquisa;
      if (dataCriacao !== undefined) grupo.dataCriacao = dataCriacao;
      if (descricao !== undefined) grupo.descricao = descricao;
      if (status !== undefined) grupo.status = status;
      await grupo.save({ transaction });

      if (pesquisadorIds !== undefined) {
        await grupo.setPesquisadores(pesquisadorIds, { transaction });
      }

      return GrupoDePesquisa.findByPk(grupo.id, { include, transaction });
    });
  }

  static async delete(req) {
    const { id } = req.params;
    const grupo = await GrupoDePesquisa.findByPk(id);
    if (!grupo) throw new Error('Grupo de Pesquisa não encontrado.');
    await grupo.destroy();
    return grupo;
  }
}

export { GrupoDePesquisaService };
