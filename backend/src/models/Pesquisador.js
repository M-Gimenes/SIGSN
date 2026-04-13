import { Pessoa } from './Pessoa.js';

// Matheus - Cadastro
class Pesquisador extends Pessoa {
  static init(sequelize) {
    super.init(
      { ...Pessoa.atributosBase('pesquisador') },
      { sequelize, modelName: 'pesquisador', tableName: 'pesquisadores' }
    );
  }

  static associate(models) {
    this.belongsToMany(models.grupoDePesquisa, {
      as: 'gruposDePesquisa',
      through: 'grupo_pesquisador',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  }
}

export { Pesquisador };
