const { backupDatabase } = require('../common');

module.exports = {
  up: async queryInterface => {
    const tableList = await queryInterface.showAllTables();

    if (tableList.includes('tokens')) {
      return null;
    }

    await backupDatabase(__filename);

    return queryInterface.renameTable('refresh_tokens', 'tokens');
  },

  down: queryInterface => {
    return queryInterface.renameTable('tokens', 'refresh_tokens');
  },
};
