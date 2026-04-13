import { DataTypes } from 'sequelize';
import { Pessoa } from './Pessoa.js';

// Larissa - Cadastro
class Guia extends Pessoa {
  static init(sequelize) {
    super.init(
      {
        ...Pessoa.atributosBase(),
        disponibilidade: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: { msg: 'Disponibilidade do Guia deve ser preenchida.' },
            isValidFormat(value) {
              const pairRegex = /^(SEG|TER|QUA|QUI|SEX|SAB|DOM) (MANHA|TARDE|NOITE)$/;
              for (const slot of value.split(',')) {
                if (!pairRegex.test(slot.trim())) {
                  throw new Error(
                    `Disponibilidade inválida: "${slot.trim()}". ` +
                    `Use "DIA TURNO" separados por vírgula (ex: "SEG MANHA,QUA NOITE"). ` +
                    `Dias: SEG, TER, QUA, QUI, SEX, SAB, DOM. Turnos: MANHA, TARDE, NOITE.`
                  );
                }
              }
            },
          },
        },
      },
      { sequelize, modelName: 'guia', tableName: 'guias' }
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

export { Guia };
