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
        tipoVisita: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: { msg: 'Tipo de visita deve ser preenchido.' },
            isIn: {
              args: [['Diurna', 'Noturna', 'Sessão Especial']],
              msg: 'Tipo de visita deve ser Diurna, Noturna ou Sessão Especial.',
            },
          },
        },
        valorVisita: {
          type: DataTypes.DOUBLE,
          allowNull: true,
          validate: {
            isFloat: { msg: 'Valor da visita deve ser numérico.' },
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
        indexes: [
          {
            unique: true,
            fields: ['data_visita'],
            name: 'agendamento_data_visita_unq',
          },
        ],
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
        unique: true,
        validate: { notNull: { msg: 'Caravana do agendamento deve ser preenchida.' } },
      },
    });
  }
}

export { Agendamento };
