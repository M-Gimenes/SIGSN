import { DataTypes } from 'sequelize';
import { Pessoa } from './Pessoa.js';

class Coordenador extends Pessoa {
  static init(sequelize) {
    super.init(
      {
        ...Pessoa.atributosBase(),
        login: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
          validate: {
            notEmpty: { msg: 'Login do Coordenador deve ser preenchido.' },
          },
        },
        senha: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: { msg: 'Senha do Coordenador deve ser preenchida.' },
          },
        },
      },
      { sequelize, modelName: 'coordenador', tableName: 'coordenadores' }
    );
  }

  static associate(models) {
  }
}

export { Coordenador };
