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
  email: {
    type: Sequelize.TEXT(),
    defaultValue: '',
  },
  phoneNumber: {
    type: Sequelize.STRING(100),
    defaultValue: '',
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
  deleter: {
    type: Sequelize.STRING(255),
    defaultValue: '',
  },
  createdAt: {
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
    sequelize.define('contact', schema, {
      timestamps: true,
      paranoid: true,
      updatedAt: false,
    }),
};
