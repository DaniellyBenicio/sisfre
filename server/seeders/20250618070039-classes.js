'use strict';

export default {
  async up(queryInterface, Sequelize) {
    const classes = [];
    const now = new Date();

    for (let courseId = 1; courseId <= 11; courseId++) {
      for (let s = 1; s <= 8; s++) {
        classes.push({
          semester: `S${s}`,
          createdAt: now,
          updatedAt: now
        });
      }
    }

    await queryInterface.bulkInsert('Classes', classes, {});

    const [results] = await queryInterface.sequelize.query(
      'SELECT id FROM Classes ORDER BY id ASC'
    );

    const courseClasse = [];
    let classIndex = 0;
    for (let courseId = 1; courseId <= 11; courseId++) {
      for (let s = 1; s <= 8; s++) {
        courseClasse.push({
          courseId,
          classId: results[classIndex].id,
          createdAt: now,
          updatedAt: now
        });
        classIndex++;
      }
    }

    await queryInterface.bulkInsert('course_classes', courseClasse, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('course_classes', null, {});
    await queryInterface.bulkDelete('Classes', null, {});
  }
};