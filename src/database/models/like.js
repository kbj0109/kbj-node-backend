const Sequelize = require('sequelize');

const schema = {
  idx: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  postId: {
    type: Sequelize.STRING(50),
    allowNull: false,
  },
  userId: {
    type: Sequelize.STRING,
  },
  boardType: {
    type: Sequelize.STRING(255),
    allowNull: false,
  },
};

module.exports = {
  schema,
  define: sequelize =>
    sequelize.define('like', schema, {
      updatedAt: false,
      deletedAt: false,
    }),
};
