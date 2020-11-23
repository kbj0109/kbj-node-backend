const { db } = require('../../database/models');

/**
 * 특정 게시판, 혹은 전체에서 인기있는 태그를 조회
 */
exports.listPopular = async ({ data, boardSetting }) => {
  const { limit } = data;
  const { TYPE: boardType } = boardSetting || {};

  const items = await db.Tag.findAll({
    attributes: [
      'content',
      [db.sequelize.fn('COUNT', db.sequelize.col('content')), 'count'],
    ],
    where: { ...(boardType && { boardType }) },
    limit,
    group: ['content'],
    order: [[db.sequelize.literal('count'), 'DESC']],
  });

  return items;
};
