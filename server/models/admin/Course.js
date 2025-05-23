const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const User = require("./User");
const Discipline = require("./Discipline");

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
    type: DataTypes.ENUM(
      "GRADUAÇÃO",
      "TÉCNICO",
      "INTEGRADO",
      "MESTRADO",
      "DOUTORADO",
      "EAD",
      "PROEJA",
      "ESPECIALIZAÇÃO",
      "EXTENSÃO",
      "RESIDÊNCIA",
      "SEQUENCIAL",
      "PÓS-DOUTORADO",
      "CURSO LIVRE"
    ),
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

Course.associate = (models) => {
  Course.belongsToMany(models.Discipline, {
    through: "CourseDisciplines",
    foreignKey: "courseId",
    otherKey: "disciplineId",
    as: "disciplines",
  });
};

// Exportando o modelo
module.exports = Course;
