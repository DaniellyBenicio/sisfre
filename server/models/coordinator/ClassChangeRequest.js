import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class ClassChangeRequest extends Model {
    static associate(models) {
      ClassChangeRequest.belongsTo(models.User, {
        as: "professor",
        foreignKey: "userId",
      });
    }
  }

  ClassChangeRequest.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },

      course: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      discipline: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      type: {
        type: DataTypes.ENUM("anteposicao", "reposicao"),
        allowNull: false,
      },

      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      annex: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Caminho ou URL do arquivo anexo (PDF, etc.)",
      },

      observation: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      //Validação do coordenador

      validated: {
        type: DataTypes.INTEGER, 
        allowNull: false,
        defaultValue: 0, 
        comment: "0: Pendente, 1: Aprovado, 2: Rejeitado", 
      },

      observationCoordinator: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "ClassChangeRequest",
      tableName: "class_change_request",
    }
  );

  return ClassChangeRequest;
};
