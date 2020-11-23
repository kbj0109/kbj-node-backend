const common = require('./common');

const list = require('./list');
const create = require('./create');
const deleteItem = require('./delete');

module.exports = {
  ...common,
  list,
  create,
  delete: deleteItem,
};
