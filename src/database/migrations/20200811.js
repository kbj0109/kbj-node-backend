const { backupDatabase } = require('../common');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableMap = await queryInterface.describeTable('articles');

    if (tableMap.name !== undefined) {
      return null;
    }

    await backupDatabase(__filename);

    return queryInterface.addColumn('articles', 'name', {
      type: Sequelize.STRING(255),
      defaultValue: '',
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('articles', 'name');
  },
};
