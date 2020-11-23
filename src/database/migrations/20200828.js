module.exports = {
  up: async queryInterface => {
    // bulkUpdate(tableName, { valueToChange }, { condition (where 없음) } )
    await queryInterface.bulkUpdate(
      'board_settings',
      { use_comment: true },
      { type: 'public' },
    );
  },

  down: async queryInterface => {
    await queryInterface.bulkUpdate(
      'board_settings',
      { use_comment: false },
      { type: 'public' },
    );
  },
};
