import { DataTypes } from 'sequelize';
import { Pessoa } from './Pessoa.js';

//Matheus - Cadastro
class Pesquisador extends Pessoa {
  static init(sequelize) {
    super.init(
      {
        ...Pessoa.atributosBase(),
        login: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
          validate: {
            notEmpty: { msg: 'Login do Pesquisador deve ser preenchido.' },
          },
        },
        senha: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: { msg: 'Senha do Pesquisador deve ser preenchida.' },
          },
        },
      },
      { sequelize, modelName: 'pesquisador', tableName: 'pesquisadores' }
    );
  }

  static associate(models) {
  }
}

export { Pesquisador };
