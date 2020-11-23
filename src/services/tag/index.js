const common = require('./common');

const create = require('./create');
const update = require('./update');

module.exports = {
  ...common,
  create,
  update,
};
