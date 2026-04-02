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
  static async findAll(req) {
    return GrupoDePesquisa.findAll({ include });
  }

  static async findByPk(req) {
    const { id } = req.params;
    return GrupoDePesquisa.findByPk(id, { include });
  }

  static async create(req) {
    const { nome, areaDePesquisa, dataCriacao, descricao, status } = req.body;
    const obj = await GrupoDePesquisa.create({
      nome,
      areaDePesquisa,
      dataCriacao,
      descricao,
      status,
    });
    return GrupoDePesquisa.findByPk(obj.id, { include });
  }

  static async update(req) {
    const { id } = req.params;
    const obj = await GrupoDePesquisa.findByPk(id);
    if (!obj) throw new Error('Grupo de Pesquisa não encontrado.');
    const { nome, areaDePesquisa, dataCriacao, descricao, status } = req.body;
    Object.assign(obj, { nome, areaDePesquisa, dataCriacao, descricao, status });
    await obj.save();
    return GrupoDePesquisa.findByPk(obj.id, { include });
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
        throw new Error('Não é possível remover o grupo: existem projetos ou vínculos com pesquisadores.');
      }
      throw error;
    }
  }
}

export { GrupoDePesquisaService };
