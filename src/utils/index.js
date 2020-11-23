const { v4: uuid } = require('uuid');
const fs = require('fs-extra');
const chalk = require('chalk');
const nunjucks = require('nunjucks');
const { Op } = require('sequelize');
const { db } = require('../database/models');
const { ROOT_PATH } = require('../config');

exports.uuid = () => {
  const tokens = uuid().split('-');
  return `${tokens[2]}${tokens[1]}${tokens[0]}${tokens[3]}${tokens[4]}`;
};

/** 약 30글자 정도 되는 랜덤 난수를 생성 */
exports.getRandomToken = () => {
  return (
    Math.random().toString(36).substring(2, 12) +
    Math.random().toString(36).substring(2, 12) +
    Math.random().toString(36).substring(2, 12)
  );
};

/** 특정 길이의 랜덤 숫자를 생성한다 */
exports.getRandomDigits = ({ length }) =>
  Array.from({ length })
    .map(() => Math.floor(Math.random() * 10))
    .join('');

/** Multiple 미들웨어 결합  */
exports.combineMiddleware = function combineMiddleware(middlewares) {
  if (!middlewares.length) {
    return (_req, _res, next) => {
      next();
    };
  }
  const head = middlewares[0];
  const tail = middlewares.slice(1);

  return (req, res, next) => {
    head(req, res, err => {
      if (err) {
        next(err);
        return;
      }
      combineMiddleware(tail)(req, res, next);
    });
  };
};

/** async error wrapper with transaction */
exports.wrapTransaction = asnycFn => async (req, res, next) => {
  const transaction = await db.sequelize.transaction();

  try {
    await asnycFn(req, res, next, transaction);
    transaction.commit();
  } catch (err) {
    transaction.rollback();
    next(err);
  }
};

/** async error wrapper */
exports.wrapAsync = asnycFn => async (req, res, next) => {
  try {
    await asnycFn(req, res, next);
  } catch (err) {
    next(err);
  }
};

/** 특정 Timestamp를 yyyy-mm-dd 날짜 형식으로 리턴 */
exports.getDate = timestamp => {
  const time = new Date(timestamp);

  const year = time.getFullYear();
  const month = `0${time.getMonth() + 1}`.substr(-2);
  const day = `0${time.getDate()}`.substr(-2);
  return `${year}-${month}-${day}`;
};

exports.deleteFolders = async (folderPathArray = []) => {
  try {
    const arr = folderPathArray.map(folderPath => fs.remove(folderPath));
    await Promise.all(arr);
  } catch (err) {
    console.log(chalk.red('폴더 삭제 Exception - '), err);
  }
};

exports.templateRender = ({ htmlPath, data = {} }) => {
  nunjucks.configure(`${ROOT_PATH}/src`);
  const template = nunjucks.render(htmlPath, data);

  return template;
};

// 정렬 쿼리
exports.getSortQuery = ({
  sortOptions = { create: 'createdAt', update: 'updatedAt' },
  sort = 'createDesc',
  forceDirection,
}) => {
  const columnType = sort.toLowerCase();
  const sortDirection = columnType.includes('asc') ? 'ASC' : 'DESC';
  const column = Object.entries(sortOptions).reduce(
    (acc, [key, value]) => (columnType.includes(key) ? value : acc),
    'idx',
  );
  const direction = forceDirection || sortDirection;
  const order = [
    [column, direction],
    ['idx', direction],
  ];

  return order;
};

// 검색 쿼리
exports.getSearchQuery = ({
  search = '',
  searchKeyword = '',
  searchColumns = [],
}) => {
  search = search.toLowerCase();

  // 검색 조건 구하기
  const searchQuerys = searchColumns
    .filter(column => search.includes(column.toLowerCase()))
    .map(column => ({ [column]: { [Op.like]: `%${searchKeyword}%` } }));

  return searchQuerys.length ? { [Op.or]: searchQuerys } : {};
};
