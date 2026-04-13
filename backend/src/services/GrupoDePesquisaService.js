import sequelize from '../config/database-connection.js';
import { ValidationError } from '../utils/errors.js';
import { validarCampos } from '../utils/validate.js';
import { GrupoDePesquisa } from '../models/GrupoDePesquisa.js';
import { Pesquisador } from '../models/Pesquisador.js';

const include = [
  {
    model: Pesquisador,
    as: 'pesquisadores',
    through: { attributes: [] },
  },
];

// ─── Validação ────────────────────────────────────────────────────────────────

async function assertValido(dados) {
  const erros = await validarCampos(GrupoDePesquisa, dados);
  if (erros.length > 0) throw new ValidationError(erros);
}

// ─── Service ──────────────────────────────────────────────────────────────────

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
    const dados = { nome, areaDePesquisa, dataCriacao, descricao, status };

    return sequelize.transaction(async (transaction) => {
      await assertValido(dados);

      const grupo = await GrupoDePesquisa.create(dados, { transaction });

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
      if (!grupo) throw new ValidationError('Grupo de Pesquisa não encontrado.');

      const dados = {
        nome:           nome           ?? grupo.nome,
        areaDePesquisa: areaDePesquisa ?? grupo.areaDePesquisa,
        dataCriacao:    dataCriacao    ?? grupo.dataCriacao,
        descricao:      descricao      ?? grupo.descricao,
        status:         status         ?? grupo.status,
      };

      await assertValido(dados);

      Object.assign(grupo, dados);
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
    if (!grupo) throw new ValidationError('Grupo de Pesquisa não encontrado.');
    await grupo.destroy();
    return grupo;
  }
}

export { GrupoDePesquisaService };
