const Sequelize = require('sequelize');

const addColumns = [
  {
    name: 'name',
    after: 'user_id',
    type: Sequelize.STRING(255),
    defaultValue: '',
    allowNull: false,
  },
  {
    name: 'password',
    after: 'name',
    type: Sequelize.STRING(255),
    defaultValue: '',
    allowNull: false,
  },
];

module.exports = {
  up: queryInterface => {
    return Promise.all([
      queryInterface.describeTable('comments').then(tableDefinition => {
        return addColumns.reduce(async (prev, { name, ...options }) => {
          await prev;
          return tableDefinition[name] === undefined
            ? queryInterface.addColumn('comments', name, options)
            : null;
        }, Promise.resolve());
      }),
    ]);
  },

  down: queryInterface => {
    return Promise.all([
      ...addColumns.map(({ name }) => {
        return queryInterface.removeColumn('comments', name);
      }),
    ]);
  },
};
