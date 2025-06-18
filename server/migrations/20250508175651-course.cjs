module.exports = {
  async up(queryInterface, Sequelize) {
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
          "TÉCNICO INTEGRADO",
          "MESTRADO",
          "DOUTORADO",
          "EAD",
          "PROEJA",
          "ESPECIALIZAÇÃO",
          "EXTENSÃO",
          "RESIDÊNCIA",
          "SEQUENCIAL",
          "PÓS-DOUTORADO",
          "PÓS-GRADUAÇÃO",
          "CURSO LIVRE"
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
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("courses");
  },
};
