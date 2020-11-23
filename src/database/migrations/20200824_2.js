const { backupDatabase } = require('../common');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableMap = await queryInterface.describeTable('tokens');

    if (tableMap.type !== undefined) {
      return null;
    }

    await backupDatabase(__filename);

    return queryInterface.addColumn('tokens', 'type', {
      type: Sequelize.STRING(255),
      defaultValue: '',
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('tokens', 'type');
  },
};
