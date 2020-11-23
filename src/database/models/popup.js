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
    type: Sequelize.STRING(255),
    defaultValue: '',
  },
  subject: {
    type: Sequelize.TEXT,
    defaultValue: '',
  },
  content: {
    type: Sequelize.TEXT,
    defaultValue: '',
  },
  type: {
    type: Sequelize.STRING(255),
    defaultValue: '',
    allowNull: false,
  },
  width: {
    type: Sequelize.STRING(50),
    defaultValue: '',
    allowNull: false,
  },
  height: {
    type: Sequelize.STRING(50),
    defaultValue: '',
    allowNull: false,
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
    type: Sequelize.DATE(3),
  },
};

module.exports = {
  schema,
  define: sequelize =>
    sequelize.define('popup', schema, {
      timestamps: true,
      paranoid: true,
    }),
};
