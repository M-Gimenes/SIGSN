import { Model, DataTypes } from 'sequelize';

// Larissa - Processo
class Agendamento extends Model {
  static init(sequelize) {
    super.init(
      {
        dataVisita: {
          type: DataTypes.DATE,
          allowNull: false,
          validate: {
            isDate: { msg: 'Data da visita deve ser válida.' },
          },
        },
        valorVisita: {
          type: DataTypes.DOUBLE,
          allowNull: true,
          validate: {
            isFloat: { msg: 'Valor da visita deve ser numérico.' },
            min: { args: [0], msg: 'Valor da visita não pode ser negativo.' },
          },
        },
        observacoes: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: 'agendamento',
        tableName: 'agendamentos',
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.guia, {
      as: 'guia',
      foreignKey: {
        name: 'guiaId',
        allowNull: false,
        validate: { notNull: { msg: 'Guia do agendamento deve ser preenchido.' } },
      },
    });
    this.belongsTo(models.caravana, {
      as: 'caravana',
      foreignKey: {
        name: 'caravanaId',
        allowNull: false,
        validate: { notNull: { msg: 'Caravana do agendamento deve ser preenchida.' } },
      },
    });
  }
}

export { Agendamento };
