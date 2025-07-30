import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
    class Frequency extends Model {
        static associate(models) {
            Frequency.belongsTo(models.User, {
                as: "professor",
                foreignKey: "userId",
            });

            Frequency.belongsTo(models.CourseClass, {
                as: "disciplinaclasse",
                foreignKey: "courseClassId",
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
            courseClassId: {
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
            latitude: {
                type: DataTypes.FLOAT,
                allowNull: false,
            },
            longitude: {
                type: DataTypes.FLOAT,
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
            modelName: "Frequency",
            tableName: "frequencies",
        }
    );

    return Frequency;
};
