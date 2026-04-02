import { Model, DataTypes } from 'sequelize';

// Emanuelly - Cadastro
class Constelacao extends Model {
  static init(sequelize) {
    super.init(
      {
        nome: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
          validate: {
            notEmpty: { msg: 'Nome da Constelacao deve ser preenchido.' },
            len: { args: [3, 50], msg: 'Nome da Constelacao deve ter entre 3 e 50 caracteres.' },
          },
        },
        hemisferio: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: { msg: 'Hemisferio da Constelacao deve ser preenchido.' },
            len: { args: [3, 20], msg: 'Hemisfério deve ter entre 3 e 20 caracteres.' },
          },
        },
        periodoVisibilidade: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: { msg: 'Periodo de Visibilidade deve ser preenchido.' },
            len: { args: [3, 50], msg: 'Nome da Constelacao deve ter entre 3 e 50 caracteres.' },
          },
        },
        principaisEstrelas: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: { msg: 'Principais Estrelas da Constelacao devem ser preenchidas.' },
          },
        },
        descricao: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        curiosidades: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      { sequelize, modelName: 'constelacao', tableName: 'constelacoes' }
    );
  }

  static associate(models) {
  }
}

export { Constelacao };
