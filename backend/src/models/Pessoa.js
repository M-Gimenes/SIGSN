import { Model, DataTypes } from 'sequelize';

//Matheus
class Pessoa extends Model {
  // Classe base abstrata. Nao cria tabela no banco.
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
          is: {
            args: [/^\d{3}\.\d{3}\.\d{3}-\d{2}$/],
            msg: 'CPF deve estar no formato 000.000.000-00.',
          },
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
          isEmail: { msg: 'E-mail invalido.' },
        },
      },
      status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      especialidade: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    };
  }
}

export { Pessoa };
