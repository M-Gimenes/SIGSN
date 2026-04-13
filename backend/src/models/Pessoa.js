import { Model, DataTypes } from 'sequelize';

class Pessoa extends Model {
  static atributosBase(funcao) {
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
      funcao: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: funcao,
      },
      login: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: { msg: 'Login deve ser preenchido.' },
        },
      },
      senha: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Senha deve ser preenchida.' },
        },
      },
    };
  }
}

export { Pessoa };
