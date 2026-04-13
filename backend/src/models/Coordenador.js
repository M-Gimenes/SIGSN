import { Pessoa } from './Pessoa.js';

// Matheus - Cadastro
class Coordenador extends Pessoa {
  static init(sequelize) {
    super.init(
      { ...Pessoa.atributosBase('coordenador') },
      { sequelize, modelName: 'coordenador', tableName: 'coordenadores' }
    );
  }

  static associate(models) {
    this.hasMany(models.projeto, {
      as: 'projetos',
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
  }
}

export { Coordenador };
