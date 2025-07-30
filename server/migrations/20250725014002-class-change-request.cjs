'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("class_change_request", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },

      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
      },

      courseClassId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "course_classes",
          key: "id",
        },
        onUpdate: "CASCADE",
      },

      type: {
        type: Sequelize.ENUM("anteposicao", "reposicao"),
        allowNull: false,
      },

      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      
      annex: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "Caminho ou URL do arquivo anexo (PDF, etc.)",
      },

      observation: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      // Validação do coordenador

      validated: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      observationCoordinator: {
        type: Sequelize.TEXT,
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

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("class_change_request");
  },
};
