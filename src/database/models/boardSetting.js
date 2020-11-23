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
  type: {
    type: Sequelize.STRING(255), // default / private 등등
    allowNull: false,
  },
  subject: {
    type: Sequelize.TEXT(), // 관리자 페이지에 입력될 board 타입 제목
    defaultValue: '',
  },
  createAuth: {
    type: Sequelize.STRING(255),
    defaultValue: '',
  },
  createLevel: {
    type: Sequelize.SMALLINT,
    defaultValue: 0,
  },
  createRole: {
    type: Sequelize.STRING(255),
    defaultValue: '',
    allowNull: false,
  },
  readListAuth: {
    type: Sequelize.STRING(255),
    defaultValue: '',
  },
  readListLevel: {
    type: Sequelize.SMALLINT,
    defaultValue: 0,
  },
  readListRole: {
    type: Sequelize.STRING(255),
    defaultValue: '',
    allowNull: false,
  },
  readAuth: {
    type: Sequelize.STRING(255),
    defaultValue: '',
  },
  readLevel: {
    type: Sequelize.SMALLINT,
    defaultValue: 0,
  },
  readRole: {
    type: Sequelize.STRING(255),
    defaultValue: '',
    allowNull: false,
  },
  updateAuth: {
    type: Sequelize.STRING(255),
    defaultValue: '',
  },
  updateLevel: {
    type: Sequelize.SMALLINT,
    defaultValue: 0,
  },
  updateRole: {
    type: Sequelize.STRING(255),
    defaultValue: '',
    allowNull: false,
  },
  deleteAuth: {
    type: Sequelize.STRING(255),
    defaultValue: '',
  },
  deleteLevel: {
    type: Sequelize.SMALLINT,
    defaultValue: 0,
  },
  deleteRole: {
    type: Sequelize.STRING(255),
    defaultValue: '',
    allowNull: false,
  },
  likeAuth: {
    type: Sequelize.STRING(255),
    defaultValue: '',
  },
  likeLevel: {
    type: Sequelize.SMALLINT,
    defaultValue: 0,
  },
  likeRole: {
    type: Sequelize.STRING(255),
    defaultValue: '',
    allowNull: false,
  },
  useComment: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
  },
  commentCreateAuth: {
    type: Sequelize.STRING(255),
    defaultValue: '',
  },
  commentCreateLevel: {
    type: Sequelize.SMALLINT,
    defaultValue: 0,
  },
  commentCreateRole: {
    type: Sequelize.STRING(255),
    defaultValue: '',
    allowNull: false,
  },
  commentReadListAuth: {
    type: Sequelize.STRING(255),
    defaultValue: '',
  },
  commentReadListLevel: {
    type: Sequelize.SMALLINT,
    defaultValue: 0,
  },
  commentReadListRole: {
    type: Sequelize.STRING(255),
    defaultValue: '',
    allowNull: false,
  },
  commentDeleteAuth: {
    type: Sequelize.STRING(255),
    defaultValue: '',
  },
  commentDeleteLevel: {
    type: Sequelize.SMALLINT,
    defaultValue: 0,
  },
  commentDeleteRole: {
    type: Sequelize.STRING(255),
    defaultValue: '',
    allowNull: false,
  },
  commentLikeAuth: {
    type: Sequelize.STRING(255),
    defaultValue: '',
  },
  commentLikeLevel: {
    type: Sequelize.SMALLINT,
    defaultValue: 0,
  },
  commentLikeRole: {
    type: Sequelize.STRING(255),
    defaultValue: '',
    allowNull: false,
  },
  fileCreateAuth: {
    type: Sequelize.STRING(255),
    defaultValue: '',
  },
  fileCreateLevel: {
    type: Sequelize.SMALLINT,
    defaultValue: 0,
  },
  fileCreateRole: {
    type: Sequelize.STRING(255),
    defaultValue: '',
    allowNull: false,
  },
  fileReadAuth: {
    type: Sequelize.STRING(255),
    defaultValue: '',
  },
  fileReadLevel: {
    type: Sequelize.SMALLINT,
    defaultValue: 0,
  },
  fileReadRole: {
    type: Sequelize.STRING(255),
    defaultValue: '',
    allowNull: false,
  },
  attachImageSize: {
    type: Sequelize.BIGINT, // 단일 이미지 제한 용량
    defaultValue: 0,
  },
  attachFileSize: {
    type: Sequelize.BIGINT, // 개별 파일 제한 용량
    defaultValue: 0,
  },
  attachFileSizeTotal: {
    type: Sequelize.BIGINT, // 글 전체 첨부된 파일 제한 용량
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
    sequelize.define('board_setting', schema, {
      timestamps: true,
      paranoid: true,
    }),
};
