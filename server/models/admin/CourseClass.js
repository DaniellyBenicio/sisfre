import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class CourseClass extends Model {
    static associate(models) {
      CourseClass.belongsTo(models.Course, {
        foreignKey: "courseId",
        as: "course",
      });

      CourseClass.belongsTo(models.Class, {
        foreignKey: "classId",
        as: "class",
      });
    }
  }

  CourseClass.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      courseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "courses",
          key: "id",
        },
      },
      classId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "classes",
          key: "id",
        },
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "CourseClass",
      tableName: "course_classes",
      timestamps: true,
    }
  );

  return CourseClass;
};