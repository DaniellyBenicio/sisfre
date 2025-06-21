"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const classes = [];
    for (let s = 1; s <= 10; s++) {
      classes.push({
        semester: `S${s}`,
        createdAt: now,
        updatedAt: now,
      });
    }
    await queryInterface.bulkInsert("Classes", classes, {});

    const [classResults] = await queryInterface.sequelize.query(
      "SELECT id FROM Classes ORDER BY semester ASC"
    );

    const [courseResults] = await queryInterface.sequelize.query(
      "SELECT id FROM Courses"
    );

    const courseClasses = [];
    for (const course of courseResults) {
      const courseId = course.id;
      for (const classItem of classResults) {
        courseClasses.push({
          courseId,
          classId: classItem.id,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    await queryInterface.bulkInsert("course_classes", courseClasses, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("course_classes", null, {});
    await queryInterface.bulkDelete("Classes", null, {});
  },
};
