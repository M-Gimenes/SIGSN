import { Model, DataTypes } from 'sequelize';

class Projeto extends Model {
  static init(sequelize) {
    super.init(
      {
        titulo: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: { msg: 'Titulo do Projeto deve ser preenchido.' },
            len: { args: [3, 30], msg: 'Título do Projeto deve ter entre 3 e 30 caracteres.' },
          },
        },
        dataInicio: {
          type: DataTypes.DATEONLY,
          allowNull: false,
          validate: {
            isDate: { msg: 'Data de Inicio do Projeto deve ser valida.' },
          },
        },
        dataTermino: {
          type: DataTypes.DATEONLY,
          allowNull: false,
          validate: {
            isDate: { msg: 'Data de Termino do Projeto deve ser valida.' },
            isAfterDataInicio(value) {
              if (this.dataInicio && value && value < this.dataInicio) {
                throw new Error('Data de Termino nao pode ser anterior a Data de Inicio.');
              }
            },
          },
        },
        status: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        areaDePesquisa: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: { msg: 'Area de Pesquisa do Projeto deve ser preenchida.' },
          },
        },
      },
      { sequelize, modelName: 'projeto', tableName: 'projetos' }
    );
  }

  static associate(models) {
    this.belongsTo(models.grupoDePesquisa, {
      as: 'grupoDePesquisa',
      foreignKey: {
        name: 'grupoDePesquisaId',
        allowNull: false,
        validate: { notNull: { msg: 'Grupo de Pesquisa do Projeto deve ser preenchido.' } },
      },
    });
    this.belongsTo(models.coordenador, {
      as: 'coordenador',
      foreignKey: {
        name: 'coordenadorId',
        allowNull: false,
        validate: { notNull: { msg: 'Coordenador do Projeto deve ser preenchido.' } },
      },
    });
    this.hasMany(models.observacao, { as: 'observacoes', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
  }
}

export { Projeto };
