const { backupDatabase } = require('../common');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableMap = await queryInterface.describeTable('users');

    if (tableMap.email !== undefined) {
      return null;
    }

    await backupDatabase(__filename);

    return queryInterface.addColumn('users', 'email', {
      type: Sequelize.TEXT(),
      defaultValue: '',
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('users', 'email');
  },
};
