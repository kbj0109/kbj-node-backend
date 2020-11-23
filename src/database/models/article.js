const Sequelize = require('sequelize');

const schema = {
  idx: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  id: {
    type: Sequelize.STRING(50),
    allowNull: false,
    unique: true,
  },
  userId: {
    type: Sequelize.STRING,
    defaultValue: '',
  },
  boardType: {
    type: Sequelize.STRING(255),
    allowNull: false,
  },
  subject: {
    type: Sequelize.TEXT(),
    defaultValue: '',
  },
  content: {
    type: Sequelize.TEXT('long'),
  },
  attachFiles: {
    type: Sequelize.JSON,
    defaultValue: [],
  },
  name: {
    type: Sequelize.STRING(255),
    defaultValue: '',
  },
  password: {
    type: Sequelize.STRING(255),
    defaultValue: '',
  },
  category: {
    type: Sequelize.STRING(255),
    defaultValue: '',
  },
  description: {
    type: Sequelize.TEXT(),
    defaultValue: '',
  },
  email: {
    type: Sequelize.TEXT(),
    defaultValue: '',
  },
  link: {
    type: Sequelize.TEXT(),
    defaultValue: '',
  },
  secret: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  visible: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
  },
  visibleStart: {
    type: Sequelize.DATE,
    defaultValue: null,
  },
  visibleEnd: {
    type: Sequelize.DATE,
    defaultValue: null,
  },
  notice: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  order: {
    type: Sequelize.SMALLINT,
    defaultValue: 0,
  },
  viewCount: {
    type: Sequelize.FLOAT(),
    defaultValue: 0,
  },
  likeCount: {
    type: Sequelize.FLOAT(),
    defaultValue: 0,
  },
  commentCount: {
    type: Sequelize.FLOAT(),
    defaultValue: 0,
  },
  ip: {
    type: Sequelize.STRING(255),
    defaultValue: '',
  },
  device: {
    type: Sequelize.TEXT(),
    defaultValue: '',
  },
  field1: {
    type: Sequelize.TEXT(),
    defaultValue: '',
  },
  field2: {
    type: Sequelize.TEXT(),
    defaultValue: '',
  },
  field3: {
    type: Sequelize.TEXT(),
    defaultValue: '',
  },
  updater: {
    type: Sequelize.STRING(255),
    defaultValue: '',
  },
  deleter: {
    type: Sequelize.STRING(255),
    defaultValue: '',
  },
  createdAt: {
    type: Sequelize.DATE(3),
    allowNull: true,
  },
  updatedAt: {
    type: Sequelize.DATE(3),
    allowNull: true,
  },
  deletedAt: {
    type: Sequelize.DATE(3), // (3) 을 붙여야 Millisecond 기록됨
  },
};

module.exports = {
  schema,
  define: sequelize =>
    sequelize.define('article', schema, {
      timestamps: true,
      paranoid: true,
    }),
};
