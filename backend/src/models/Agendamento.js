import { Model, DataTypes } from 'sequelize';

class Agendamento extends Model {
  static init(sequelize) {
    super.init(
      {
        dataVisita: {
          type: DataTypes.DATE,
          allowNull: false,
          validate: {
            isDate: { msg: 'Data da Visita deve ser valida.' },
          },
        },
        tipoVisita: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: { msg: 'Tipo de Visita deve ser preenchido.' },
          },
        },
        valorVisita: {
          type: DataTypes.DOUBLE,
          allowNull: true,
          validate: {
            isFloat: { msg: 'Valor da Visita deve ser numerico.' },
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
            name: 'agendamento_data_horario_unq',
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
        validate: { notNull: { msg: 'Guia do Agendamento deve ser preenchido.' } },
      },
    });
    this.belongsTo(models.coordenador, {
      as: 'coordenador',
      foreignKey: {
        name: 'coordenadorId',
        allowNull: false,
        validate: { notNull: { msg: 'Coordenador do Agendamento deve ser preenchido.' } },
      },
    });
    this.belongsTo(models.caravana, {
      as: 'caravana',
      foreignKey: {
        name: 'caravanaId',
        allowNull: false,
        unique: true,
        validate: { notNull: { msg: 'Caravana do Agendamento deve ser preenchida.' } },
      },
    });
  }
}

export { Agendamento };
