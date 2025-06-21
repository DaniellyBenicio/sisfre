import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class ClassScheduleDetail extends Model {
    static associate(models) {
      ClassScheduleDetail.belongsTo(models.ClassSchedule, {
        foreignKey: "classScheduleId",
        as: "schedule",
      });

      ClassScheduleDetail.belongsTo(models.Discipline, {
        foreignKey: "disciplineId",
        as: "discipline",
      });

      ClassScheduleDetail.belongsTo(models.User, {
        foreignKey: "userId",
        as: "professor",
      });

      ClassScheduleDetail.belongsTo(models.Hour, {
        foreignKey: "hourId",
        as: "hour",
      });
    }
  }

  ClassScheduleDetail.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      classScheduleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "class_schedules",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      disciplineId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Disciplines",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      hourId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Hours",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      dayOfWeek: {
        type: DataTypes.ENUM("Segunda", "Terça", "Quarta", "Quinta", "Sexta"),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "ClassScheduleDetail",
      tableName: "class_schedule_details",
      timestamps: true,
    }
  );

  return ClassScheduleDetail;
};
