const _ = require('lodash');
const FileService = require('../file');
const { db } = require('../../database/models');

module.exports = async ({ data, user, transaction }) => {
  const {
    id,
    subject,
    content,
    name,
    email,
    phoneNumber,
    attachFiles,
    ip,
    device,
  } = data;

  const mappingFiles = FileService.mappingFilesToPost({
    data: {
      attachFiles,
      userId: name,
      postId: id,
    },
    totalSizeLimit: 1024 * 1024 * 30,
    transaction,
  });

  const createContact = db.Contact.create(
    _.omitBy(
      {
        id,
        subject,
        content,
        attachFiles,
        name,
        userId: user ? user.userId : '',
        email,
        phoneNumber,
        ip,
        device,
      },
      _.isUndefined,
    ),
    { transaction },
  );

  const [contact] = await Promise.all([createContact, mappingFiles]);

  return contact;
};
