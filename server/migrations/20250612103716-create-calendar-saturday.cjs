'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('calendarSaturday', {
      schoolsaturdayid: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'schoolSaturdays',
          key: 'id',
        },
        onUpdate: 'RESTRICT',
        onDelete: 'RESTRICT',
      },
      calendarid: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'calendar',
          key: 'id',
        },
        onUpdate: 'RESTRICT',
        onDelete: 'RESTRICT',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('calendarSaturday', ['schoolsaturdayId', 'calendarId'], {
      unique: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('calendarSaturday');
  }
};