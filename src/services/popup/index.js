const common = require('./common');

const list = require('./list');
const create = require('./create');
const update = require('./update');
const deleteItem = require('./delete');

module.exports = {
  ...common,
  list,
  create,
  update,
  delete: deleteItem,
};
