import { Model, DataTypes } from 'sequelize';

// Matheus - Classe base abstrata. Não cria tabela no banco.
class Pessoa extends Model {
  static atributosBase() {
    return {
      nome: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Nome deve ser preenchido.' },
        },
      },
      cpf: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: { msg: 'CPF deve ser preenchido.' },
        },
      },
      telefone: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Telefone deve ser preenchido.' },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: { msg: 'E-mail deve ser preenchido.' },
          isEmail: { msg: 'E-mail inválido.' },
        },
      },
      status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      especialidade: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Especialidade deve ser preenchida.' },
        },
      },
    };
  }
}

export { Pessoa };
