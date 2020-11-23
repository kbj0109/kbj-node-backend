const { backupDatabase } = require('../common');

const alterTable = 'likes';
const alterColumn = 'deleted_at';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableMap = await queryInterface.describeTable(alterTable);

    if (tableMap[alterColumn] === undefined) {
      return null;
    }

    await backupDatabase(__filename);

    await queryInterface.bulkDelete(alterTable, {
      [alterColumn]: { [Sequelize.Op.not]: null },
    });

    return queryInterface.removeColumn(alterTable, alterColumn);
  },

  down: async (queryInterface, Sequelize) => {
    const tableMap = await queryInterface.describeTable(alterTable);

    if (tableMap[alterColumn] !== undefined) {
      return null;
    }

    return queryInterface.addColumn(alterTable, alterColumn, {
      type: Sequelize.DATE(3),
    });
  },
};
