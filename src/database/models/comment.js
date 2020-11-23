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
  name: {
    type: Sequelize.STRING(255),
    defaultValue: '',
    allowNull: false,
  },
  password: {
    type: Sequelize.STRING(255),
    defaultValue: '',
    allowNull: false,
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
    type: Sequelize.TEXT('long'),
  },
  likeCount: {
    type: Sequelize.FLOAT(),
    defaultValue: 0,
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
    sequelize.define('comment', schema, {
      timestamps: true,
      paranoid: true,
      updatedAt: false,
    }),
};
