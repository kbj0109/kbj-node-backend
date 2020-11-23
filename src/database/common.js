const mysqldump = require('mysqldump');
const path = require('path');
const fs = require('fs-extra');
const config = require('./config');
const { DATABASE_BACKUP_PATH } = require('../config');

/** DB 백업 */
exports.backupDatabase = async filepath => {
  const fileName = path.basename(filepath, '.js');
  const filePath = path.join(DATABASE_BACKUP_PATH, fileName);

  fs.mkdirSync(DATABASE_BACKUP_PATH, { recursive: true });

  await mysqldump({
    connection: {
      host: config.host,
      user: config.username,
      password: config.password,
      database: config.database,
    },
    dumpToFile: `${filePath}-compressed.sql.gz`,
    compressFile: true,
  });
};
