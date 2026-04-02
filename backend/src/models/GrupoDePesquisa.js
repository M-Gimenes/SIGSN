import { Model, DataTypes } from 'sequelize';


class GrupoDePesquisa extends Model {
  static init(sequelize) {
    super.init(
      {
        nome: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: { msg: 'Nome do Grupo de Pesquisa deve ser preenchido.' },
            len: { args: [3, 30], msg: 'Nome do Grupo de Pesquisa deve ter entre 3 e 30 caracteres.' },
          },
        },
        areaDePesquisa: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: { msg: 'Area de Pesquisa do Grupo deve ser preenchida.' },
          },
        },
        dataCriacao: {
          type: DataTypes.DATEONLY,
          allowNull: false,
          validate: {
            isDate: { msg: 'Data de Criacao do Grupo deve ser valida.' },
          },
        },
        descricao: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        status: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
      },
      { sequelize, modelName: 'grupoDePesquisa', tableName: 'grupos_de_pesquisa' }
    );
  }

  static associate(models) {
    this.belongsToMany(models.pesquisador, {
      as: 'pesquisadores',
      through: 'grupo_pesquisador',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  }
}

export { GrupoDePesquisa };
