import { DataTypes } from 'sequelize';
import { Pessoa } from './Pessoa.js';

// Larissa - Cadastro
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
            isIn: {
              args: [['MANHA', 'TARDE', 'NOITE']],
              msg: 'Disponibilidade deve ser MANHA, TARDE ou NOITE.',
            },
          },
        },
      },
      { sequelize, modelName: 'guia', tableName: 'guias' }
    );
  }

  static associate(models) {
    this.hasMany(models.agendamento, {
      as: 'agendamentos',
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
  }
}

export { Guia };
