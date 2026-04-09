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
            notEmpty: { msg: 'Nome da Constelação deve ser preenchido.' },
            len: { args: [2, 50], msg: 'Nome da Constelação deve ter entre 2 e 50 caracteres.' },
          },
        },
        hemisferio: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: { msg: 'Hemisfério da Constelação deve ser preenchido.' },
            isIn: {
              args: [['Norte', 'Sul']],
              msg: 'Hemisfério deve ser Norte ou Sul.',
            },
          },
        },
        periodoVisibilidade: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: { msg: 'Período de visibilidade deve ser preenchido.' },
          },
        },
        principaisEstrelas: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: { msg: 'Principais estrelas devem ser preenchidas.' },
          },
        },
        descricao: {
          type: DataTypes.TEXT,
          allowNull: false,
          validate: {
            notEmpty: { msg: 'Descrição astronômica deve ser preenchida.' },
          },
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
    this.hasMany(models.observacao, {
      as: 'observacoes',
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
  }
}

export { Constelacao };
