"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("courses", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      acronym: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      type: {
        type: Sequelize.ENUM(
          "GRADUAÇÃO",
          "TÉCNICO",
          "INTEGRADO",
          "PÓS-GRADUAÇÃO",
          "MESTRADO",
          "DOUTORADO",
          "EAD",
          "PROEJA",
          "ESPECIALIZAÇÃO",
          "EXTENSÃO",
          "RESIDÊNCIA",
          "SEQUENCIAL",
          "BACHARELADO",
          "LICENCIATURA",
          "TECNOLOGIA",
          "LATO SENSU",
          "STRICTO SENSU",
        ),
        allowNull: false,
      },
      coordinatorId: {
        type: Sequelize.INTEGER,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("courses");
  },
};
