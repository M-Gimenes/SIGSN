import { DataTypes } from 'sequelize';
import { Pessoa } from './Pessoa.js';

class Guia extends Pessoa {
  static init(sequelize) {
    super.init(
      {
        ...Pessoa.atributosBase(),
        disponibilidade: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: { msg: 'Disponibilidade do Guia deve ser preenchida.' },
          },
        },
      },
      { sequelize, modelName: 'guia', tableName: 'guias' }
    );
  }

  static associate(models) {
  }
}

export { Guia };
