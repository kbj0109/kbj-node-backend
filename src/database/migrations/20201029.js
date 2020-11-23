const Sequelize = require('sequelize');
const _ = require('lodash');
const { db } = require('../models');

const table = 'replies';

module.exports = {
  up: async queryInterface => {
    await queryInterface.createTable(table, {
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
        field: 'user_id',
      },
      postId: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: 'post_id',
      },
      content: {
        type: Sequelize.TEXT('long'),
      },
      createdAt: {
        type: Sequelize.DATE(3),
        allowNull: true,
        field: 'created_at',
      },
    });

    const transaction = await queryInterface.sequelize.transaction();
    try {
      const items = await db.Comment.findAll({
        attributes: ['id', 'userId', 'postId', 'content', 'createdAt'],
        where: { boardType: '' },
        raw: true,
      });

      await Promise.all([
        db.Reply.bulkCreate(items, { transaction }),
        db.Comment.destroy({
          where: { id: items.map(item => item.id) },
          force: true,
          transaction,
        }),
      ]);

      transaction.commit();
    } catch (err) {
      await transaction.rollback();
      await queryInterface.dropTable(table);

      throw err;
    }
  },

  down: async queryInterface => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      const items = await db.Reply.findAll({
        attributes: ['id', 'userId', 'postId', 'content', 'createdAt'],
        raw: true,
      });
      const users = await db.User.findAll({
        where: { userId: _.uniq(items.map(item => item.userId)) },
      });

      const prevItems = items.map(item => {
        item.boardType = '';
        item.name = users.find(one => one.userId === item.userId).name;
        return item;
      });

      await db.Comment.bulkCreate(prevItems, { transaction });

      transaction.commit();

      await queryInterface.dropTable(table);
    } catch (err) {
      await transaction.rollback();

      throw err;
    }
  },
};
