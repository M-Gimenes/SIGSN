import { Model, DataTypes } from 'sequelize';

class Observacao extends Model {
  static init(sequelize) {
    super.init(
      {
        dataObservacao: {
          type: DataTypes.DATEONLY,
          allowNull: false,
          validate: {
            isDate: { msg: 'Data da Observacao deve ser valida.' },
          },
        },
        descricao: {
          type: DataTypes.TEXT,
          allowNull: false,
          validate: {
            notEmpty: { msg: 'Descricao da Observacao deve ser preenchida.' },
          },
        },
        instrumentoUtilizado: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: { msg: 'Instrumento Utilizado deve ser preenchido.' },
          },
        },
        versaoObservacao: {
          type: DataTypes.DOUBLE,
          allowNull: false,
          defaultValue: 1,
          validate: {
            isFloat: { msg: 'Versao da Observacao deve ser numerica.' },
          },
        },
      },
      {
        sequelize,
        modelName: 'observacao',
        tableName: 'observacoes',
        indexes: [
          {
            unique: true,
            fields: ['projeto_id', 'constelacao_id', 'data_observacao'],
            name: 'observacao_projeto_constelacao_data_unq',
          },
        ],
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.projeto, {
      as: 'projeto',
      foreignKey: {
        name: 'projetoId',
        allowNull: false,
        validate: { notNull: { msg: 'Projeto da Observacao deve ser preenchido.' } },
      },
    });
    this.belongsTo(models.constelacao, {
      as: 'constelacao',
      foreignKey: {
        name: 'constelacaoId',
        allowNull: false,
        validate: { notNull: { msg: 'Constelacao da Observacao deve ser preenchida.' } },
      },
    });
  }
}

export { Observacao };
