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
  boardType: {
    type: Sequelize.STRING(255),
    allowNull: false,
  },
  content: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
};

module.exports = {
  schema,
  define: sequelize =>
    sequelize.define('tag', schema, {
      timestamps: true,
      paranoid: true,
      updatedAt: false,
    }),
};
