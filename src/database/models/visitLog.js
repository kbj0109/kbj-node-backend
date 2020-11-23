const Sequelize = require('sequelize');

const schema = {
  idx: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  id: {
    type: Sequelize.STRING(20),
    allowNull: false,
  },
  origin: {
    type: Sequelize.TEXT,
    defaultValue: '',
  },
  referer: {
    type: Sequelize.TEXT,
    defaultValue: '',
  },
  url: {
    type: Sequelize.TEXT,
    defaultValue: '',
  },
  ip: {
    type: Sequelize.STRING(255),
    defaultValue: '',
  },
  userAgent: {
    type: Sequelize.TEXT,
    defaultValue: '',
  },
  visitedAt: {
    type: Sequelize.DATE,
  },
};

module.exports = {
  schema,
  define: sequelize =>
    sequelize.define('visit_log', schema, {
      timestamps: false,
    }),
};
