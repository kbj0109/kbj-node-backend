const alterTables = [
  'board_settings',
  'articles',
  'banners',
  'comments',
  'contacts',
  'files',
  'images',
  'popups',
];
const alterColumn = 'id';

module.exports = {
  up: async queryInterface => {
    await Promise.all(
      alterTables.map(table => {
        return queryInterface
          .addConstraint(table, {
            fields: [alterColumn],
            type: 'unique',
          })
          .catch(err => {
            const { message } = err.original;
            if (
              message.startsWith('Duplicate key name') === false ||
              message.includes(`${table}_${alterColumn}_uk`) === false
            ) {
              throw err;
            }
          });
      }),
    );
  },

  down: async queryInterface => {
    return Promise.all(
      alterTables.map(table => {
        return queryInterface
          .removeConstraint(table, `${table}_${alterColumn}_uk`)
          .catch(err => {
            if (err.message.includes('not exist') === false) {
              throw err;
            }
          });
      }),
    );
  },
};
