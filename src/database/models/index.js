const mysql = require('mysql2');
const Sequelize = require('sequelize'); // sequelize는 JS 명령어를 SQL로 바꿔준다. mysql 이외에도 MariaDB, PostgreSQL 등 다른 것과도 호환 가능

const User = require('./user');
const BoardSetting = require('./boardSetting');
const Token = require('./token');
const Article = require('./article');
const File = require('./file');
const Image = require('./image');
const Like = require('./like');
const Comment = require('./comment');
const Tag = require('./tag');
const Contact = require('./contact');
const Banner = require('./banner');
const Popup = require('./popup');
const VisitLog = require('./visitLog');
const Reply = require('./reply');

const config = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

const mysqlCon = mysql.createPool({
  host: config.host,
  user: config.username,
  password: config.password,
  // database: config.database,
  port: config.port,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// 1. DB가 연결될 정보를 가진 sequelize 객체 생성
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: 'mysql',
    port: config.port,
    // timezone: 'Asia/Seoul',
    define: {
      underscored: true,
      charset: 'utf8',
      dialectOptions: {
        collate: 'utf8_general_ci',
        useUTC: true,
      },
    },

    logging: false, // Query 실행문 로그 Off
  },
);

// 2. DB 정의
const db = {
  config,
  sequelize,
  Sequelize,
  User: User.define(sequelize),
  BoardSetting: BoardSetting.define(sequelize),
  Token: Token.define(sequelize),
  Article: Article.define(sequelize),
  File: File.define(sequelize),
  Image: Image.define(sequelize),
  Like: Like.define(sequelize),
  Comment: Comment.define(sequelize),
  Tag: Tag.define(sequelize),
  Contact: Contact.define(sequelize),
  Banner: Banner.define(sequelize),
  Popup: Popup.define(sequelize),
  VisitLog: VisitLog.define(sequelize),
  Reply: Reply.define(sequelize),
};

db.User.hasMany(db.Token, {
  foreignKey: 'userId',
  sourceKey: 'userId',
});

exports.mysqlCon = mysqlCon;
exports.db = db;
