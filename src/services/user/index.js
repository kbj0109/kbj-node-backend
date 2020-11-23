const common = require('./common');

const list = require('./list');
const create = require('./create');
const update = require('./update');
const deleteItem = require('./delete');

const findPw = require('./findPw');
const findPwConfirm = require('./findPw.confirm');
const findPwChange = require('./findPw.change');

module.exports = {
  ...common,
  list,
  create,
  update,
  delete: deleteItem,

  findPw,
  findPwConfirm,
  findPwChange,
};
