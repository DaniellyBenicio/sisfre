// models/Class.js
import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Class extends Model {
    static associate(models) {
      Class.belongsToMany(models.Course, {
        through: "CourseClass",
        foreignKey: "classId",
        otherKey: "courseId",
        as: "course",
      });
    }
  }

  Class.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      semester: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Class",
    }
  );

  return Class;
};