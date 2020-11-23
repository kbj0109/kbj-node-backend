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
  },
  postId: {
    type: Sequelize.STRING(50),
    allowNull: false,
  },
  content: {
    type: Sequelize.TEXT('long'),
  },
  createdAt: {
    type: Sequelize.DATE(3),
    allowNull: true,
  },
};

module.exports = {
  schema,
  define: sequelize =>
    sequelize.define('reply', schema, {
      timestamps: true,
      updatedAt: false,
    }),
};
