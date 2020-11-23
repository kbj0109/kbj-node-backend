const Sequelize = require('sequelize');

const schema = {
  idx: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  token: {
    type: Sequelize.TEXT(),
    allowNull: false,
  },
  userId: {
    type: Sequelize.STRING,
  },
  expired: {
    type: Sequelize.DATE(3),
    allowNull: false,
  },
  type: {
    type: Sequelize.STRING(255),
    defaultValue: '',
  },
  createdAt: {
    type: Sequelize.DATE(3),
    allowNull: true,
  },
};

module.exports = {
  schema,
  define: sequelize =>
    sequelize.define('token', schema, {
      timestamps: true,
      updatedAt: false,
    }),
};
