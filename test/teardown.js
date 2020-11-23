const fs = require('fs-extra');
const { TEMP_FILE_PATH } = require('./config');
const { disconnectDB, resetDatabase } = require('../src/database');

module.exports = async () => {
  await resetDatabase();
  await disconnectDB();
  fs.remove(TEMP_FILE_PATH);
};
