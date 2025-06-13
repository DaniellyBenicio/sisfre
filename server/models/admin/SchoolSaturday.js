import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class SchoolSaturday extends Model {
    static associate(models) {
      SchoolSaturday.belongsToMany(models.Calendar, {
        through: "calendarSaturday",
        foreignKey: "schoolsaturdayid",
        otherKey: "calendarid",
        as: "calendarSaturdays",
      });
    }
  }

  SchoolSaturday.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      dayOfWeek: {
        type: DataTypes.ENUM("segunda", "terca", "quarta", "quinta", "sexta"),
        allowNull: false,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "SchoolSaturday",
      tableName: "schoolSaturdays",
      timestamps: true,
    }
  );

  return SchoolSaturday;
};
