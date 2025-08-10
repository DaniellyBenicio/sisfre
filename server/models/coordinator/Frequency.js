import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
    class Frequency extends Model {
        static associate(models) {
            Frequency.belongsTo(models.User, {
                as: "professor",
                foreignKey: "userId",
            });
        }
    }

    Frequency.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            courseId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            disciplineId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            date: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            time: {
                type: DataTypes.TIME,
                allowNull: false,
            },
            isAbsence: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            latitude: {
                type: DataTypes.FLOAT,
                allowNull: true,
            },
            longitude: {
                type: DataTypes.FLOAT,
                allowNull: true,
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
            modelName: "Frequency",
            tableName: "frequencies",
        }
    );

    return Frequency;
};
