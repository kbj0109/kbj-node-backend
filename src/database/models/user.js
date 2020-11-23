const Sequelize = require('sequelize');

const schema = {
  idx: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: Sequelize.STRING(255), // 사용자 ID
    allowNull: false,
    unique: true,
  },
  password: {
    type: Sequelize.STRING(255),
    allowNull: false,
  },
  level: {
    type: Sequelize.SMALLINT(),
    defaultValue: 0,
  },
  role: {
    type: Sequelize.STRING(255),
    defaultValue: '',
    allowNull: false,
  },
  name: {
    type: Sequelize.STRING(255),
    allowNull: false,
  },
  email: {
    type: Sequelize.TEXT(),
    defaultValue: '',
  },
  phoneNumber: {
    type: Sequelize.STRING(100),
    defaultValue: '',
  },
  address: {
    type: Sequelize.TEXT(),
    defaultValue: '',
  },
  address2: {
    type: Sequelize.TEXT(),
    defaultValue: '',
  },
  zipCode: {
    type: Sequelize.STRING(30),
    defaultValue: '',
  },
  salt: {
    type: Sequelize.STRING(100),
    allowNull: false,
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
    sequelize.define('user', schema, {
      timestamps: true,
      paranoid: true,
    }),
};
