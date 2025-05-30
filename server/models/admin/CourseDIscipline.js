import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class CourseDiscipline extends Model {}

  CourseDiscipline.init(
    {
      courseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: "Courses",
          key: "id",
        },
      },
      disciplineId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: "Disciplines",
          key: "id",
        },
      },
      workload: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
        },
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
      modelName: "CourseDiscipline",
      tableName: "courseDisciplines",
      timestamps: true,
    }
  );

  return CourseDiscipline;
};
