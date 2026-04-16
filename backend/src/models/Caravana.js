import { Model, DataTypes } from 'sequelize';

// Larissa - Cadastro
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
            isIn: {
              args: [['Escolar', 'Universitária', 'Turística', 'Institucional']],
              msg: 'Tipo da Caravana deve ser Escolar, Universitária, Turística ou Institucional.',
            },
          },
        },
        instituicao: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: { msg: 'Instituição/Organização responsável deve ser preenchida.' },
          },
        },
        responsavel: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: { msg: 'Responsável pela Caravana deve ser preenchido.' },
          },
        },
        telefone: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: { msg: 'Telefone de contato deve ser preenchido.' },
          },
        },
        quantidadeVisitantes: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: {
            isInt: { msg: 'Quantidade de visitantes deve ser um número inteiro.' },
            min: { args: [1], msg: 'Quantidade de visitantes deve ser maior que zero.' },
            max: { args: [50], msg: 'Quantidade de visitantes não pode ultrapassar 50.' },
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
    this.hasMany(models.agendamento, {
      as: 'agendamentos',
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
  }
}

export { Caravana };
