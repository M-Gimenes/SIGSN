import { Model, DataTypes } from 'sequelize';

// Emanuelly - Processo
class Observacao extends Model {
  static init(sequelize) {
    super.init(
      {
        dataObservacao: {
          type: DataTypes.DATEONLY,
          allowNull: false,
          validate: {
            isDate: { msg: 'Data da observação deve ser válida.' },
          },
        },
        descricao: {
          type: DataTypes.TEXT,
          allowNull: false,
          validate: {
            notEmpty: { msg: 'Descrição científica da observação deve ser preenchida.' },
          },
        },
        instrumentoUtilizado: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: { msg: 'Instrumento utilizado deve ser preenchido.' },
          },
        },
        versaoObservacao: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1,
          validate: {
            isInt: { msg: 'Versão da observação deve ser um número inteiro.' },
            min: { args: [1], msg: 'Versão da observação deve ser maior que zero.' },
          },
        },
      },
      {
        sequelize,
        modelName: 'observacao',
        tableName: 'observacoes',
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.projeto, {
      as: 'projeto',
      foreignKey: {
        name: 'projetoId',
        allowNull: false,
        validate: { notNull: { msg: 'Projeto da observação deve ser preenchido.' } },
      },
    });
    this.belongsTo(models.constelacao, {
      as: 'constelacao',
      foreignKey: {
        name: 'constelacaoId',
        allowNull: false,
        validate: { notNull: { msg: 'Constelação da observação deve ser preenchida.' } },
      },
    });
  }
}

export { Observacao };
