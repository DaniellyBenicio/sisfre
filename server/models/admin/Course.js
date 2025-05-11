const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const User = require("./User");

const Course = sequelize.define("course", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  acronym: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  type: {
    // G - 'GRADUAÇÃO', T - 'TÉCNICO', I - 'INTEGRADO'
    type: DataTypes.ENUM("G", "T", "I"),
    allowNull: false,
  },
  coordinatorId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
    allowNull: true,
  },
});

// Estabelecendo a relação: um curso pertence a um coordenador (usuário)
Course.belongsTo(User, { as: "coordinator", foreignKey: "coordinatorId" });

// Exportando o modelo
module.exports = Course;
