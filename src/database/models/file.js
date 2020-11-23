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
  fileName: {
    type: Sequelize.TEXT(),
    allowNull: false,
  },
  fileSize: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  mimeType: {
    type: Sequelize.STRING(255),
    defaultValue: '',
  },
  postId: {
    type: Sequelize.STRING(50),
    defaultValue: '',
  },
  boardType: {
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
    sequelize.define('file', schema, {
      timestamps: true,
      paranoid: true,
      updatedAt: false,
    }),
};
