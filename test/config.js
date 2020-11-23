const path = require('path');

exports.MOCK_USERS = [
  {
    id: 'admin',
    password: 'admin',
    name: '관리자',
    email: 'admin@admin.com',
    level: 100,
  },
  {
    id: 'sample',
    password: 'sample',
    name: '샘플맨',
    email: 'sample@sample.com',
    level: 0,
    role: [],
  },
];

exports.DUMMY_FILE_PATH = path.join(__dirname, '@dummy');
exports.TEMP_FILE_PATH = path.join(__dirname, 'temp');
