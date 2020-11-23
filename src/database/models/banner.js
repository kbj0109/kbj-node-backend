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
  type: {
    type: Sequelize.STRING(255),
    defaultValue: '',
    allowNull: false,
  },
  attachFiles: {
    type: Sequelize.JSON,
    defaultValue: [],
  },
  description: {
    type: Sequelize.TEXT,
    defaultValue: '',
    allowNull: false,
  },
  link: {
    type: Sequelize.TEXT,
    defaultValue: '',
    allowNull: false,
  },
  target: {
    type: Sequelize.STRING(255),
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
  order: {
    type: Sequelize.SMALLINT,
    defaultValue: 0,
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
    sequelize.define('banner', schema, {
      timestamps: true,
      paranoid: true,
    }),
};
