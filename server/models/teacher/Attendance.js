import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Attendance extends Model {
    static associate(models) {
      Attendance.belongsTo(models.ClassScheduleDetail, {
        foreignKey: "classScheduleDetailId",
        as: "detail",
      });

      Attendance.belongsTo(models.User, {
        foreignKey: "registeredBy",
        as: "registrar",
      });
    }
  }

  Attendance.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      classScheduleDetailId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "class_schedule_details",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("presença", "falta", "abonada"),
        allowNull: false,
        defaultValue: "presença",
      },
      registeredBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      latitude: {
        type: DataTypes.DECIMAL(9, 6),
        allowNull: true,
      },
      longitude: {
        type: DataTypes.DECIMAL(9, 6),
        allowNull: true,
      },
      justification: {
        type: DataTypes.TEXT("medium"),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Attendance",
      tableName: "attendances",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["classScheduleDetailId", "date"],
        },
        {
          fields: ["date"],
        },
      ],
    }
  );

  return Attendance;
};
