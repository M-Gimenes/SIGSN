import { Model, DataTypes } from 'sequelize';

class Caravana extends Model {
  static init(sequelize) {
    super.init(
      {
        nome: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
          validate: {
            notEmpty: { msg: 'Nome da Caravana deve ser preenchido.' },
          },
        },
        tipoCaravana: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: { msg: 'Tipo da Caravana deve ser preenchido.' },
          },
        },
        instituicao: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: { msg: 'Instituicao da Caravana deve ser preenchida.' },
          },
        },
        responsavel: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: { msg: 'Responsavel da Caravana deve ser preenchido.' },
          },
        },
        telefone: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: { msg: 'Telefone da Caravana deve ser preenchido.' },
          },
        },
        quantidadeVisitantes: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: {
            min: { args: [1], msg: 'Quantidade de visitantes deve ser maior que zero.' },
            max: { args: [50], msg: 'Quantidade de visitantes nao pode ultrapassar 50.' },
          },
        },
        observacoes: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      { sequelize, modelName: 'caravana', tableName: 'caravanas' }
    );
  }

  static associate(models) {
    this.hasOne(models.agendamento, { as: 'agendamento', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
  }
}

export { Caravana };
