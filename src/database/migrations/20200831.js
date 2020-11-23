const Sequelize = require('sequelize');
const { backupDatabase } = require('../common');

const addUserColumns = [
  {
    name: 'role',
    after: 'salt',
    type: Sequelize.STRING(255),
    defaultValue: '',
    allowNull: false,
  },
];

const addBoardSettingColumns = [
  {
    name: 'create_role',
    after: 'create_level',
    type: Sequelize.STRING(255),
    defaultValue: '',
    allowNull: false,
  },
  {
    name: 'read_list_role',
    after: 'read_list_level',
    type: Sequelize.STRING(255),
    defaultValue: '',
    allowNull: false,
  },
  {
    name: 'read_role',
    after: 'read_level',
    type: Sequelize.STRING(255),
    defaultValue: '',
    allowNull: false,
  },
  {
    name: 'update_role',
    after: 'update_level',
    type: Sequelize.STRING(255),
    defaultValue: '',
    allowNull: false,
  },
  {
    name: 'delete_role',
    after: 'delete_level',
    type: Sequelize.STRING(255),
    defaultValue: '',
    allowNull: false,
  },
  {
    name: 'like_role',
    after: 'like_level',
    type: Sequelize.STRING(255),
    defaultValue: '',
    allowNull: false,
  },
  {
    name: 'comment_create_role',
    after: 'comment_create_level',
    type: Sequelize.STRING(255),
    defaultValue: '',
    allowNull: false,
  },
  {
    name: 'comment_read_list_role',
    after: 'comment_read_list_level',
    type: Sequelize.STRING(255),
    defaultValue: '',
    allowNull: false,
  },
  {
    name: 'comment_delete_role',
    after: 'comment_delete_level',
    type: Sequelize.STRING(255),
    defaultValue: '',
    allowNull: false,
  },
  {
    name: 'comment_like_role',
    after: 'comment_like_level',
    type: Sequelize.STRING(255),
    defaultValue: '',
    allowNull: false,
  },
  {
    name: 'file_create_role',
    after: 'file_create_level',
    type: Sequelize.STRING(255),
    defaultValue: '',
    allowNull: false,
  },
  {
    name: 'file_read_role',
    after: 'file_read_level',
    type: Sequelize.STRING(255),
    defaultValue: '',
    allowNull: false,
  },
];

const removeBoardSettingColumns = [
  {
    name: 'notice_level',
    after: 'delete_auth',
    type: Sequelize.SMALLINT,
    defaultValue: 0,
  },
  {
    name: 'order_level',
    after: 'notice_level',
    type: Sequelize.SMALLINT,
    defaultValue: 0,
  },
  {
    name: 'visible_auth',
    after: 'order_level',
    type: Sequelize.STRING(255),
    defaultValue: '',
  },
  {
    name: 'visible_level',
    after: 'visible_auth',
    type: Sequelize.SMALLINT,
    defaultValue: 0,
  },
];

module.exports = {
  up: async queryInterface => {
    await backupDatabase(__filename);

    return Promise.all([
      queryInterface.describeTable('users').then(tableDefinition => {
        return addUserColumns.reduce(async (prev, { name, ...options }) => {
          await prev;
          return tableDefinition[name] === undefined
            ? queryInterface.addColumn('users', name, options)
            : null;
        }, Promise.resolve());
      }),

      queryInterface.describeTable('board_settings').then(tableDefinition => {
        return addBoardSettingColumns.reduce(
          async (prev, { name, ...options }) => {
            await prev;
            return tableDefinition[name] === undefined
              ? queryInterface.addColumn('board_settings', name, options)
              : null;
          },
          Promise.resolve(),
        );
      }),

      queryInterface.describeTable('board_settings').then(tableDefinition => {
        return removeBoardSettingColumns.map(({ name }) => {
          return tableDefinition[name] !== undefined
            ? queryInterface.removeColumn('board_settings', name)
            : null;
        }, Promise.resolve());
      }),
    ]);
  },

  down: queryInterface => {
    return Promise.all([
      ...addUserColumns.map(({ name }) => {
        return queryInterface.removeColumn('users', name);
      }),
      ...addBoardSettingColumns.map(({ name }) => {
        return queryInterface.removeColumn('board_settings', name);
      }),

      queryInterface.describeTable('board_settings').then(tableDefinition => {
        return removeBoardSettingColumns.reduce(
          async (prev, { name, ...options }) => {
            await prev;
            return tableDefinition[name] === undefined
              ? queryInterface.addColumn('board_settings', name, options)
              : null;
          },
          Promise.resolve(),
        );
      }),
    ]);
  },
};
