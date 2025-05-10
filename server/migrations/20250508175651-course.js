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
        // G - 'GRADUAÇÃO', T - 'TÉCNICO', I - 'INTEGRADO'
        type: Sequelize.ENUM("G", "T", "I"),
        allowNull: false,
      },
      /*
      coordinatorId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "users", // Nome da tabela de referência
          key: "id", // Chave primária da tabela de referência
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      */
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