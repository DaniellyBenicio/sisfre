// models/Class.js
import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Class extends Model {
    static associate(models) {
      Class.belongsTo(models.Course, { foreignKey: "courseId", as: "course" });
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
      courseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Courses",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      semester: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      year: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      period: {
        type: DataTypes.ENUM("1", "2"),
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      shift: {
        type: DataTypes.ENUM("MATUTINO", "VESPERTINO", "NOTURNO"),
        allowNull: false,
      },
      archived: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Class",
    }
  );

  return Class;
};
