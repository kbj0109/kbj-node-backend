const createError = require('http-errors');

const user = require('./user');
const auth = require('./auth');
const article = require('./article');
const file = require('./file');
const admin = require('./admin');
const contact = require('./contact');
const statistic = require('./statistic');
const docs = require('./docs');

module.exports = app => {
  app.use('/auth', auth);
  app.use('/user', user);
  app.use('/articles', article);
  app.use('/file', file);
  app.use('/admin', admin);
  app.use('/contact', contact);
  app.use('/statistic', statistic);
  app.use('/docs', docs);

  // 정의되지 않은 Route 경로 처리
  app.use('*', (req, res, next) => {
    next(createError(404));
  });
};
